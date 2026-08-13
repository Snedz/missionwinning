import type { CompletedWorkoutLog } from '@/types';
import type { UnitsPref } from '@/lib/units';
import { weightStep, weightUnitLabel } from '@/lib/units';
import { suggestNextSetTarget } from '@/lib/workout/nextSetTargets';
import { sessionIsCoachPrescribed } from '@/lib/workout/activeWorkoutHelpers';
import { getExerciseById } from '@/data/exercises';
import type { VictoryReceipt } from '@/lib/workout/victoryReceipt';
import {
  pickVictoryNextAction as pickVictoryNextActionCore,
  COACH_VICTORY_EARLY_WORKOUTS as COACH_VICTORY_EARLY_WORKOUTS_CORE,
  type VictoryNextAction as VictoryNextActionCore,
  type PickVictoryNextActionOpts as PickVictoryNextActionOptsCore,
} from '../../../packages/mw-core/src/workout/victory';

export type VictoryBodyDelta = {
  readiness: number;
  strain: number;
  recovery: number;
};

/** Re-export — one definition lives in packages/mw-core (`.641`). */
export type VictoryNextAction = VictoryNextActionCore;
export type PickVictoryNextActionOpts = PickVictoryNextActionOptsCore;
export const COACH_VICTORY_EARLY_WORKOUTS = COACH_VICTORY_EARLY_WORKOUTS_CORE;

/**
 * Next-session progression cue after Victory (pure — UI maps reason → i18n).
 * `.290`: structured (not a hard-coded English sentence); includes bodyweight.
 */
export type ProgressionInsight = {
  reason: 'add_weight' | 'add_reps' | 'hold';
  exerciseName: string;
  unit: string;
  /** Stored weight is 0 — BW progress is rep-based. */
  bodyweight: boolean;
  step: number;
  reps: number;
  weight: number;
};

export interface WorkoutVictorySummary {
  workoutName: string;
  totalVolume: number;
  durationSeconds: number;
  setCount: number;
  exerciseCount: number;
  streak: number;
  /** IntervalCoach-style “what changed” from computeBodyScores before/after. */
  bodyDelta?: VictoryBodyDelta;
  /** Forge-style next-session progression (structured for i18n). */
  progressionInsight?: ProgressionInsight;
  /** Single post-workout ritual CTA (S-Tier: one next action). */
  nextAction?: VictoryNextAction;
  /** Vs-last receipt from local logs — instant, offline, free (.712). */
  receipt?: VictoryReceipt;
}

/** Rank working sets: load×reps when loaded; reps alone when bodyweight. */
function workingSetScore(reps: number, weight: number): number {
  return weight > 0 ? weight * reps : reps;
}

/**
 * Build next-session progression from the strongest working set in this log.
 * Pure payload — call `formatProgressionInsight` or UI i18n keys for display.
 *
 * Freestyle sessions use double progression (add reps, then weight). A Coach-
 * prescribed session must not get that language — the plan owns next loads
 * (deload, strength 3×5, etc.), and Victory already points the athlete at
 * Mission Coach. Freestyle "hit top of range" after a coached 5 is a lie.
 *
 * Uses `sessionIsCoachPrescribed` (`.280`) — one definition for Active chrome
 * and Victory. Requires the completed log to still carry `prescribed` (`.410`).
 * Returns undefined for coached sessions (no freestyle next-load cue).
 */
