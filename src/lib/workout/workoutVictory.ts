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
  units: UnitsPref,
  /** The athlete's goal range; omitted falls back to the generic 8-12. */
  repRange?: { min: number; max: number }
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
    units,
    { repMin: repRange?.min, repMax: repRange?.max }
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

/** Prefer Mission Coach on victory for the first N completed workouts (wedge habit). */
export const COACH_VICTORY_EARLY_WORKOUTS = 3;

export type PickVictoryNextActionOpts = {
  proteinLoggedToday?: boolean;
  strainDelta?: number;
  /** Workouts completed including the session just finished. */
  completedWorkouts?: number;
  /** True when a Mission Coach plan is loaded for the user. */
  hasCoachPlan?: boolean;
};

/**
 * One boss next step after a session.
 * Prefer Mission Coach / next train — stay in the Train+Coach wedge (Horizon W).
 */
export function pickVictoryNextAction(opts?: PickVictoryNextActionOpts): VictoryNextAction {
  const early =
    typeof opts?.completedWorkouts === 'number' &&
    opts.completedWorkouts > 0 &&
    opts.completedWorkouts <= COACH_VICTORY_EARLY_WORKOUTS;
  // Explicit plan presence (true or false) → Coach. Early workouts → Coach.
  const wantsCoach = early || opts?.hasCoachPlan === true || opts?.hasCoachPlan === false;

  if (wantsCoach) {
    return {
      href: '/coach',
      labelKey: 'victoryNextCoachLabel',
      defaultLabel: 'See Mission Coach',
      reasonKey: 'victoryNextCoachReason',
      defaultReason: 'Coach adapts your week from this log — no wearable needed.',
    };
  }

  // High strain: rest / lighter train — not Mind tourism.
  if ((opts?.strainDelta ?? 0) >= 5) {
    return {
      href: '/log',
      labelKey: 'victoryNextRestLabel',
      defaultLabel: 'Back to Today',
      reasonKey: 'victoryNextRestReason',
      defaultReason: 'Strain is up — recover, then hit a lighter session when ready.',
    };
  }

  return {
    href: '/active',
    labelKey: 'victoryNextTrainLabel',
    defaultLabel: 'Train again',
    reasonKey: 'victoryNextTrainReason',
    defaultReason: 'Keep the path alive — Just Go when you’re ready.',
  };
}

export function summarizeWorkoutVictory(
  log: CompletedWorkoutLog,
  streak: number,
  bodyDelta?: VictoryBodyDelta,
  progressionInsight?: string,
  nextAction?: VictoryNextAction,
  pickOpts?: PickVictoryNextActionOpts
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
  };
}
