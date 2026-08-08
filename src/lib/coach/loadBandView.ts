/**
 * What the athlete is allowed to be told about their training load, and when.
 *
 * `.607` — `coach/load.ts` has implemented Foster session-RPE and an EWMA
 * acute:chronic workload ratio from logged sets alone since it was written, and
 * **no screen has ever shown it.** `loadBands` reaches `loadGuard` (planning),
 * `contextBuilder` (LLM context) and `debrief` (one post-session moment); there is
 * no standing surface. That is the capability [docs/THESIS.md](../../../docs/THESIS.md)
 * promotes into the second beat of the wedge — readiness without a strap — so it has
 * to be visible before the sentence is honest.
 *
 * The decision lives here rather than in the component for the reason `.598`
 * established: a hook or a JSX branch is not unit-testable in this repo, and the
 * interesting behaviour is *refusing to speak*, which is exactly the branch a
 * Playwright pass is least likely to seed. The component is wiring.
 *
 * **The refusal is the product.** `load.ts` returns `ratio: null` under
 * `MIN_DAYS_FOR_RATIO` days and its own header explains why: ACWR is descriptive,
 * not predictive, and was never validated for recreational lifters. A number shown
 * on day three would be the `.602` defect wearing a lab coat — an invented figure
 * that looks measured. So the unmeasured state is a first-class return, carries how
 * many days remain, and is never a zero or a dash pretending to be a reading.
 */

import type { CompletedWorkoutLog } from '@/types';
import { loadBands, MIN_DAYS_FOR_RATIO, type LoadZone } from '@/lib/coach/load';

export type LoadBandView =
  | {
      state: 'unmeasured';
      /** Whole days still needed before a ratio means anything. Always ≥ 1 here. */
      daysRemaining: number;
    }
  | {
      state: 'measured';
      zone: Exclude<LoadZone, 'unknown'>;
      /** acute ÷ chronic, rounded to two places for display. */
      ratio: number;
    };

/**
 * Resolve what to render. Returns the unmeasured state whenever `load.ts` declines
 * to produce a ratio — the two conditions are deliberately not re-derived here, so
 * this cannot drift from the model's own opinion of when it has enough evidence.
 */
export function resolveLoadBandView(
  history: CompletedWorkoutLog[],
  now = new Date()
): LoadBandView {
  const bands = loadBands(history, now);

  // `zone === 'unknown'` and `ratio === null` are set together by `loadBands`, but
  // both are checked: if that ever stops being true, the safe reading is silence.
  if (bands.ratio === null || bands.zone === 'unknown') {
    const remaining = Math.max(1, Math.ceil(MIN_DAYS_FOR_RATIO - bands.daysOfHistory));
    return { state: 'unmeasured', daysRemaining: remaining };
  }

  return {
    state: 'measured',
    zone: bands.zone,
    ratio: Math.round(bands.ratio * 100) / 100,
  };
}
