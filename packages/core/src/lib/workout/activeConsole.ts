/**
 * Active console — buildConsoleSet, dock, form-guide sheet, swap rank.
 * Pure. No React / store.
 */
import type { CompletedWorkoutLog, SetSide } from '@/types';
import { repRangeForGoal } from '@/lib/coach/progression';
import { suggestNextSetTarget } from '@/lib/workout/nextSetTargets';
import { resolveLastSetGhost, type LastSetGhost } from '@/lib/workout/lastSetGhost';
import {
  buildOverloadCue,
  formatOverloadSetLine,
  overloadReasonDefault,
  overloadReasonKey,
} from '@/lib/workout/progressiveOverloadCue';
import { isUnilateralExercise, parseSetSide } from '@/lib/workout/unilateral';
import { getLastPerformanceForSet, getLastSessionSets } from '@/lib/workout/activeDial';

/**
 * Swap picker ranking — shared muscle groups first, then locale name order.
 * Extracted from ActiveWorkoutPage so the sort cannot silently invert (Kaizen K5).
 */
export function rankSwapCandidates<T extends { id: string; name: string; muscleGroups: string[] }>(
  catalog: readonly T[],
  current: { id: string; muscleGroups: readonly string[] },
  compareNames: (a: string, b: string) => number
): T[] {
  return [...catalog]
    .filter((e) => e.id !== current.id)
    .sort((a, b) => {
      const aShared = a.muscleGroups.some((m) => current.muscleGroups.includes(m));
      const bShared = b.muscleGroups.some((m) => current.muscleGroups.includes(m));
      if (aShared !== bShared) return aShared ? -1 : 1;
      return compareNames(a.name, b.name);
    });
}

export type ConsoleSetKind = 'normal' | 'warmup' | 'failure' | 'drop';

export type ConsoleSetView = {
  exIdx: number;
  setIdx: number;
  exerciseName: string;
  totalSets: number;
  kind: ConsoleSetKind;
  side?: SetSide;
  unilateral: boolean;
  plusLoad: boolean;
  /** True when the catalog equipment loads plates on a bar. */
  barLoaded: boolean;
  input: { reps: number; weight: number };
  /** Last working set (not warmup). Null on first-ever. */
  lastSetGhost: LastSetGhost | null;
  overloadCue: {
    lastLine: string | null;
    nextLine: string | null;
    reasonLine: string | null;
    nextTarget: { reps: number; weight: number } | null;
  };
};

/**
 * Compact log-console payload for the next incomplete set.
 * Extracted from ActiveWorkoutPage so coach-vs-freestyle + overload cue cannot
 * silently diverge from tests (Kaizen Loop 2 L2 / `.297`).
 */
