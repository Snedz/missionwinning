import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { isCold, quietThresholdDays } from '@/lib/reentryTone';
import {
  anonymousComebackPush,
  dayReviewPush,
  decideNudge,
  utcDay,
  windDownPush,
} from '@/lib/nudgeCopy';
import { localHourFor, windDownDue } from '@/lib/windDown';
import { dayReviewDue } from '@/lib/dayReviewNudge';
import type { NudgeCandidate, NudgeKind } from '@/lib/nudgeCopy';

/**
 * Retention nudge IO (beta-scale: computes candidates in JS over the opted-in
 * cohort — fine for hundreds of users, revisit past that).
 *
 * The *words* and the rule for which message is due live in `nudgeCopy.ts`, which
 * carries no `server-only` and is therefore unit-testable. Everything here touches
 * the database or a secret.
 */

export type { NudgeCandidate, NudgeKind };
export { decideNudge };

const NUDGE_COOLDOWN_MS = 44 * 60 * 60 * 1000;

function nudgeSecret(): string {
  const dedicated = process.env.NUDGE_SECRET?.trim();
  if (dedicated) return dedicated;
  if (process.env.NODE_ENV === 'production') return '';
  return process.env.PRIVATE_ACCESS_SECRET || '';
}

export function unsubscribeToken(userId: string): string {
  return createHmac('sha256', nudgeSecret()).update(`unsub:${userId}`).digest('hex');
}

