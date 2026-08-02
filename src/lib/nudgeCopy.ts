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

import { localDateKeyFromIso } from '@/lib/time/localDate';
import { isCold, quietThresholdDays } from '@/lib/reentryTone';
import { EN_ONLY_SURFACE, formatLocalNumber } from '@/lib/i18n/formatLocale';

export type NudgeKind = 'comeback' | 'week1-recap' | 'week-behind' | 'wind-down' | 'day-review';

/**
 * A push message, authored — never sliced out of the email beside it.
 *
 * `.243` — the signed-in push was built at the send site by taking the email's
 * **first line, truncated to 140 characters**. For `week1-recap` that produced
 * the body *"Mission Winning — your first week on the path:"*: a colon pointing
 * at the two numbers that made the message worth sending, both of them on the
 * lines the slice threw away. A notification that announces it has something to
 * say and then does not say it is the whole defect — the reference app for this
 * wave ships a notification centre where eleven of thirteen rows read *"A new
 * article is out! A new article has been published!"*, and neither the title nor
 * the body names the article.
 *
 * So the rule is: **carry the what, not the that.** Each kind composes its own
 * push from the same inputs the email used, which also means the tone contract
 * (`reentryTone.ts`) sweeps it — a derived body was invisible to those tests
 * because it did not exist until send time.
 *
 * `tag` is required rather than optional. Two kinds shared the `mw-nudge`
 * fallback, and same tag replaces: a comeback the athlete had not opened could
 * be overwritten by the recap that followed it, which is exactly what
 * [`pushPayload.ts`](./pushPayload.ts) says tags were introduced to prevent.
 */
export interface PushCopy {
  title: string;
  body: string;
  /** Distinct per kind — same tag replaces, so a shared one loses messages. */
  tag: string;
}

export interface NudgeCandidate {
  userId: string;
  email: string;
  kind: NudgeKind;
  subject: string;
  body: string;
  /** The push that rides with this email, authored beside it. */
  push: PushCopy;
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

/** `1 session` / `4 sessions` — spelled once, used by the subject and the push. */
function sessionCount(n: number): string {
  return `${n} session${n === 1 ? '' : 's'}`;
}

/** Volume with the app's grouping. English-only: every line around it is. */
function volumeMoved(total: number): string {
  return formatLocalNumber(Math.round(total), EN_ONLY_SURFACE);
}

export function utcDay(d: string | Date): string {
  return localDateKeyFromIso(typeof d === 'string' ? d : new Date(d).toISOString());
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
      // One definition of what a comeback says, shared with the anonymous path
      // (`.178`) — the two channels reach the same athlete on the same day.
      push: anonymousComebackPush(),
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
      subject: `Week one: ${sessionCount(input.workoutCount14d)} logged`,
      body: [
        'Mission Winning — your first week on the path:',
        '',
        `Sessions: ${input.workoutCount14d}`,
        `Volume moved: ${volumeMoved(input.totalVolume14d)}`,
        '',
        'Most people quit in the first week. You didn’t. This is where the habit locks in.',
        '',
        `Keep going: ${link}`,
        footer,
      ].join('\n'),
      /*
       * The numbers ride along. This is the kind the truncation hurt most — the
       * email's first line is a colon introducing them, so the old push was
       * literally the setup without the payload.
       *
       * The privacy contract that keeps `dayReviewPush` contentless does not
       * reach here: that one is sent from a row holding no behaviour data by
       * design, while this path already has the counts in hand because it is
       * composing an email out of them.
       */
      push: {
        title: `Week one: ${sessionCount(input.workoutCount14d)} logged`,
        body: `${volumeMoved(input.totalVolume14d)} moved. Most people quit in the first week — you didn’t.`,
        tag: 'mw-week1-recap',
      },
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
      push: {
        title: 'Room for one more this week',
        body: `You aimed at ${cadence} and have logged ${thisWeek}. A short session counts the same as a long one.`,
        tag: 'mw-week-behind',
      },
    };
  }

  return null;
}

/**
 * Wind-down push — the only message here with a time-of-day trigger rather than an
 * absence trigger, which is why it has no `decideNudge` branch (those gates all select
 * for someone being away; this one requires they trained today).
 *
 * Describes the comparison and prescribes recovery hygiene. It predicts nothing and
 * names no medical concept — LEGAL_SAFETY §3a, and the same rule `load.ts` sets for
 * every band sentence.
 */
export function windDownPush(): PushCopy {
  return {
    title: 'That one ran hot',
    body: 'Heavier than your recent usual. Water, food, and an early night buy tomorrow back.',
    tag: 'mw-wind-down',
  };
}

/**
 * The evening day-review doorbell.
 *
 * Deliberately carries **no numbers**. The server row this is sent from holds
 * no behavior data, no sleep figure and no session load — by contract — so any
 * digit here would either be invented or would mean we had started storing
 * things we promised not to. The review is composed on the device when the
 * athlete opens it.
 */
export function dayReviewPush(): PushCopy {
  return {
    title: 'Your day in review',
    body: 'Tonight’s recap is ready when you are — it opens on this device.',
    tag: 'mw-day-review',
  };
}

/**
 * Push copy for a comeback, on any channel.
 *
 * Named for the anonymous device because that is the only path with no email to
 * sit beside, but the signed-in `comeback` branch returns this same object:
 * one athlete, one message, one definition (`.178`).
 *
 * `mw-comeback` rather than the old `mw-nudge` fallback — sharing that tag with
 * the recap meant an unopened comeback could be replaced by the message that
 * came after it.
 */
export function anonymousComebackPush(): PushCopy {
  return {
    title: 'Your next session is still here',
    body: 'The path is right where you left it. One short session is a complete return.',
    tag: 'mw-comeback',
  };
}
