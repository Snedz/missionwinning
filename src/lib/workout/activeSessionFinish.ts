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