export function verifyUnsubscribeToken(userId: string, token: string): boolean {
  if (!nudgeSecret() || !token) return false;
  const expected = Buffer.from(unsubscribeToken(userId));
  const given = Buffer.from(token);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export interface NudgeRunResult {
  considered: number;
  candidates: NudgeCandidate[];
}

/** Collect nudge candidates across the opted-in cohort. */
export async function collectNudgeCandidates(now = new Date()): Promise<NudgeRunResult> {
  const admin = getSupabaseAdmin();
  if (!admin) throw new Error('Supabase admin not configured (SUPABASE_SERVICE_ROLE_KEY)');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.missionwinning.com';
  const cooldownCutoff = new Date(now.getTime() - NUDGE_COOLDOWN_MS).toISOString();

  const { data: profiles, error } = await admin
    .from('profiles')
    .select('id, email, created_at, last_nudge_at')
    .eq('reminders_opt_in', true)
    .not('email', 'is', null)
    .or(`last_nudge_at.is.null,last_nudge_at.lt.${cooldownCutoff}`)
    .limit(500);

  if (error || !profiles) {
    throw new Error(`nudge candidate query failed: ${error?.message ?? 'no data'}`);
  }

  const since = new Date(now.getTime() - 14 * 86_400_000).toISOString();
  const candidates: NudgeCandidate[] = [];
  const eligible = profiles.filter((p): p is typeof p & { email: string } => !!p.email);
  if (eligible.length === 0) {
    return { considered: profiles.length, candidates };
  }

  const userIds = eligible.map((p) => p.id);
  // One batched fetch instead of N per-user queries (was O(n) round-trips).
  const { data: allLogs } = await admin
    .from('workout_logs')
    .select('user_id, completed_at, total_volume')
    .in('user_id', userIds)
    .gte('completed_at', since)
    .order('completed_at', { ascending: false })
    .limit(Math.min(userIds.length * 60, 30_000));

  const logsByUser = new Map<string, { completed_at: string; total_volume: number | null }[]>();
  for (const row of allLogs ?? []) {
    const uid = row.user_id as string;
    const list = logsByUser.get(uid);
    if (list) {
      if (list.length < 60) list.push(row);
    } else {
      logsByUser.set(uid, [row]);
    }
  }

  // Cadence lives on the device row, not on `profiles` — it is the only place the
  // server learns how often this athlete actually intends to train. Absent (no push
  // subscription), decideNudge falls back to its own default rather than assuming 7.
  const cadenceByUser = new Map<string, number>();
  const { data: cadenceRows } = await admin
    .from('push_subscriptions')
    .select('user_id, days_per_week')
    .in('user_id', userIds)
    .not('days_per_week', 'is', null);
  for (const row of cadenceRows ?? []) {
    const uid = row.user_id as string | null;
    const dpw = row.days_per_week as number | null;
    if (uid && dpw) cadenceByUser.set(uid, dpw);
  }

  for (const profile of eligible) {
    const logs = logsByUser.get(profile.id) ?? [];
    const workoutDays = [...new Set(logs.map((l) => utcDay(l.completed_at)))];
    const candidate = decideNudge({
      email: profile.email,
      userId: profile.id,
      createdAt: profile.created_at,
      workoutDays,
      workoutCount14d: logs.length,
      totalVolume14d: logs.reduce((s, l) => s + (l.total_volume ?? 0), 0),
      daysPerWeek: cadenceByUser.get(profile.id),
      now,
      appUrl,
      unsubscribeUrl: `${appUrl}/api/nudges/unsubscribe?u=${profile.id}&t=${unsubscribeToken(profile.id)}`,
    });
    if (candidate) candidates.push(candidate);
  }

  return { considered: profiles.length, candidates };
}

/**
 * A device with no account. Reached by web push only — there is no address, and
 * asking for one is the account we promised not to require.
 */
export interface AnonymousNudgeCandidate {
  endpoint: string;
  deviceId: string;
  kind: NudgeKind;
  title: string;
  body: string;
}

/**
 * Candidates among anonymous devices.
 *
 * Only `comeback` is possible here, and that is the privacy contract working as
 * intended rather than a gap: the server holds a last-session date and a cadence, so
 * it can tell that someone has gone quiet. It cannot count this week's sessions or
 * sum volume, so `week-behind` and `week1-recap` have nothing to be computed from.
 * Sets stay on the device.
 */
export async function collectAnonymousNudgeCandidates(now = new Date()): Promise<{
  considered: number;
  candidates: AnonymousNudgeCandidate[];
}> {
  const admin = getSupabaseAdmin();
  if (!admin) throw new Error('Supabase admin not configured (SUPABASE_SERVICE_ROLE_KEY)');
  const cooldownCutoff = new Date(now.getTime() - NUDGE_COOLDOWN_MS).toISOString();

  const { data: rows, error } = await admin
    .from('push_subscriptions')
    .select('endpoint, device_id, last_session_at, days_per_week, last_nudge_at')
    .is('user_id', null)
    .not('last_session_at', 'is', null)
    .or(`last_nudge_at.is.null,last_nudge_at.lt.${cooldownCutoff}`)
    .limit(500);

  if (error || !rows) {
    throw new Error(`anonymous nudge query failed: ${error?.message ?? 'no data'}`);
  }

  const candidates: AnonymousNudgeCandidate[] = [];
  for (const row of rows) {
    const deviceId = row.device_id as string | null;
    const lastSession = row.last_session_at as string | null;
    if (!deviceId || !lastSession) continue;

    const quietDays = Math.floor(
      (now.getTime() - new Date(lastSession).getTime()) / 86_400_000
    );
    if (isCold(quietDays)) continue;

    const cadence = (row.days_per_week as number | null) ?? 3;
    if (quietDays < quietThresholdDays(cadence)) continue;

    candidates.push({
      endpoint: row.endpoint as string,
      deviceId,
      kind: 'comeback',
      ...anonymousComebackPush(),
    });
  }

  return { considered: rows.length, candidates };
}

export async function markAnonymousNudged(
  endpoints: string[],
  now = new Date()
): Promise<void> {
  if (endpoints.length === 0) return;
  const admin = getSupabaseAdmin();
  if (!admin) return;
  await admin
    .from('push_subscriptions')
    .update({ last_nudge_at: now.toISOString() })
    .in('endpoint', endpoints);
}

export async function markNudged(userIds: string[], now = new Date()): Promise<void> {
  if (userIds.length === 0) return;
  const admin = getSupabaseAdmin();
  if (!admin) return;
  await admin
    .from('profiles')
    .update({ last_nudge_at: now.toISOString() })
    .in('id', userIds);
}

export async function setRemindersOptOut(userId: string): Promise<boolean> {
  const admin = getSupabaseAdmin();
  if (!admin) return false;
  const { error } = await admin
    .from('profiles')
    .update({ reminders_opt_in: false })
    .eq('id', userId);
  return !error;
}

/**
 * Devices due a wind-down note right now.
 *
 * Deliberately **no `user_id` filter**: the device row is the channel for signed-in
 * and anonymous athletes alike, and the device that synced the "ran hot" bit is the
 * same device holding the history behind the deep link. Whether an account exists is
 * irrelevant to this kind.
 *
 * Note what is *not* here: no join to `workout_logs`, no tonnage, no zone. The server
 * reads one boolean and three timestamps. Everything that decided the boolean happened
 * on the device.
 */
/** Shared by both evening kinds — same row shape, different due-rule and marker. */
export interface WindDownCandidate {
  endpoint: string;
  deviceId: string;
  kind: 'wind-down' | 'day-review';
  title: string;
  body: string;
  /**
   * `.228` — carried, not re-declared at the send site.
   *
   * Both cron routes had their own `tag: 'mw-…'` literal beside a comment
   * explaining why it must be distinct, while `windDownPush()` / `dayReviewPush()`
   * sat one import away without one. Two spellings of one fact is how the third
   * kind ends up sharing a tag by accident (`.178`); the copy owns it now and
   * these routes spread it.
   */
  tag: string;
  /** For dryRun only — lets the founder check the window maths from the response. */
  timeZone: string;
  localHour: number | null;
}

export async function collectWindDownCandidates(now = new Date()): Promise<{
  considered: number;
  candidates: WindDownCandidate[];
}> {
  const admin = getSupabaseAdmin();
  if (!admin) throw new Error('Supabase admin not configured (SUPABASE_SERVICE_ROLE_KEY)');

  const { data: rows, error } = await admin
    .from('push_subscriptions')
    .select('endpoint, device_id, last_session_at, last_session_high, last_wind_down_at, time_zone')
    .eq('last_session_high', true)
    .not('last_session_at', 'is', null)
    .not('time_zone', 'is', null)
    .limit(500);

  if (error || !rows) {
    throw new Error(`wind-down query failed: ${error?.message ?? 'no data'}`);
  }

  const copy = windDownPush();
  const candidates: WindDownCandidate[] = [];

  for (const row of rows) {
    const deviceId = row.device_id as string | null;
    const timeZone = row.time_zone as string | null;
    if (!deviceId || !timeZone) continue;

    const due = windDownDue(
      {
        lastSessionAt: row.last_session_at as string | null,
        lastSessionHigh: Boolean(row.last_session_high),
        lastWindDownAt: (row.last_wind_down_at as string | null) ?? null,
        timeZone,
      },
      now
    );
    if (!due) continue;

    candidates.push({
      endpoint: row.endpoint as string,
      deviceId,
      kind: 'wind-down',
      timeZone,
      localHour: localHourFor(now, timeZone),
      ...copy,
    });
  }

  return { considered: rows.length, candidates };
}

export async function markWindDownSent(endpoints: string[], now = new Date()): Promise<void> {
  if (endpoints.length === 0) return;
  const admin = getSupabaseAdmin();
  if (!admin) return;
  await admin
    .from('push_subscriptions')
    .update({ last_wind_down_at: now.toISOString() })
    .in('endpoint', endpoints);
}

/**
 * Candidates for the evening day-review doorbell.
 *
 * Selects only rows that opted in (`day_review_hour` non-null), and reads
 * `last_wind_down_at` purely so the one-push-per-evening precedence can be
 * evaluated — wind-down wins, see `dayReviewNudge.ts`.
 *
 * The selected columns are the whole story: a chosen hour, two markers and a
 * zone. Nothing about what the athlete logged travels here, because nothing
 * about what they logged is stored here.
 */
export async function collectDayReviewCandidates(now = new Date()): Promise<{
  considered: number;
  candidates: WindDownCandidate[];
}> {
  const admin = getSupabaseAdmin();
  if (!admin) throw new Error('Supabase admin not configured (SUPABASE_SERVICE_ROLE_KEY)');

  const { data: rows, error } = await admin
    .from('push_subscriptions')
    .select('endpoint, device_id, day_review_hour, last_day_review_at, last_wind_down_at, time_zone')
    .not('day_review_hour', 'is', null)
    .not('time_zone', 'is', null)
    .limit(500);

  if (error || !rows) {
    throw new Error(`day-review query failed: ${error?.message ?? 'no data'}`);
  }

  const copy = dayReviewPush();
  const candidates: WindDownCandidate[] = [];

  for (const row of rows) {
    const deviceId = row.device_id as string | null;
    const timeZone = row.time_zone as string | null;
    if (!deviceId || !timeZone) continue;

    const due = dayReviewDue(
      {
        dayReviewHour: (row.day_review_hour as number | null) ?? null,
        lastDayReviewAt: (row.last_day_review_at as string | null) ?? null,
        lastWindDownAt: (row.last_wind_down_at as string | null) ?? null,
        timeZone,
      },
      now
    );
    if (!due) continue;

    candidates.push({
      endpoint: row.endpoint as string,
      deviceId,
      kind: 'day-review',
      timeZone,
      localHour: localHourFor(now, timeZone),
      ...copy,
    });
  }

  return { considered: rows.length, candidates };
}

/** Own marker column — sharing one would let a kind silently suppress the other. */
export async function markDayReviewSent(endpoints: string[], now = new Date()): Promise<void> {
  if (endpoints.length === 0) return;
  const admin = getSupabaseAdmin();
  if (!admin) return;
  await admin
    .from('push_subscriptions')
    .update({ last_day_review_at: now.toISOString() })
    .in('endpoint', endpoints);
}
