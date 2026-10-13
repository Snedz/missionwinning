/**
 * Weekly logger rollup (ISO week) for accountless and signed-in athletes.
 * Auth: optional session | Rate: 60/min/IP | Body: Zod weekLoggedBodySchema
 * See: app/api/INDEX.md, docs/POST_LAUNCH_CADENCE.md, src/lib/weekLoggedRow.ts
 *
 * Why this used to be 401-for-everyone-without-a-session:
 * the north-star metric is "week-4 retained weekly loggers", but `week_logged.user_id`
 * was `not null references auth.users`, so only an account could produce a row. The
 * product's promise is "no account required, offline-first, local storage" — which means
 * the modal athlete could never appear in the one number the project judges itself on.
 * Every value the metric had ever produced was drawn from the minority who signed up.
 *
 * The guard is now a real one rather than an absent one. An accountless write must
 * carry a device id AND that device must already hold a push subscription — consent
 * checked server-side against `push_subscriptions`, never asserted by the caller.
 * A signed-in caller needs no such consent: an account is its own identity.
 *
 * Same posture as /api/push/subscribe: one service-role route, no public RLS policy.
 * A public policy here would let anyone enumerate device rows, which is a worse trade
 * than a single server route.
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { getUserFromRequest } from '@/lib/supabaseRequestAuth';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { rateLimitAsync } from '@/lib/rateLimit';
import { clientIp } from '@/lib/clientIp';
import { parseJsonBody, weekLoggedBodySchema } from '@/lib/apiSchemas';
import { rejectOversizedBody } from '@/lib/requestBodyLimit';
import { buildWeekLoggedRow, resolveWeekLoggedOwner } from '@/lib/weekLoggedRow';

/** One row per athlete per ISO week, so a burst is a client bug, not a workload. */
const RATE_LIMIT = 60;
const RATE_WINDOW_MS = 60_000;

/**
 * Does this device hold a return-channel subscription? Server-side, never client-asserted.
 *
 * A missing admin client is treated as "no consent" rather than "yes" — the one failure
 * mode of an unreachable lookup must be the one that refuses the write.
 */
async function deviceHasPushConsent(deviceId: string): Promise<boolean> {
  const admin = getSupabaseAdmin();
  if (!admin) return false;
  const { data, error } = await admin
    .from('push_subscriptions')
    .select('device_id')
    .eq('device_id', deviceId)
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error('[metrics/week-logged] consent lookup: %s', error.message);
    return false;
  }
  return !!data;
}

export const POST = withApiLogging('metrics/week-logged', async (request: NextRequest) => {
  const oversized = rejectOversizedBody(request);
  if (oversized) return oversized;

  const ip = clientIp(request);
  const limited = await rateLimitAsync(`week-logged:${ip}`, RATE_LIMIT, RATE_WINDOW_MS);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec ?? 60) } }
    );
  }

  const raw = await request.json().catch(() => null);
  const parsed = parseJsonBody(weekLoggedBodySchema, raw);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const user = await getUserFromRequest(request);
  const deviceId = parsed.data.deviceId;

  // Only an accountless write costs a round trip; a session already answers the question.
  const consented =
    user || typeof deviceId !== 'string' ? undefined : await deviceHasPushConsent(deviceId);

  const resolved = resolveWeekLoggedOwner({
    userId: user?.id ?? null,
    deviceId,
    hasPushConsent: consented,
  });

  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.reason }, { status: 403 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ ok: true, stored: false });
  }

  const row = buildWeekLoggedRow(resolved, parsed.data.isoWeek);
  const { error } = await admin
    .from('week_logged')
    .upsert(row, { onConflict: 'owner_key,iso_week' });

  if (error) {
    console.error('[metrics/week-logged] %s', error.message);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, stored: true, owner: resolved.owner });
});
