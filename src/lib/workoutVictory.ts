import type { CompletedWorkoutLog } from '@/types';

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
}

export function summarizeWorkoutVictory(
  log: CompletedWorkoutLog,
  streak: number,
  bodyDelta?: VictoryBodyDelta
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
  };
}
