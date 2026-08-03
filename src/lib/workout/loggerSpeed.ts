/**
 * Gym-speed helpers for the live logger console.
 * Pure — keep mid-set paths under three intentional taps.
 */

/** True when the console already holds the progressive-overload / plan target. */
export function consoleMatchesTarget(
  reps: number,
  weight: number,
  target: { reps: number; weight: number } | null | undefined
): boolean {
  if (!target) return false;
  return reps === target.reps && weight === target.weight;
}

/**
 * Whether to offer a one-tap "Use next" control.
 * Only when there is a next target the athlete has not already dialed in.
 */
export function shouldOfferUseNext(
  reps: number,
  weight: number,
  target: { reps: number; weight: number } | null | undefined
): boolean {
  if (!target) return false;
  return !consoleMatchesTarget(reps, weight, target);
}
