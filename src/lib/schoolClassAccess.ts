/**
 * Resolve teacher PIN or creator access for school class APIs.
 * Consumers: stats, leaderboard, export routes
 */
import 'server-only';
import type { NextRequest } from 'next/server';
import { canAccessTeacherDashboard } from '@/lib/schoolClassServer';
import { normalizeClassCode } from '@/lib/schoolClass';
import { getUserFromRequest } from '@/lib/supabaseRequestAuth';
import { rateLimitAsync } from '@/lib/rateLimit';
import { clientIp } from '@/lib/clientIp';

export const TEACHER_PIN_HEADER = 'x-teacher-pin';

/** Resolve teacher dashboard access from session and/or PIN (header or body). */
export async function resolveTeacherClassAccess(
  request: NextRequest,
  rawCode: string,
  pinFromBody?: string | null
): Promise<
  | { ok: true; code: string; isCreator: boolean }
  | { ok: false; code: string | null; status: number; error: string }
> {
  const code = normalizeClassCode(rawCode);
  if (!code) {
    return { ok: false, code: null, status: 400, error: 'Invalid class code' };
  }

  const user = await getUserFromRequest(request);
  const headerPin = request.headers.get(TEACHER_PIN_HEADER)?.trim() ?? '';
  const pin = pinFromBody?.trim() || headerPin || null;

  /*
   * `.211` — the PIN was brute-forceable through this function's own consumers.
   *
   * `/api/school/class/[code]/verify` rate-limits PIN attempts at 5/minute. Its
   * three siblings — `stats`, `leaderboard` and `export` — authenticate through
   * exactly the same PIN and had **no limit at all**, so an attacker simply
   * guessed against those instead. `export` returns a CSV of student names and
   * scores.
   *
   * The limit belongs here rather than at each call site, so the next route that
   * asks this function for access inherits it. Only PIN attempts are counted:
   * a signed-in creator is authenticated by session and should not be throttled
   * by someone else guessing at the same class code.
   */
  if (pin) {
    const rl = await rateLimitAsync(`school-pin:${clientIp(request)}:${code}`, 5, 60_000);
    if (!rl.ok) {
      return { ok: false, code, status: 429, error: 'Too many attempts' };
    }
  }

  const access = await canAccessTeacherDashboard(code, user?.id ?? null, pin);
  if (!access.unlocked) {
    return { ok: false, code, status: 401, error: 'Unauthorized' };
  }

  return { ok: true, code, isCreator: access.isCreator };
}
