import type { CompletedWorkoutLog } from '@/types';
import type { UnitsPref } from '@/lib/units';
import { weightStep, weightUnitLabel } from '@/lib/units';
import { suggestNextSetTarget } from '@/lib/workout/nextSetTargets';
import { getExerciseById } from '@/data/exercises';

export type VictoryBodyDelta = {
  readiness: number;
  strain: number;
  recovery: number;
};

export type VictoryNextAction = {
  href: string;
  labelKey: string;
  /** English fallback for labelKey */
  defaultLabel: string;
  reasonKey: string;
  defaultReason: string;
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
  /** Forge-style one-liner for next session progression. */
  progressionInsight?: string;
  /** Single post-workout ritual CTA (S-Tier: one next action). */
  nextAction?: VictoryNextAction;
}

/** Build a short “Next: …” line from the heaviest working set in this log. */
export function buildProgressionInsight(
  log: CompletedWorkoutLog,
  units: UnitsPref
): string | undefined {
  let best: { exerciseId: string; reps: number; weight: number } | null = null;
  for (const ex of log.exercises) {
    for (const set of ex.sets) {
      if (set.kind === 'warmup' || set.weight <= 0) continue;
      if (!best || set.weight * set.reps > best.weight * best.reps) {
        best = { exerciseId: ex.exerciseId, reps: set.reps, weight: set.weight };
      }
    }
  }
  if (!best) return undefined;

  const target = suggestNextSetTarget(
    [{ reps: best.reps, weight: best.weight }],
    0,
    units
  );
  if (!target) return undefined;

  const name = getExerciseById(best.exerciseId)?.name ?? 'Next lift';
  const unit = weightUnitLabel(units);
  const step = weightStep(units);

  if (target.reason === 'add_weight') {
    return `Next: +${step} ${unit} on ${name} (hit top of range)`;
  }
  if (target.reason === 'add_reps') {
    return `Next: ${target.reps} × ${target.weight} ${unit} on ${name}`;
  }
  return `Next: hold ${target.reps} × ${target.weight} ${unit} on ${name}`;
}

/**
 * One boss next step after a session — Fuel first (protein), else Mind, else Move.
 * Keeps victory UI focused (not four equal doors).
 */
export function pickVictoryNextAction(opts?: {
  proteinLoggedToday?: boolean;
  strainDelta?: number;
}): VictoryNextAction {
  if (!opts?.proteinLoggedToday) {
    return {
      href: '/nutrition',
      labelKey: 'coachActionLogNutrition',
      defaultLabel: 'Log protein',
      reasonKey: 'victoryNextFuelReason',
      defaultReason: 'Fuel the work — log a meal so Win Score captures recovery nutrition.',
    };
  }
  if ((opts.strainDelta ?? 0) >= 5) {
    return {
      href: '/mind',
      labelKey: 'coachActionOpenMind',
      defaultLabel: '3-min Mind',
      reasonKey: 'victoryNextMindReason',
      defaultReason: 'Downshift strain with a short breathing session.',
    };
  }
  return {
    href: '/move',
    labelKey: 'coachActionOpenMove',
    defaultLabel: 'Mobility flow',
    reasonKey: 'victoryNextMoveReason',
    defaultReason: 'A short Move flow keeps tomorrow’s readiness high.',
  };
}

export function summarizeWorkoutVictory(
  log: CompletedWorkoutLog,
  streak: number,
  bodyDelta?: VictoryBodyDelta,
  progressionInsight?: string,
  nextAction?: VictoryNextAction
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
    nextAction: nextAction ?? pickVictoryNextAction({ strainDelta: bodyDelta?.strain }),
  };
}
