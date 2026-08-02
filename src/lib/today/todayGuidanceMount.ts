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

export interface BetaBannerMountInput {
  phase: JourneyPhase;
  /**
   * `isBetaBannerDismissed()` — read at the mount site, from the one module that
   * owns the key, so this stays pure and the two answers cannot drift.
   */
  dismissed: boolean;
}

/**
 * The beta path card.
 *
 * Dismissal is part of *may it mount*, not only of *what it renders*. The block
 * is `pinned`, and `planTodayBlocks` shrinks `room` by every pinned **candidate**
 * regardless of whether it draws anything — so a card that returns `null` was
 * still spending a top-level Today slot for the life of the install. See
 * [`betaBannerDismissed.ts`](./betaBannerDismissed.ts) for why the check lives
 * there and is passed in rather than duplicated here.
 */
export function betaBannerMayMount({ phase, dismissed }: BetaBannerMountInput): boolean {
  if (dismissed) return false;
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