export function buildProgressionInsight(
  log: CompletedWorkoutLog,
  units: UnitsPref,
  /** The athlete's goal range; omitted falls back to the generic 8-12. */
  repRange?: { min: number; max: number }
): ProgressionInsight | undefined {
  if (sessionIsCoachPrescribed(log.exercises)) {
    return undefined;
  }

  let best: { exerciseId: string; reps: number; weight: number } | null = null;
  for (const ex of log.exercises) {
    for (const set of ex.sets) {
      if (set.kind === 'warmup') continue;
      if (!Number.isFinite(set.reps) || set.reps <= 0) continue;
      const weight = Number.isFinite(set.weight) ? set.weight : 0;
      if (
        !best ||
        workingSetScore(set.reps, weight) > workingSetScore(best.reps, best.weight)
      ) {
        best = { exerciseId: ex.exerciseId, reps: set.reps, weight };
      }
    }
  }
  if (!best) return undefined;

  const target = suggestNextSetTarget(
    [{ reps: best.reps, weight: best.weight }],
    0,
    units,
    { repMin: repRange?.min, repMax: repRange?.max }
  );
  if (!target) return undefined;

  const name = getExerciseById(best.exerciseId)?.name ?? 'Next lift';
  const unit = weightUnitLabel(units);
  const step = weightStep(units);
  const bodyweight = best.weight <= 0;
  const reason =
    target.reason === 'add_weight'
      ? ('add_weight' as const)
      : target.reason === 'add_reps'
        ? ('add_reps' as const)
        : ('hold' as const);

  return {
    reason,
    exerciseName: name,
    unit,
    bodyweight,
    step,
    reps: target.reps,
    weight: target.weight,
  };
}

/** English defaults for tests + share paths — UI prefers i18n keys. */
export function formatProgressionInsight(insight: ProgressionInsight): string {
  const { reason, exerciseName: name, unit, bodyweight, step, reps, weight } = insight;
  if (reason === 'add_weight' && !bodyweight) {
    return `Next: +${step} ${unit} on ${name} (hit top of range)`;
  }
  if (bodyweight) {
    if (reason === 'add_reps') return `Next: ${reps} reps on ${name}`;
    return `Next: hold ${reps} on ${name}`;
  }
  if (reason === 'add_reps') {
    return `Next: ${reps} × ${weight} ${unit} on ${name}`;
  }
  return `Next: hold ${reps} × ${weight} ${unit} on ${name}`;
}

/** i18n key for a structured progression insight. */
export function progressionInsightKey(insight: ProgressionInsight): string {
  if (insight.reason === 'add_weight' && !insight.bodyweight) {
    return 'victoryProgressAddWeight';
  }
  if (insight.bodyweight) {
    return insight.reason === 'add_reps'
      ? 'victoryProgressAddRepsBw'
      : 'victoryProgressHoldBw';
  }
  return insight.reason === 'add_reps'
    ? 'victoryProgressAddReps'
    : 'victoryProgressHold';
}

/**
 * One boss next step after a session — **single definition** in mw-core.
 * Week-1 session 2, early Coach, strain Mind, free Fuel: packages/mw-core.
 */
export function pickVictoryNextAction(opts?: PickVictoryNextActionOpts): VictoryNextAction {
  return pickVictoryNextActionCore(opts);
}

/**
 * Signed body-delta chip text — one format for readiness / strain / recovery (.429).
 */
export function formatVictorySignedDelta(n: number): string {
  return n > 0 ? `+${n}` : `${n}`;
}

/**
 * Secondary "Back to Today" only when the primary next is Coach / Train / session-2 —
 * not when the primary is already Today (rest path). One boss CTA stays primary;
 * Today is a quiet escape, never a second outline button (`.422`).
 */
export function shouldShowVictoryBackTodaySecondary(
  nextHref: string | undefined | null
): boolean {
  return typeof nextHref === 'string' && nextHref.length > 0 && !nextHref.includes('/log');
}

export function summarizeWorkoutVictory(
  log: CompletedWorkoutLog,
  streak: number,
  bodyDelta?: VictoryBodyDelta,
  progressionInsight?: ProgressionInsight,
  nextAction?: VictoryNextAction,
  pickOpts?: PickVictoryNextActionOpts,
  receipt?: VictoryReceipt
): WorkoutVictorySummary {
  const setCount = log.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  return {
    workoutName: log.workoutName,
    totalVolume: log.totalVolume,
    durationSeconds: log.durationSeconds,
    setCount,
    exerciseCount: log.exercises.length,
    streak,
    bodyDelta,
    progressionInsight,
    nextAction:
      nextAction ??
      pickVictoryNextAction({
        strainDelta: bodyDelta?.strain,
        ...pickOpts,
      }),
    ...(receipt ? { receipt } : {}),
  };
}
