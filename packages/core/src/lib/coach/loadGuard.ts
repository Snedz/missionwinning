/**
 * What the athlete's own recent load is allowed to do to next week's prescription.
 *
 * `.171` built `load.ts` and `.172`–`.173` taught the debrief to speak it. Nothing
 * ever fed it back: the app measured that a week ran hot, said so honestly *after*
 * the session, and then planned the next week as though it had never looked. This
 * module is that feedback path, and it is deliberately the narrowest one that closes
 * the loop.
 *
 * ## Cap-only, and why it is not symmetric
 *
 * A high ratio **holds** progression. It never deloads, never cuts sets, never
 * touches session count, and never says anything a reasonable person could read as
 * medical advice — ACWR is validated in team sports, contested in the literature and
 * has never been validated for recreational lifting (`load.ts` header, and
 * docs/LEGAL_SAFETY.md §3a). Declining to *add* weight on that evidence is a
 * defensible coaching call. Taking weight away on it is not.
 *
 * The `light` zone is likewise identity, not a licence to inflate. Auto-adding volume
 * because a contested ratio dipped is the same error in the flattering direction, and
 * the debrief already offers "room to add a set when you want it" — an invitation the
 * athlete accepts, not a decision the engine makes for them.
 *
 * `unknown` — which is what every athlete under `MIN_DAYS_FOR_RATIO` days of history
 * has — is provably identity. That is the `.127` principle: no fabricated baseline
 * acts on anything, and the test asserts deep equality with the unguarded call rather
 * than trusting the branch to be obviously correct.
 *
 * ## Where it does NOT sit
 *
 * Not in `chooseSplit` or `adaptPlan`. Session *shape* already answers to strain
 * (≥ 70 trims exercise count) and readiness (< 40 swaps to recovery). One mechanism
 * per axis: those two own shape, this owns progression rate. Stacking a third damper
 * on partially-overlapping signals would punish the same hard week twice and make
 * neither mechanism explainable.
 */

import type { LoadZone } from '@/lib/coach/load';
import type { ProgressionTargets } from '@/lib/coach/progression';

/** Shown when a rise was available and the athlete's own recent load held it back. */
export const STEADY_WEEK_WHY_KEY = 'coachWhySteadyWeek';

/** Float noise from `weightFromLoadPct` must not read as a progression. */
const EPSILON = 1e-6;

/**
 * Is `proposed` actually more work than `hold`?
 *
 * Checked rather than assumed, because a branch can be *semantically* a progression
 * and still return the same numbers — `hasMixedOrMed` adds a rep only while under the
 * goal's rep ceiling, and at the ceiling it returns a plain hold. Clamping that would
 * relabel an honest `coachWhyHold` as a steady week and blame the athlete's load for
 * a rise that was never on offer.
 */
function isIncrease(proposed: ProgressionTargets, hold: ProgressionTargets): boolean {
  if (proposed.weight > hold.weight + EPSILON) return true;
  if (proposed.reps > hold.reps) return true;
  if (
    proposed.loadPct != null &&
    hold.loadPct != null &&
    proposed.loadPct > hold.loadPct + EPSILON
  ) {
    return true;
  }
  return false;
}

/**
 * Hold a proposed increase when the athlete's acute load is already above their own
 * chronic baseline. Every other zone, and every non-increase, passes through
 * untouched.
 *
 * `hold` is the same-shaped target for "no rise this week" — passed in rather than
 * reconstructed here because in the percent-of-max path the held weight is
 * materialised from the working max, not simply last session's number, and this
 * module has no business knowing that.
 */
export function capProgressionForZone(
  zone: LoadZone | undefined,
  proposed: ProgressionTargets,
  hold: ProgressionTargets
): ProgressionTargets {
  if (zone !== 'high') return proposed;
  if (!isIncrease(proposed, hold)) return proposed;

  const capped: ProgressionTargets = {
    sets: proposed.sets,
    reps: hold.reps,
    weight: hold.weight,
    whyKey: STEADY_WEEK_WHY_KEY,
  };
  if (hold.loadPct != null) capped.loadPct = hold.loadPct;
  return capped;
}
