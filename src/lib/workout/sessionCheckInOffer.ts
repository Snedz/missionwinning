/**
 * Whether the pre-session readiness sheet may open on /active.
 *
 * Pure decision — storage/UI wrap it. Horizon W / W1: the **first mission**
 * (zero completed workouts in history) must never open a Mind questionnaire
 * between "arrive on Active" and "log a set". e2e first-90 asserts the absence
 * of "Not now"; this module is what keeps that rule one definition (`.178`).
 *
 * `.293` — extracted so a unit test can kill the "offer on cold path" mutant
 * without a browser.
 */

export type SessionCheckInOfferInput = {
  /** Completed sessions already in history (not the in-progress workout). */
  completedHistoryLength: number;
  /** Athlete dismissed the sheet earlier today (`mw_session_checkin_skipped`). */
  skippedForToday: boolean;
  /** Daily mind check-in already complete. */
  todayCheckInComplete: boolean;
};

/**
 * @returns true only when a second+ session may see the optional readiness sheet.
 */
export function shouldOfferSessionCheckInDecision(
  input: SessionCheckInOfferInput
): boolean {
  // W1: first mission — history empty until the first finish.
  if (input.completedHistoryLength < 1) return false;
  if (input.skippedForToday) return false;
  if (input.todayCheckInComplete) return false;
  return true;
}
