/**
 * Session dial wiring for Active — getSetInput / Apply-targets peel.
 *
 * Framework review Train extract: the page still owned the prescribed-vs-freestyle
 * history wiring around `resolveActiveSetDial` / `planApplyTargets`. That assembly
 * is where `.175` (dial order) and `.206` (hardcoded 10,0 defaults) lived — keep
 * it in one pure home so the page cannot reorder inputs or invent weight as 0
 * while ignoring `set.weight`.
 */

import type { CompletedWorkoutLog, SetKind } from '@/types';
import type { UnitsPref } from '@/lib/units';
import { repRangeForGoal } from '@/lib/coach/progression';
import {
  getLastPerformanceForSet,
  getLastSessionSets,
  planApplyTargets,
  resolveActiveSetDial,
} from '@/lib/workout/activeWorkoutHelpers';
import {
  patchesForApplyTargets,
  type SetInputFieldPatch,
} from '@/lib/workout/activeSetInputPatches';

/**
 * Template defaults when a set row is missing — never invent weight as 0 while
 * ignoring the set's own numbers (`.206`).
 */
export function setDialTemplateDefaults(
  set: { reps?: number; weight?: number } | null | undefined
): { defaultReps: number; defaultWeight: number } {
  return {
    defaultReps: set?.reps ?? 10,
    defaultWeight: set?.weight ?? 0,
  };
}

type SessionExLog = {
  exerciseId: string;
  prescribed?: boolean;
  sets: {
    completed: boolean;
    reps: number;
    weight: number;
    kind?: SetKind;
  }[];
};

/**
 * Page-facing dial for one set: manual → prescribed → session carry →
 * suggestion → last performance. Owns history/null-prescribed wiring so the
 * page cannot pass freestyle history onto a coached dial.
 */
export function resolveSessionSetDial(params: {
  exLog: SessionExLog | undefined;
  setIdx: number;
  defaultReps: number;
  defaultWeight: number;
  manual?: { reps: number; weight: number };
  workoutHistory: CompletedWorkoutLog[];
  units: UnitsPref;
  goalId: string;
}): { reps: number; weight: number } {
  const exLog = params.exLog;
  if (!exLog) {
    return { reps: params.defaultReps, weight: params.defaultWeight };
  }
  const range = repRangeForGoal(params.goalId);
  return resolveActiveSetDial({
    manual: params.manual,
    prescribed: exLog.prescribed,
    defaultReps: params.defaultReps,
    defaultWeight: params.defaultWeight,
    sets: exLog.sets,
    setIdx: params.setIdx,
    lastSets: exLog.prescribed
      ? null
      : getLastSessionSets(params.workoutHistory, exLog.exerciseId),
    units: params.units,
    repMin: range.min,
    repMax: range.max,
    lastPerformance: getLastPerformanceForSet(
      params.workoutHistory,
      exLog.exerciseId,
      params.setIdx
    ),
  });
}

/**
 * "Apply targets" → per-set field patches. Page only loops `updateSetInput`.
 */
export function planExerciseTargetPatches(params: {
  prescribed?: boolean;
  sets: { completed: boolean; reps: number; weight: number }[];
  lastSets: { reps: number; weight: number }[] | null;
  units: UnitsPref;
  goalId: string;
}): { setIdx: number; patches: SetInputFieldPatch[] }[] {
  const range = repRangeForGoal(params.goalId);
  const targets = planApplyTargets({
    prescribed: params.prescribed,
    sets: params.sets,
    lastSets: params.lastSets,
    units: params.units,
    repMin: range.min,
    repMax: range.max,
  });
  return patchesForApplyTargets(targets);
}
