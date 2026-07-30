/**
 * Having push and having an evening hour are two different facts.
 *
 * `.194` shipped a `day_review_hour` column, a cron that selects on it, and
 * exactly one writer: the opt-in card, which **returns early when a push
 * subscription already exists**. So every athlete who had turned on the
 * wind-down note — the whole population with push enabled, which is the entire
 * population who would want an evening review — could never set the hour. The
 * column stayed NULL, `dayReviewDue` was always false, and the feature fired
 * for nobody. That is `.176` verbatim: a server column with no path to set it.
 *
 * The fix is one row of the truth table below (`hasPush: true` +
 * `storedHour: null` → `'offer'`), which is why the table is a total function
 * in a pure module rather than a chain of early returns in a component. A
 * decision written as `if (…) return;` can only be read by re-deriving it; a
 * decision written as a function over an input can be enumerated by a test.
 *
 * The other half of the fix lives in Profile, not here: an offer the athlete
 * dismisses once is gone, so the setting also needs a permanent home. See
 * `ProfileDayReviewRow`.
 */

import { DAY_REVIEW_MAX_HOUR, DAY_REVIEW_MIN_HOUR } from '@/lib/dayReviewNudge';

/** Every hour the evening review may be scheduled for. */
export const DAY_REVIEW_HOURS: readonly number[] = Array.from(
  { length: DAY_REVIEW_MAX_HOUR - DAY_REVIEW_MIN_HOUR + 1 },
  (_, i) => DAY_REVIEW_MIN_HOUR + i
);

/** The hour offered first when the athlete has not chosen one. */
export const DAY_REVIEW_DEFAULT_HOUR = 20;

/**
 * Device storage → an hour, or null.
 *
 * Never throws and never guesses. This reads whatever is on the device,
 * including values written by an older build or edited by hand, and an
 * unparseable value means *not opted in* rather than a default hour — sending
 * an unrequested nightly notification is the one failure mode this feature
 * cannot have.
 */
export function readDayReviewHour(raw: unknown): number | null {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!/^\d{1,2}$/.test(trimmed)) return null;
  const hour = Number(trimmed);
  return DAY_REVIEW_HOURS.includes(hour) ? hour : null;
}

/**
 * What an unrelated cadence sync may say about the evening hour.
 *
 * A Profile mount, a finished session, a healed row — none of these know
 * anything about this preference, and a device that has never chosen an hour
 * must say *nothing* rather than `null`. Sending `null` would reach the column
 * as an explicit clear and silently turn off an evening review the athlete set
 * on their phone, from their laptop, with no interaction at all.
 *
 * Written as a function returning the patch rather than a ternary at the call
 * site because the difference between `{}` and `{ dayReviewHour: null }` is
 * invisible in review and catastrophic in production — the same reasoning that
 * put `buildSubscriptionRow` in its own module.
 */
export function cadenceHourPatch(storedHour: number | null): { dayReviewHour?: number } {
  return storedHour === null ? {} : { dayReviewHour: storedHour };
}

export interface DayReviewOfferInput {
  /** Does this device already have a browser push subscription. */
  hasPush: boolean;
  /** Can this browser take a push subscription at all. */
  supported: boolean;
  /** iOS Safari before the app is installed to the home screen. */
  iosNeedsInstall: boolean;
  /** The hour already stored on this device, or null. */
  storedHour: number | null;
  /** Has the athlete already been asked and said not now. */
  dismissed: boolean;
}

export type DayReviewOfferState = 'hidden' | 'offer' | 'install';

/**
 * A total function over the table, deliberately.
 *
 * The row that fixes `.176` is `hasPush: true, storedHour: null → 'offer'`.
 * The old code answered `'hidden'` there, on the reasoning that a device with
 * push has already been asked about notifications — true, and irrelevant: it
 * was asked about the *wind-down* note. Nothing had ever asked it about the
 * evening review.
 */
export function dayReviewOfferState(input: DayReviewOfferInput): DayReviewOfferState {
  // Already chosen. Changing it belongs in Profile, not in a card that reappears.
  if (input.storedHour !== null) return 'hidden';
  if (input.dismissed) return 'hidden';
  // A browser that can subscribe gets the offer whether or not it already has a
  // subscription — the hour is the thing being asked for, not the permission.
  if (input.supported) return 'offer';
  if (input.iosNeedsInstall) return 'install';
  return 'hidden';
}
