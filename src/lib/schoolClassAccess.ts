/**
 * Resolve teacher PIN or creator access for school class APIs.
 * Consumers: stats, leaderboard, export routes
 */
import 'server-only';
import type { NextRequest } from 'next/server';
import { canAccessTeacherDashboard } from '@/lib/schoolClassServer';
import { normalizeClassCode } from '@/lib/schoolClass';
import { getUserFromRequest } from '@/lib/supabaseRequestAuth';

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

  const access = await canAccessTeacherDashboard(code, user?.id ?? null, pin);
  if (!access.unlocked) {
    return { ok: false, code, status: 401, error: 'Unauthorized' };
  }

  return { ok: true, code, isCreator: access.isCreator };
}
