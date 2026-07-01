import type { CompletedWorkoutLog } from '@/types';

export interface WorkoutVictorySummary {
  workoutName: string;
  totalVolume: number;
  durationSeconds: number;
  setCount: number;
  exerciseCount: number;
  streak: number;
}

export function summarizeWorkoutVictory(
  log: CompletedWorkoutLog,
  streak: number
): WorkoutVictorySummary {
  const setCount = log.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  return {
    workoutName: log.workoutName,
    totalVolume: log.totalVolume,
    durationSeconds: log.durationSeconds,
    setCount,
    exerciseCount: log.exercises.length,
    streak,
  };
}
