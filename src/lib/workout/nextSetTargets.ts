/**
 * RepStack-style next-set targets from last session (double progression).
 * Free forever — core tracker. See docs/DESIGN_RESEARCH.md § Wave 2.
 */

import type { UnitsPref } from '@/lib/units';
import { weightStep } from '@/lib/units';
import { roundToStep, workingSets } from '@/lib/workout/setMath';

export type SetSnapshot = {
  reps: number;
  weight: number;
  kind?: string;
};

export type NextSetTarget = {
  reps: number;
  weight: number;
  /** Why this suggestion — for UI chip / a11y. */
  reason: 'hold' | 'add_reps' | 'add_weight' | 'from_last';
  /**
   * 0-based indices into `workingSets(lastSets)` that produced this number.
   * E-Adjacency cites these as 1-based original set numbers (warmup skipped).
   */
  evidenceWorkingIdx: number[];
};

const DEFAULT_REP_MIN = 8;
const DEFAULT_REP_MAX = 12;

/**
 * Suggest next weight/reps from the matching set index in the last session.
 * Double progression: climb reps in range, then +weightStep and reset to min.
 */
export function suggestNextSetTarget(
  lastSets: SetSnapshot[],
  setIdx: number,
  units: UnitsPref,
  opts?: { repMin?: number; repMax?: number }
): NextSetTarget | null {
  const ws = workingSets(lastSets);
  if (!ws.length) return null;

  const repMin = opts?.repMin ?? DEFAULT_REP_MIN;
  const repMax = opts?.repMax ?? DEFAULT_REP_MAX;
  const step = weightStep(units);

  const matchIdx = setIdx < ws.length ? setIdx : ws.length - 1;
  const match = ws[matchIdx]!;
  const lastReps = Math.max(1, Math.round(match.reps));
  const lastWeight = Math.max(0, match.weight);

  // All working sets hit top of range at same weight → load up
  const allHitTop =
    ws.length > 0 &&
    ws.every((s) => s.reps >= repMax && Math.abs(s.weight - lastWeight) < step / 2);
  const evidenceWorkingIdx = allHitTop
    ? ws.map((_, i) => i)
    : [matchIdx];

  if (allHitTop && lastWeight > 0) {
    return {
      reps: repMin,
      weight: roundToStep(lastWeight + step, step),
      reason: 'add_weight',
      evidenceWorkingIdx,
    };
  }

  if (lastReps >= repMax && lastWeight > 0) {
    return {
      reps: repMin,
      weight: roundToStep(lastWeight + step, step),
      reason: 'add_weight',
      evidenceWorkingIdx,
    };
  }

  if (lastReps < repMax) {
    return {
      reps: Math.min(repMax, lastReps + 1),
      weight: lastWeight,
      reason: 'add_reps',
      evidenceWorkingIdx,
    };
  }

  return { reps: lastReps, weight: lastWeight, reason: 'from_last', evidenceWorkingIdx };
}

/** Per-set targets for an exercise's planned set count. */
export function suggestTargetsForExercise(
  lastSets: SetSnapshot[],
  plannedSetCount: number,
  units: UnitsPref,
  opts?: { repMin?: number; repMax?: number }
): (NextSetTarget | null)[] {
  return Array.from({ length: plannedSetCount }, (_, i) =>
    suggestNextSetTarget(lastSets, i, units, opts)
  );
}
