/**
 * History → Train bridge (K7).
 *
 * Replay a completed log as a freestyle session template — same lift ids and
 * set counts, last logged weights/reps as starting targets. Pure: no store.
 */

import type { CompletedWorkoutLog, WorkoutExerciseTemplate } from '@/types';

export type HistoryRetrainTemplate = {
  name: string;
  exercises: WorkoutExerciseTemplate[];
};

/**
 * Build a startWorkout template from a finished session.
 * Null when there is nothing to train (tombstone, empty, or no sets).
 */
export function templateFromCompletedLog(
  log: Pick<CompletedWorkoutLog, 'workoutName' | 'exercises' | 'deletedAt'>
): HistoryRetrainTemplate | null {
  if (log.deletedAt) return null;
  if (!log.exercises?.length) return null;

  const exercises: WorkoutExerciseTemplate[] = [];
  for (const ex of log.exercises) {
    if (!ex.exerciseId) continue;
    const sets = (ex.sets ?? [])
      .map((s) => ({
        reps: typeof s.reps === 'number' && s.reps > 0 ? s.reps : 8,
        weight: typeof s.weight === 'number' && s.weight >= 0 ? s.weight : 0,
      }))
      .filter((s) => s.reps > 0);
    if (sets.length === 0) {
      sets.push({ reps: 8, weight: 0 });
    }
    exercises.push({ exerciseId: ex.exerciseId, sets });
  }

  if (exercises.length === 0) return null;

  const name = (log.workoutName || 'Session').trim() || 'Session';
  return { name, exercises };
}
