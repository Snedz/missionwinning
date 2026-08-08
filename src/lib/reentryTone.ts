/**
 * The tone contract for anything that speaks to a lapsed athlete.
 *
 * `reentry.ts` decides *whether* to show a calm re-entry surface and how much to
 * shrink the session. This file is the other half: what any channel is allowed to
 * say when it does. It exists because the two halves drifted — the in-app surface
 * was deliberately shame-free while the email channel led with
 * "Your 5-day streak ends tonight", which is the same athlete being told opposite
 * things at the moment they are most likely to quit.
 *
 * Pure and channel-agnostic on purpose: email, web push and any future surface get
 * checked by the same rules, and the rules are asserted by test rather than trusted
 * to prose in a doc.
 */

export interface ToneViolation {
  rule: 'absence-length' | 'streak-loss' | 'club-identity';
  match: string;
}

/**
 * Naming how long someone has been gone turns a gap into a verdict. "It's been 11
 * days" is information the athlete already has and cannot act on.
 *
 * Counts of things they *did* ("Sessions: 3") are fine — this only matches a number
 * bound to a unit of elapsed time.
 */
const ABSENCE_LENGTH = /\b\d+\s*-?\s*(day|days|week|weeks|month|months)\b/i;

/**
 * Streaks are a presence mechanic. Pointing at one while someone is away converts a
 * rest day into a loss, which is exactly the reasoning `REENTRY_MIN_DAYS` rejects —
 * and a consecutive-day streak reads "1" forever for the 3x/week lifter who is the
 * target user anyway.
 */
const STREAK_LOSS = /\bstreaks?\b/i;

/**
 * Standing never travels in the return channel.
 *
 * `CLUB_PLAN.md` invariant 6 said this about points; the club plan has since grown
 * tiers, badges, boards and squads, and the reason covers all of them. A nudge is
 * read by someone who is *not* in the app, and "you've dropped to third" converts
 * an absence into a standing they must come back to defend. That is loss aversion
 * pointed at a lapsed athlete — the same mechanic `STREAK_LOSS` already refuses,
 * arriving under a different noun.
 *
 * Deliberately narrower than the club's own vocabulary. `points` and `level` are
 * **not** matched: "three points of contact" and "level the bar" are ordinary
 * training language, and a term list that cries wolf on legitimate copy is a term
 * list someone eventually switches off. The words here have no innocent reading in
 * a re-entry message.
 */
const CLUB_IDENTITY = /\b(xp|rank(?:ed|ing|s)?|tiers?|leaderboards?|badges?|squads?)\b/i;

/** Every violation in a piece of copy, empty when it is clean. */
export function findToneViolations(text: string): ToneViolation[] {
  const out: ToneViolation[] = [];
  const absence = ABSENCE_LENGTH.exec(text);
  if (absence) out.push({ rule: 'absence-length', match: absence[0] });
  const streak = STREAK_LOSS.exec(text);
  if (streak) out.push({ rule: 'streak-loss', match: streak[0] });
  const club = CLUB_IDENTITY.exec(text);
  if (club) out.push({ rule: 'club-identity', match: club[0] });
  return out;
}

export function violatesReturnTone(text: string): boolean {
  return findToneViolations(text).length > 0;
}

/**
 * How quiet is quiet, for *this* athlete.
 *
 * A fixed threshold punishes whoever trains least. Someone aiming at 2 sessions a
 * week has not lapsed on day 4; someone aiming at 6 probably has. Two missed slots
 * is the signal — one is a rest day.
 */
export function quietThresholdDays(daysPerWeek: number): number {
  const cadence = Math.max(1, Math.min(7, Math.round(daysPerWeek)));
  const expectedGap = 7 / cadence;
  return Math.max(4, Math.ceil(expectedGap * 2));
}

/**
 * Past this, continuing to contact someone is how the channel gets blocked at the
 * vendor — and they have plainly gone. Silence is the correct product behaviour.
 */
export const COLD_DEVICE_DAYS = 28;

export function isCold(daysQuiet: number): boolean {
  return daysQuiet > COLD_DEVICE_DAYS;
}
