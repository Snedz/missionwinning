import type { CompletedWorkoutLog } from '@/types';
import type { UnitsPref } from '@/lib/units';
import { weightStep, weightUnitLabel } from '@/lib/units';
import { suggestNextSetTarget } from '@/lib/nextSetTargets';
import { getExerciseById } from '@/data/exercises';

export type VictoryBodyDelta = {
  readiness: number;
  strain: number;
  recovery: number;
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

export function summarizeWorkoutVictory(
  log: CompletedWorkoutLog,
  streak: number,
  bodyDelta?: VictoryBodyDelta,
  progressionInsight?: string
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
  };
}