export function buildConsoleSet(params: {
  exercises: {
    exerciseId: string;
    prescribed?: boolean;
    sets: {
      reps: number;
      weight: number;
      completed: boolean;
      kind?: ConsoleSetKind;
      side?: SetSide;
    }[];
  }[];
  nextSet: { exIdx: number; setIdx: number } | null;
  workoutHistory: CompletedWorkoutLog[];
  units: 'metric' | 'imperial';
  goalId: string;
  unitLabel: string;
  bodyweightLabel: string;
  resolveExerciseName: (exerciseId: string) => string;
  resolvePlusLoad?: (exerciseId: string) => boolean;
  resolveBarLoaded?: (exerciseId: string) => boolean;
  resolveInput: (
    exIdx: number,
    setIdx: number,
    defaultReps: number,
    defaultWeight: number
  ) => { reps: number; weight: number };
  translateReason: (key: string, defaultValue: string) => string;
}): ConsoleSetView | null {
  const { exercises, nextSet } = params;
  if (!nextSet) return null;
  const exLog = exercises[nextSet.exIdx];
  if (!exLog) return null;
  const set = exLog.sets[nextSet.setIdx];
  if (!set) return null;

  const last = getLastPerformanceForSet(
    params.workoutHistory,
    exLog.exerciseId,
    nextSet.setIdx,
    exLog.sets
  );
  const lastSets = getLastSessionSets(params.workoutHistory, exLog.exerciseId);
  const range = repRangeForGoal(params.goalId);

  const suggested = exLog.prescribed
    ? { reps: set.reps, weight: set.weight, reason: null as null }
    : lastSets
      ? suggestNextSetTarget(lastSets, nextSet.setIdx, params.units, {
          repMin: range.min,
          repMax: range.max,
        })
      : null;

  const cue = buildOverloadCue({
    last: last ? { reps: last.reps, weight: last.weight } : null,
    next: suggested ? { reps: suggested.reps, weight: suggested.weight } : null,
    reason: suggested && 'reason' in suggested ? suggested.reason : null,
    prescribed: !!exLog.prescribed,
  });

  const reasonKey = overloadReasonKey(cue.reason);
  const reasonLine =
    reasonKey && cue.reason
      ? params.translateReason(reasonKey, overloadReasonDefault(cue.reason) ?? '')
      : null;
  const plusLoad = params.resolvePlusLoad?.(exLog.exerciseId) === true;

  return {
    exIdx: nextSet.exIdx,
    setIdx: nextSet.setIdx,
    exerciseName: params.resolveExerciseName(exLog.exerciseId),
    totalSets: exLog.sets.length,
    kind: set.kind ?? 'normal',
    side: parseSetSide(set.side),
    unilateral: isUnilateralExercise({
      id: exLog.exerciseId,
      name: params.resolveExerciseName(exLog.exerciseId),
    }),
    plusLoad,
    barLoaded: params.resolveBarLoaded?.(exLog.exerciseId) ?? false,
    input: params.resolveInput(nextSet.exIdx, nextSet.setIdx, set.reps, set.weight),
    lastSetGhost: resolveLastSetGhost(params.workoutHistory, exLog.exerciseId),
    overloadCue: {
      lastLine: cue.last
        ? formatOverloadSetLine(
            cue.last.reps,
            cue.last.weight,
            params.unitLabel,
            params.bodyweightLabel,
            plusLoad
          )
        : null,
      nextLine: cue.next
        ? formatOverloadSetLine(
            cue.next.reps,
            cue.next.weight,
            params.unitLabel,
            params.bodyweightLabel,
            plusLoad
          )
        : null,
      reasonLine: reasonLine || null,
      nextTarget: cue.next
        ? { reps: cue.next.reps, weight: cue.next.weight }
        : null,
    },
  };
}
/**
 * Active bottom dock: rest takes the dock. Set entry is the table on every
 * surface — never a second console under the rows.
 */
export type ActiveDockMode = 'rest' | 'console' | null;

export function resolveActiveDockMode(params: {
  restTimerActive: boolean;
  hasConsoleSet: boolean;
  isCompact: boolean;
}): ActiveDockMode {
  if (params.restTimerActive) return 'rest';
  void params.hasConsoleSet;
  void params.isCompact;
  return null;
}

/**
 * Form guide sheet props from an exercise id, or null when the catalog has no
 * guide for that id. Keeps the Active page free of an open IIFE in JSX.
 */
export function resolveFormGuideSheet<TExercise extends { id: string; name: string }, TGuide>(params: {
  formGuideId: string | null;
  getExerciseById: (id: string) => TExercise | undefined;
  getFormGuideOrCues: (id: string, opts: { exercise: TExercise | undefined }) => TGuide | null;
}): { exerciseId: string; exerciseName: string; guide: TGuide } | null {
  if (!params.formGuideId) return null;
  const ex = params.getExerciseById(params.formGuideId);
  const guide = params.getFormGuideOrCues(params.formGuideId, { exercise: ex });
  if (!ex || !guide) return null;
  return { exerciseId: ex.id, exerciseName: ex.name, guide };
}
/**
 * Swap sheet candidates only when this exercise owns the open swap UI —
 * keeps the Active map free of an inline empty-array ternary.
 */
export function resolveSwapCandidatesWhenOpen<
  T extends { id: string; name: string; muscleGroups: string[] },
>(params: {
  swapOpenIdx: number | null;
  exIdx: number;
  catalog: T[];
  current: T;
  compareNames: (a: string, b: string) => number;
}): T[] {
  if (params.swapOpenIdx !== params.exIdx) return [];
  return rankSwapCandidates(params.catalog, params.current, params.compareNames);
}
