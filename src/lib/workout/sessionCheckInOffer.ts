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
  /**
   * Sets already logged in the **in-progress** session.
   *
   * `.767` — the rule above protected the first mission only, and shard 3
   * (IL/IN/SEA, ops #14) reported *"too many taps to log a set"* from returning
   * athletes, which is precisely the case it excluded. Measured on a returning
   * device at 390×844: Start → **full-viewport sheet** → Log set. The sheet is
   * an `AdaptiveOverlay` at `z-[70]`, so the logger is on screen and
   * unclickable; `tests/e2e/helpers/journey.ts` seeds a completed check-in to
   * get past it and says so ("full-viewport overlay that intercepts Finish /
   * picker clicks"), which is the suite agreeing in writing while measuring
   * nothing.
   *
   * The principle was already written here — a Mind questionnaire must not stand
   * between arriving on Active and logging a set. It just said *first* mission.
   * It now says every session: ask after the first set, when the athlete is
   * warm and nothing is in their way.
   */
  loggedSetsThisSession: number;
};

/**
 * @returns true only when a second+ session may see the optional readiness sheet,
 * and only once a set is on the board.
 */
export function shouldOfferSessionCheckInDecision(
  input: SessionCheckInOfferInput
): boolean {
  // W1: first mission — history empty until the first finish.
  if (input.completedHistoryLength < 1) return false;
  // Nothing stands between arriving on Active and the first set.
  if (input.loggedSetsThisSession < 1) return false;
  if (input.skippedForToday) return false;
  if (input.todayCheckInComplete) return false;
  return true;
}
