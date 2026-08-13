/**
 * Drop-set start — deepen existing `SetKind` `'drop'`. No second flag.
 *
 * After a working set: same exercise, −20% load, skip rest.
 */

import type { SetKind } from '@/types';
import type { UnitsPref } from '@/lib/units';
import { weightStep } from '@/lib/units';
import { roundToStep } from '@/lib/workout/setMath';
import { countsTowardVolume } from '@/lib/workout/setKind';

/** Named so a −10% mutant dies in the load-rule test. */
export const DROP_LOAD_FRACTION = 0.8;

export type DropSetSnapshot = {
  completed: boolean;
  kind?: SetKind;
  reps: number;
  weight: number;
};

export type DropStartPlan = {
  parentSetIdx: number;
  targetSetIdx: number;
  addSet: boolean;
  kind: 'drop';
  weight: number;
  reps: number;
};

export type RestPlan = {
  takeRest: boolean;
  restSeconds: number;
};

function lastVolumeCompletedIdx(sets: DropSetSnapshot[]): number {
  for (let i = sets.length - 1; i >= 0; i -= 1) {
    const s = sets[i];
    if (s?.completed && countsTowardVolume(s.kind)) return i;
  }
  return -1;
}

/**
 * −20% of the parent load, rounded to the unit step, always strictly below
 * when the parent load is > 0. Bodyweight (≤ 0) stays 0.
 */
export function suggestDropLoad(parentWeight: number, units: UnitsPref): number {
  if (!Number.isFinite(parentWeight) || parentWeight <= 0) return 0;
  const step = weightStep(units);
  let next = roundToStep(parentWeight * DROP_LOAD_FRACTION, step);
  if (next >= parentWeight) next -= step;
  return Math.max(0, next);
}

/** Last completed set on this exercise is working (not warmup-only / none). */
export function canStartDrop(sets: DropSetSnapshot[]): boolean {
  return lastVolumeCompletedIdx(sets) >= 0;
}

/**
 * Prefill for the Kind=Drop chip on an incomplete set — prior completed
 * volume set before `setIdx`. Null when there is no parent.
 */
export function suggestDropFromPrior(
  sets: DropSetSnapshot[],
  setIdx: number,
  units: UnitsPref
): { weight: number; reps: number } | null {
  for (let i = setIdx - 1; i >= 0; i -= 1) {
    const s = sets[i];
    if (s?.completed && countsTowardVolume(s.kind)) {
      return { weight: suggestDropLoad(s.weight, units), reps: s.reps };
    }
  }
  return null;
}

/**
 * One-control start: mark the next set on this exercise as a drop of the
 * last completed working set. Adds a set when the last row is already done.
 */
export function planStartDrop(sets: DropSetSnapshot[], units: UnitsPref): DropStartPlan | null {
  const parentSetIdx = lastVolumeCompletedIdx(sets);
  if (parentSetIdx < 0) return null;
  const parent = sets[parentSetIdx];
  let targetSetIdx = -1;
  for (let i = parentSetIdx + 1; i < sets.length; i += 1) {
    if (!sets[i].completed) {
      targetSetIdx = i;
      break;
    }
  }
  const addSet = targetSetIdx < 0;
  if (addSet) targetSetIdx = sets.length;
  return {
    parentSetIdx,
    targetSetIdx,
    addSet,
    kind: 'drop',
    weight: suggestDropLoad(parent.weight, units),
    reps: parent.reps,
  };
}

/**
 * #508 compose: drop sets skip rest. Work-set plans (including last-rest)
 * pass through unchanged. Do not edit restTimer / planLogSetRest.
 */
export function composeDropRest<T extends RestPlan>(plan: T, kind: string | undefined): T {
  if (kind === 'drop') {
    return { ...plan, takeRest: false, restSeconds: 0 };
  }
  return plan;
}
