/**
 * Set arithmetic shared by the three engines that read logged sets.
 *
 * `roundToStep` and a "which sets count" filter existed as **three private copies**
 * — `coach/progression.ts`, `workout/nextSetTargets.ts`, `workout/percentLoad.ts` —
 * and the copies had drifted: percentLoad's also dropped zero-weight and zero-rep
 * sets, the others did not. That difference is invisible until a bodyweight athlete
 * gets a prescription from one engine and a suggestion from another.
 *
 * Pure, no imports beyond types.
 */

import { countsTowardStrengthEstimate } from '@/lib/workout/setKind';
export interface CountableSet {
  reps: number;
  weight: number;
  kind?: string;
}

/** Round to the nearest plate/dumbbell increment. A step of 0 means "don't round". */
export function roundToStep(value: number, step: number): number {
  if (step <= 0) return value;
  return Math.round(value / step) * step;
}

/**
 * Sets that count as evidence of what the athlete can do.
 *
 * Warmups are excluded everywhere. `failure` sets are excluded from *strength
 * estimation* (a rep count past failure is not a number any 1RM formula was fitted
 * on) but kept for volume — so callers say which they want rather than sharing one
 * filter that silently means both.
 */
export function workingSets<T extends CountableSet>(sets: T[]): T[] {
  return sets.filter((s) => s.kind !== 'warmup');
}

/** Working sets that can support a load estimate: real weight, real reps, not to failure. */
export function loadBearingSets<T extends CountableSet>(sets: T[]): T[] {
  return sets.filter(
    (s) => countsTowardStrengthEstimate(s.kind) && s.weight > 0 && s.reps > 0
  );
}
