import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * Retention nudge engine (beta-scale: computes candidates in JS over the
 * opted-in cohort — fine for hundreds of users, revisit past that).
 *
 * Rules (first match wins, max one email per user per 44h):
 *  - streak-at-risk: 3+ day streak alive through yesterday, nothing logged today
 *  - comeback:       3–13 days since last workout (or none yet, 3–13 days after joining)
 *  - week-1 recap:   joined 6–8 days ago and trained at least once
 */

export type NudgeKind = 'streak-at-risk' | 'comeback' | 'week1-recap';

export interface NudgeCandidate {
  userId: string;
  email: string;
  kind: NudgeKind;
  subject: string;
  body: string;
}

const NUDGE_COOLDOWN_MS = 44 * 60 * 60 * 1000;

function nudgeSecret(): string {
  return process.env.NUDGE_SECRET || process.env.PRIVATE_ACCESS_SECRET || '';
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

function utcDay(d: string | Date): string {
  return new Date(d).toISOString().slice(0, 10);
}

function dayOffset(base: Date, days: number): string {
  const d = new Date(base);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

/** Consecutive training days counting back from `fromOffset` days ago. */
function streakThrough(days: Set<string>, now: Date, fromOffset: number): number {
  let streak = 0;
  for (let i = fromOffset; ; i++) {
    if (days.has(dayOffset(now, i))) streak++;
    else break;
  }
  return streak;
}

export function decideNudge(input: {
  email: string;
  userId: string;
  createdAt: string;
  workoutDays: string[]; // UTC yyyy-mm-dd of completed workouts, last 14d
  workoutCount14d: number;
  totalVolume14d: number;
  now?: Date;
  appUrl: string;
}): NudgeCandidate | null {
  const now = input.now ?? new Date();
  const days = new Set(input.workoutDays);
  const today = utcDay(now);
  const link = `${input.appUrl}/log`;
  const unsub = `${input.appUrl}/api/nudges/unsubscribe?u=${input.userId}&t=${unsubscribeToken(input.userId)}`;
  const footer = [
    '',
    'Health for everyone, everywhere. The free core stays free.',
    `Stop training reminders: ${unsub}`,
  ].join('\n');

  // Streak at risk: trained yesterday (streak >= 3), nothing yet today.
  const streak = streakThrough(days, now, 1);
  if (!days.has(today) && streak >= 3) {
    return {
      userId: input.userId,
      email: input.email,
      kind: 'streak-at-risk',
      subject: `Your ${streak}-day streak ends tonight`,
      body: [
        `Mission Winning — ${streak} days in a row. That's a real habit forming.`,
        '',
        'One short session today keeps it alive — even 10 minutes counts.',
        '',
        `Start now: ${link}`,
        footer,
      ].join('\n'),
    };
  }

  // Week-1 recap: joined 6–8 days ago and actually trained.
  const joinedDaysAgo = Math.floor((now.getTime() - new Date(input.createdAt).getTime()) / 86_400_000);
  if (joinedDaysAgo >= 6 && joinedDaysAgo <= 8 && input.workoutCount14d > 0) {
    return {
      userId: input.userId,
      email: input.email,
      kind: 'week1-recap',
      subject: `Week one: ${input.workoutCount14d} session${input.workoutCount14d === 1 ? '' : 's'} logged`,
      body: [
        'Mission Winning — your first week on the path:',
        '',
        `Sessions: ${input.workoutCount14d}`,
        `Volume moved: ${Math.round(input.totalVolume14d).toLocaleString()}`,
        '',
        'Most people quit in week one. You didn’t. Week two is where the habit locks in.',
        '',
        `Keep going: ${link}`,
        footer,
      ].join('\n'),
    };
  }

  // Comeback: 3–13 days quiet (counting from last workout, or from joining if none).
  const sorted = [...days].sort();
  const lastDay = sorted[sorted.length - 1];
  const referenceDay = lastDay ?? utcDay(input.createdAt);
  const quietDays = Math.floor((now.getTime() - new Date(`${referenceDay}T00:00:00Z`).getTime()) / 86_400_000);
  if (quietDays >= 3 && quietDays <= 13) {
    return {
      userId: input.userId,
      email: input.email,
      kind: 'comeback',
      subject: 'One session gets you back on the path',
      body: [
        `Mission Winning — it's been ${quietDays} days. That's nothing; the path is still right where you left it.`,
        '',
        'Your next step is one 10-minute session. No catch-up needed, no guilt — just start.',
        '',
        `Start now: ${link}`,
        footer,
      ].join('\n'),
    };
  }

  return null;
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

  for (const profile of profiles) {
    if (!profile.email) continue;
    const { data: logs } = await admin
      .from('workout_logs')
      .select('completed_at, total_volume')
      .eq('user_id', profile.id)
      .gte('completed_at', since)
      .order('completed_at', { ascending: false })
      .limit(60);

    const workoutDays = [...new Set((logs ?? []).map((l) => utcDay(l.completed_at)))];
    const candidate = decideNudge({
      email: profile.email,
      userId: profile.id,
      createdAt: profile.created_at,
      workoutDays,
      workoutCount14d: (logs ?? []).length,
      totalVolume14d: (logs ?? []).reduce((s, l) => s + (l.total_volume ?? 0), 0),
      now,
      appUrl,
    });
    if (candidate) candidates.push(candidate);
  }

  return { considered: profiles.length, candidates };
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
