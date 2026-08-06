/**
 * Pure decisions for finishing a set / finishing a session on Active.
 *
 * Peels side-effect planning out of ActiveWorkoutPage so handleLogSet /
 * handleComplete stay thin wrappers (T2.1 · `.405`). Store / toast / router
 * stay on the page.
 */

import type { ActiveExerciseLog, CompletedWorkoutLog, SetKind } from '@/types';
import type { UnitsPref } from '@/lib/units';
import { weightUnitLabel } from '@/lib/units';
import { repRangeForGoal } from '@/lib/coach/progression';
import { buildDebrief, type Debrief } from '@/lib/coach/debrief';
import { getTrainingStreak } from '@/lib/streaks';
import {
  collectFragments,
  composeSessionEntry,
  type ComposedSessionEntry,
} from '@/lib/journal/composeEntry';
import { computeBodyScores } from '@/lib/score';
import type { MindCheckIn } from '@/lib/mindCheckIns';
import { shouldRestAfterLog } from '@/lib/workout/superset';
import { restSecondsForExercise } from '@/lib/workout/restTimer';
import { isPersonalRecord } from '@/lib/workout/workoutPr';
import {
  bodyScoreDeltas,
  type BodyScoreTriple,
} from '@/lib/workout/activeWorkoutHelpers';
import {
  buildProgressionInsight,
  summarizeWorkoutVictory,
  type WorkoutVictorySummary,
} from '@/lib/workout/workoutVictory';

/**
 * Resolve what to log for one set (override wins; else dial).
 * Returns null when the exercise/set slot is missing — page no-ops.
 */
export type LogSetPayload = {
  exerciseId: string;
  setKind: SetKind;
  input: { reps: number; weight: number };
};

export function resolveLogSetPayload(params: {
  exerciseId: string | undefined;
  set: { reps: number; weight: number; kind?: SetKind } | undefined;
  override?: { reps: number; weight: number };
  dial: { reps: number; weight: number };
}): LogSetPayload | null {
  if (!params.exerciseId || !params.set) return null;
  return {
    exerciseId: params.exerciseId,
    setKind: params.set.kind ?? 'normal',
    input: params.override ?? params.dial,
  };
}

/** PR check against completed history (active set is not history yet). */
export function logSetIsPr(params: {
  exerciseId: string;
  reps: number;
  weight: number;
  setKind: SetKind;
  workoutHistory: CompletedWorkoutLog[];
}): boolean {
  return isPersonalRecord(
    params.exerciseId,
    params.reps,
    params.weight,
    params.workoutHistory,
    params.setKind
  );
}

/** Brass PR haptic pattern (Design Orchestration D0) — null when not a PR. */
export const PR_HAPTIC_PATTERN = [80, 40, 80] as const;

export function planPrHaptic(isPr: boolean): readonly number[] | null {
  return isPr ? PR_HAPTIC_PATTERN : null;
}

/** Toast when Finish is tapped with zero completed sets. */
export type NothingLoggedToastCopy = {
  titleKey: string;
  titleDefault: string;
  descKey: string;
  descDefault: string;
  /** Prefer default — empty finish is guidance, not an error. */
  variant: 'default';
};

export function nothingLoggedToastCopy(): NothingLoggedToastCopy {
  return {
    titleKey: 'activeNothingLogged',
    titleDefault: 'Log a set first',
    descKey: 'activeNothingLoggedDesc',
    descDefault: 'Finish unlocks after at least one completed set.',
    variant: 'default',
  };
}

/**
 * Why Finish must not open Victory. Pure — page toasts and keeps the session.
 * `null` means finish is allowed (store still may return null if race-cleared).
 */
export type FinishBlockedReason = 'no_sets';

export function finishBlockedReason(
  exercises: { sets: { completed: boolean }[] }[] | null | undefined
): FinishBlockedReason | null {
  if (!exercises?.length) return 'no_sets';
  let completed = 0;
  for (const ex of exercises) {
    for (const s of ex.sets) {
      if (s.completed) completed++;
    }
  }
  return completed === 0 ? 'no_sets' : null;
}

