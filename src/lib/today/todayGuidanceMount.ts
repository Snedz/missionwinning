/**
 * Who sees the two cards that tell an athlete what to do next.
 *
 * `.195` fixed this shape for the Day in Review; `dayReviewMount.ts` is the
 * pattern. Two more cards had it and were missed:
 *
 *   - **the first-run guidance card** (`BetaWelcomeBanner` then, `FirstStepsCard` since `.240`) — the card that tells a new athlete the path
 *     ("Finish I-Day, log one workout, then open Mission Coach") — is mounted
 *     only in `HomeTodayDashboard`. `HomePage` sends `i-day` and `basic` to the
 *     lean shell, and a new tester stays `basic` until they *complete* a
 *     workout. So the instructions appeared only **after** the thing they
 *     instruct had already been done.
 *   - **`TodayReentryCard`** — the calm, smaller ask after a gap — same mount,
 *     same consequence. An athlete who finishes I-Day, abandons their first
 *     session and lapses is on the lean shell with no re-entry card at all,
 *     which is the exact cohort Horizon W criterion 4 ("missed day → re-entry
 *     without shame") exists for.
 *
 * The rule is not "mount everything in both shells". `i-day` is excluded here
 * for the same reason `dayReviewMayMount` excludes it: the first run is the one
 * screen that must stay bare, and an athlete still in in-processing has neither
 * a beta path to resume nor a gap to re-enter from. Deciding at the mount site
 * rather than inside each card also keeps the chunks unfetched.
 */

import type { JourneyPhase } from '@/lib/missionJourney';

export interface FirstStepsMountInput {
  phase: JourneyPhase;
  /**
   * `isFirstStepsDismissed()` — read at the mount site, from the one module that
   * owns the key, so this stays pure and the two answers cannot drift.
   */
  dismissed: boolean;
}

/**
 * The first-steps checklist card — off Today (`.890`).
 *
 * Start is the instruction. The checklist still lives in More
 * (`firstStepsReachable`). Dismissal / phase stay on the input so a later
 * remount cannot invent a second private rule; they do not bring the card back.
 */
export function firstStepsMayMount({ phase, dismissed }: FirstStepsMountInput): boolean {
  void phase;
  void dismissed;
  return false;
}

export interface ReentryMountInput {
  phase: JourneyPhase;
  /** `computeReentry(...).show` — whether there is a gap worth naming. */
  show: boolean;
  /**
   * Mid-set: they are not returning, they are already in. Hide the quiet line
   * so "N days off" cannot sit above a live logger.
   */
  sessionOpen?: boolean;
}

export function reentryCardMayMount({
  phase,
  show,
  sessionOpen = false,
}: ReentryMountInput): boolean {
  if (sessionOpen) return false;
  if (!show) return false;
  return phase !== 'i-day';
}

/**
 * Planned-miss prompt — same mount rule as the calendar-gap quiet line.
 * No plan / no overdue session is `show: false` from `findPlannedMiss`.
 */
export function plannedMissMayMount(input: ReentryMountInput): boolean {
  return reentryCardMayMount(input);
}
