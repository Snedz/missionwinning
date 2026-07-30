/**
 * Who sees the two cards that tell an athlete what to do next.
 *
 * `.195` fixed this shape for the Day in Review; `dayReviewMount.ts` is the
 * pattern. Two more cards had it and were missed:
 *
 *   - **`BetaWelcomeBanner`** — the card that tells an invited tester the path
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

/**
 * The beta path card. Self-dismissing (`mw_beta_banner_dismissed`), so this
 * answers only *may it appear at all*, never *has it been dismissed* — the card
 * owns that, and duplicating it here is how the two answers drift apart.
 */
export function betaBannerMayMount(phase: JourneyPhase): boolean {
  return phase !== 'i-day';
}

export interface ReentryMountInput {
  phase: JourneyPhase;
  /** `computeReentry(...).show` — whether there is a gap worth naming. */
  show: boolean;
}

export function reentryCardMayMount({ phase, show }: ReentryMountInput): boolean {
  if (!show) return false;
  return phase !== 'i-day';
}