export type LogSetRestPlan = {
  takeRest: boolean;
  restSeconds: number;
};

/**
 * After a set is written into the store: whether to start rest and for how long.
 */
export function planLogSetRest(params: {
  /** Full active exercises after the set was marked complete. */
  exercisesAfterLog: ActiveExerciseLog[];
  exIdx: number;
  setIdx: number;
  /** Result of logSetAndAdvance — next open set or null. */
  advanceNext: { exerciseIndex: number; setIndex: number } | null;
  exerciseName: string | undefined;
}): LogSetRestPlan {
  return {
    takeRest: shouldRestAfterLog(
      params.exercisesAfterLog,
      params.exIdx,
      params.setIdx,
      params.advanceNext
    ),
    restSeconds: restSecondsForExercise(params.exerciseName),
  };
}

export type ActiveVictoryAssembly = {
  historyAfter: CompletedWorkoutLog[];
  streak: number;
  debrief: Debrief;
  entry: ComposedSessionEntry;
  victorySummary: WorkoutVictorySummary;
  scoreDeltas: BodyScoreTriple;
  /** Patch for push subscription sync — high zone only as one bit. */
  pushPatch: { lastSessionAt: string; lastSessionHigh: boolean };
  journal: {
    workoutId: string;
    date: string;
    workoutName: string;
    zone: Debrief['zone'];
    lines: ComposedSessionEntry['lines'];
    fragments?: string[];
    checkIn?: ComposedSessionEntry['checkIn'];
  };
};

/**
 * Everything pure about finishing a session — debrief, journal lines, Victory
 * summary, push high-bit. Page still owns completeActiveWorkout + side effects.
 */
export function assembleActiveVictory(params: {
  log: CompletedWorkoutLog;
  historyBefore: CompletedWorkoutLog[];
  checkIn: MindCheckIn | null | undefined;
  sessionNote: string;
  units: UnitsPref;
  goalId: string;
  hasCoachPlan: boolean;
  resolveExerciseName: (exerciseId: string) => string;
}): ActiveVictoryAssembly {
  const historyAfter = [params.log, ...params.historyBefore];
  const streak = getTrainingStreak(historyAfter);
  const unit = weightUnitLabel(params.units);
  const debrief = buildDebrief({
    log: params.log,
    history: historyAfter,
    checkIn: params.checkIn,
    unit,
  });
  const entry = composeSessionEntry(
    debrief,
    collectFragments(params.log, params.sessionNote, params.resolveExerciseName),
    params.checkIn
  );
  const beforeScores = computeBodyScores(params.historyBefore, {
    checkIn: params.checkIn,
  });
  const afterScores = computeBodyScores(historyAfter, { checkIn: params.checkIn });
  const scoreDeltas = bodyScoreDeltas(beforeScores, afterScores);
  const victorySummary = summarizeWorkoutVictory(
    params.log,
    streak,
    scoreDeltas,
    buildProgressionInsight(params.log, params.units, repRangeForGoal(params.goalId)),
    undefined,
    {
      completedWorkouts: historyAfter.length,
      hasCoachPlan: params.hasCoachPlan,
      strainDelta: scoreDeltas.strain,
    }
  );

  return {
    historyAfter,
    streak,
    debrief,
    entry,
    victorySummary,
    scoreDeltas,
    pushPatch: {
      lastSessionAt: params.log.completedAt,
      lastSessionHigh: debrief.zone === 'high',
    },
    journal: {
      workoutId: params.log.id,
      date: params.log.completedAt,
      workoutName: params.log.workoutName,
      zone: debrief.zone,
      lines: entry.lines,
      ...(entry.fragments.length > 0 ? { fragments: entry.fragments } : {}),
      ...(entry.checkIn ? { checkIn: entry.checkIn } : {}),
    },
  };
}
