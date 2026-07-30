/**
 * When a wind-down note is due.
 *
 * The reference is WHOOP's evening message — a note that lands while the athlete can
 * still act on it, not a summary the next morning when the night is already spent.
 * That makes this the only nudge in the app with a *time-of-day* trigger rather than
 * an absence trigger, which is why it lives apart from `nudgeCopy.decideNudge`
 * (whose gates all select for someone being *away*, not present).
 *
 * Pure and no `server-only`, for the same reason `nudgeCopy.ts` is: time-zone maths
 * across DST boundaries is exactly the kind of thing that should be provable in a
 * unit test rather than discovered by an athlete receiving a push at 03:00.
 */

/** Local hours, inclusive start, exclusive end. Late enough to be winding down, early enough to act. */
export const WIND_DOWN_START_HOUR = 19;
export const WIND_DOWN_END_HOUR = 22;

export interface WindDownRow {
  lastSessionAt: string | null;
  lastSessionHigh: boolean;
  lastWindDownAt: string | null;
  /**
   * `.194` — the day-review push shares this evening. Optional so existing
   * callers and older rows keep working unchanged.
   */
  lastDayReviewAt?: string | null;
  timeZone: string | null;
}

/** The athlete's local hour, or null when the stored zone is unusable. */
export function localHourFor(now: Date, timeZone: string): number | null {
  try {
    const hour = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: 'numeric',
      hour12: false,
    }).format(now);
    const n = Number(hour);
    // `Intl` renders midnight as "24" in some ICU versions — normalise rather than
    // let a 24 fall outside every window silently.
    if (!Number.isFinite(n)) return null;
    return n === 24 ? 0 : n;
  } catch {
    return null;
  }
}

/** Same calendar day in the athlete's own zone, not UTC. */
export function isSameLocalDay(a: Date, b: Date, timeZone: string): boolean {
  try {
    const fmt = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return fmt.format(a) === fmt.format(b);
  } catch {
    return false;
  }
}

/**
 * Is a wind-down due for this device right now?
 *
 * Every clause earns its place:
 * - **No time zone → no push.** Guessing one risks a 03:00 notification, which is
 *   worse for the athlete than silence and worse for us than an unsent message.
 * - **`lastSessionHigh`** — the one bit the device synced. The server cannot and
 *   should not recompute it.
 * - **Session is today, locally.** Yesterday's hard session is not tonight's story.
 * - **Inside the evening window.** A session finished at 23:30 gets nothing; a
 *   "wind down" push after midnight is a joke at the athlete's expense.
 * - **Marker older than the session.** This single comparison *is* the idempotency:
 *   after a send the marker is newer, so every later run that hour skips, and the
 *   next hard session re-arms it with no expiry job anywhere.
 */
export function windDownDue(row: WindDownRow, now: Date): boolean {
  if (!row.timeZone) return false;
  if (!row.lastSessionHigh) return false;
  if (!row.lastSessionAt) return false;

  const sessionAt = new Date(row.lastSessionAt);
  if (Number.isNaN(sessionAt.getTime())) return false;
  if (!isSameLocalDay(sessionAt, now, row.timeZone)) return false;

  const hour = localHourFor(now, row.timeZone);
  if (hour === null) return false;
  if (hour < WIND_DOWN_START_HOUR || hour >= WIND_DOWN_END_HOUR) return false;

  if (row.lastWindDownAt) {
    const sent = new Date(row.lastWindDownAt);
    if (!Number.isNaN(sent.getTime()) && sent >= sessionAt) return false;
  }

  // One push per evening, enforced from both sides (`dayReviewNudge.ts` carries
  // the mirror of this). Wind-down normally wins because it is time-critical,
  // but if the review already went out tonight the athlete has had their one.
  if (row.lastDayReviewAt) {
    const review = new Date(row.lastDayReviewAt);
    if (!Number.isNaN(review.getTime()) && isSameLocalDay(review, now, row.timeZone)) {
      return false;
    }
  }
  return true;
}

/**
 * How often the app may *offer* evening notifications.
 *
 * Fourteen days, not seven: a declined offer that comes back next week is nagging, and
 * a notification prompt is the one piece of UI a user cannot un-see. Two weeks is long
 * enough that the second ask reads as a new moment rather than a repeat of the first.
 */
export const ASK_INTERVAL_DAYS = 14;

/**
 * May the opt-in be offered, given the stored "last asked" marker?
 *
 * Lives here rather than in the component for the same reason `windDownDue` does: it is
 * a rule about time, and a rule about time that is only reachable through a rendered
 * React tree is a rule nobody can prove. An unreadable or absent marker means *never
 * asked* — the failure direction that offers once too often rather than never at all,
 * since a device with unusable storage would otherwise be silently excluded forever.
 */
export function mayOfferWindDown(rawMarker: string | null, now: number): boolean {
  if (!rawMarker) return true;
  const at = Number(rawMarker);
  if (!Number.isFinite(at)) return true;
  return now - at >= ASK_INTERVAL_DAYS * 86_400_000;
}
