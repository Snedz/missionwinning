/**
 * What a return message says, and which one is due.
 *
 * Split out of `nudgeServer.ts` because that file carries `import 'server-only'`,
 * which makes every symbol in it unreachable from a unit test. That is not a
 * cosmetic problem: the words sent to an athlete at the moment they are most likely
 * to quit were the least testable thing in the repo, and they had drifted into the
 * exact streak-loss framing `reentry.ts` was written to avoid.
 *
 * Pure by construction — no DB, no crypto, no env. The unsubscribe URL is passed in
 * rather than derived, so nothing here needs a secret. Same reasoning as
 * `pushPayload.ts` sitting outside `pushServer.ts`.
 *
 * Rules (first match wins, max one message per athlete per 44h):
 *  - comeback:     quiet past their own cadence threshold, not yet cold
 *  - week-1 recap: joined 6–8 days ago and trained at least once
 *  - week-behind:  short of their own weekly target with the week nearly out
 *
 * The old `streak-at-risk` kind is gone. It fired on a consecutive-day premise that
 * `reentry.ts` explicitly rejects (`REENTRY_MIN_DAYS = 4`, "rest days are part of
 * training"), so a 3x/week lifter was told a scheduled rest day had cost them
 * something.
 */

import { isCold, quietThresholdDays } from '@/lib/reentryTone';

export type NudgeKind = 'comeback' | 'week1-recap' | 'week-behind';

export interface NudgeCandidate {
  userId: string;
  email: string;
  kind: NudgeKind;
  subject: string;
  body: string;
}

export interface NudgeInput {
  email: string;
  userId: string;
  createdAt: string;
  /** UTC yyyy-mm-dd of completed workouts, last 14d. */
  workoutDays: string[];
  workoutCount14d: number;
  totalVolume14d: number;
  /** The athlete's own weekly target. Thresholds scale off this, never a fixed 7. */
  daysPerWeek?: number;
  now?: Date;
  appUrl: string;
  /** Built by the caller — keeps this module free of the HMAC secret. */
  unsubscribeUrl: string;
}

export function utcDay(d: string | Date): string {
  return new Date(d).toISOString().slice(0, 10);
}

/** Days remaining in the current UTC week (Mon-start), today included. */
export function daysLeftInWeek(now: Date): number {
  const dow = now.getUTCDay(); // 0 = Sun
  const mondayIndex = (dow + 6) % 7; // 0 = Mon … 6 = Sun
  return 7 - mondayIndex;
}

export function decideNudge(input: NudgeInput): NudgeCandidate | null {
  const now = input.now ?? new Date();
  const days = new Set(input.workoutDays);
  const cadence = input.daysPerWeek ?? 3;
  const link = `${input.appUrl}/log`;
  const footer = [
    '',
    'Health for everyone, everywhere. The free core stays free.',
    `Stop training reminders: ${input.unsubscribeUrl}`,
  ].join('\n');

  const sorted = [...days].sort();
  const lastDay = sorted[sorted.length - 1];
  const referenceDay = lastDay ?? utcDay(input.createdAt);
  const quietDays = Math.floor(
    (now.getTime() - new Date(`${referenceDay}T00:00:00Z`).getTime()) / 86_400_000
  );

  // Gone, not lapsed. Silence is the product behaviour, and it keeps the channel
  // from being marked as spam by the push vendor.
  if (isCold(quietDays)) return null;

  // Comeback takes priority: someone away matters more than someone merely behind.
  // The threshold is theirs — two missed slots at their own cadence, not day three.
  if (quietDays >= quietThresholdDays(cadence)) {
    return {
      userId: input.userId,
      email: input.email,
      kind: 'comeback',
      subject: 'Your next session is still here',
      body: [
        'Mission Winning — the path is right where you left it.',
        '',
        'No catch-up needed and nothing to make up. One short session is a complete return.',
        '',
        `Start now: ${link}`,
        footer,
      ].join('\n'),
    };
  }

  const joinedDaysAgo = Math.floor(
    (now.getTime() - new Date(input.createdAt).getTime()) / 86_400_000
  );
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
        'Most people quit in the first week. You didn’t. This is where the habit locks in.',
        '',
        `Keep going: ${link}`,
        footer,
      ].join('\n'),
    };
  }

  // Behind their own target with the week nearly out. Framed as room remaining, not
  // as a deficit — the athlete set this number, and missing it is not a failure.
  const elapsedThisWeek = 7 - daysLeftInWeek(now);
  const thisWeek = [...days].filter((d) => {
    const diff = Math.floor(
      (now.getTime() - new Date(`${d}T00:00:00Z`).getTime()) / 86_400_000
    );
    return diff >= 0 && diff <= elapsedThisWeek;
  }).length;

  if (daysLeftInWeek(now) <= 2 && thisWeek > 0 && thisWeek < cadence) {
    return {
      userId: input.userId,
      email: input.email,
      kind: 'week-behind',
      subject: 'Room for one more this week',
      body: [
        `Mission Winning — you aimed at ${cadence} sessions this week and have logged ${thisWeek}.`,
        '',
        'There is still room for one. A short session counts the same as a long one.',
        '',
        `Start now: ${link}`,
        footer,
      ].join('\n'),
    };
  }

  return null;
}

/** Push copy for an anonymous device. No email exists, so there is no footer. */
export function anonymousComebackPush(): { title: string; body: string } {
  return {
    title: 'Your next session is still here',
    body: 'The path is right where you left it. One short session is a complete return.',
  };
}
