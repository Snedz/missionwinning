/**
 * When an evening day-review push is due.
 *
 * The push is a **doorbell, not a letter**. Its copy carries no numbers and no
 * behavior data, because the row it is sent from carries none: the privacy
 * contract for `push_subscriptions` allows timestamps, a cadence integer, an
 * IANA zone, and one-bit results of device-side computation — nothing an
 * athlete would recognise as their own data. The `20260730` migration already
 * refused to store a three-value load zone on exactly that reasoning ("a
 * per-session stream of zones is reconstructable training history through the
 * back door"), and a caffeine count or a sleep figure is categorically worse.
 *
 * So the server knows only *when* to ring. The review itself is composed on the
 * device when the athlete opens the app, from data that never left it.
 *
 * ## One push per evening, enforced in both directions
 *
 * The wind-down note (19:00–22:00 local) and this one share an evening. Two
 * pushes in one night from a product whose whole position is restraint would be
 * self-refuting, so wind-down wins: it is rarer and time-critical (it exists to
 * reach the athlete while they can still act on a hard session), while a day
 * review is the same tomorrow. `windDownDue` carries the symmetric clause.
 *
 * Pure and free of `server-only` for the same reason as `windDown.ts`:
 * time-zone arithmetic across DST boundaries should be provable in a test
 * rather than discovered by someone woken at 03:00.
 */

import { isSameLocalDay, localHourFor } from '@/lib/windDown';

/** The hours an athlete may choose. Evening only — a "day in review" at 09:00 reviews nothing. */
export const DAY_REVIEW_MIN_HOUR = 18;
export const DAY_REVIEW_MAX_HOUR = 22;

export interface DayReviewRow {
  /** Local hour the athlete chose, or null when they have not opted in. */
  dayReviewHour: number | null;
  lastDayReviewAt: string | null;
  /** Precedence input — wind-down wins the evening. */
  lastWindDownAt: string | null;
  timeZone: string | null;
}

export function isValidDayReviewHour(hour: number | null | undefined): hour is number {
  return (
    typeof hour === 'number' &&
    Number.isInteger(hour) &&
    hour >= DAY_REVIEW_MIN_HOUR &&
    hour <= DAY_REVIEW_MAX_HOUR
  );
}

/**
 * Is a day-review push due for this device right now?
 *
 * - **No time zone → no push.** Guessing risks 03:00, which is worse than silence.
 * - **Not opted in → no push.** Absent hour means the athlete never asked for it;
 *   this is the one nudge in the app that is strictly opt-in with a chosen time.
 * - **Only at the chosen hour**, in their zone.
 * - **Once per local day.** The marker is the idempotency, exactly as the
 *   wind-down marker is — no expiry job anywhere.
 * - **Never on a night wind-down already spoke.**
 */
export function dayReviewDue(row: DayReviewRow, now: Date): boolean {
  if (!row.timeZone) return false;
  if (!isValidDayReviewHour(row.dayReviewHour)) return false;

  const hour = localHourFor(now, row.timeZone);
  if (hour === null || hour !== row.dayReviewHour) return false;

  if (row.lastDayReviewAt) {
    const sent = new Date(row.lastDayReviewAt);
    if (!Number.isNaN(sent.getTime()) && isSameLocalDay(sent, now, row.timeZone)) return false;
  }

  // Wind-down wins the evening: it is rarer and it is time-critical.
  if (row.lastWindDownAt) {
    const windDown = new Date(row.lastWindDownAt);
    if (!Number.isNaN(windDown.getTime()) && isSameLocalDay(windDown, now, row.timeZone)) {
      return false;
    }
  }

  return true;
}

/** Same fortnight cadence as the wind-down offer — a re-ask must read as a new moment. */
export const ASK_INTERVAL_DAYS = 14;

export function mayOfferDayReview(rawMarker: string | null, now: number): boolean {
  if (!rawMarker) return true;
  const at = Number(rawMarker);
  if (!Number.isFinite(at)) return true;
  return now - at >= ASK_INTERVAL_DAYS * 86_400_000;
}
