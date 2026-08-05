/**
 * History → Train bridge (K7 · K11).
 *
 * Replay a completed log as a freestyle session template — same lift ids and
 * set counts, last logged weights/reps as starting targets. Pure: no store.
 */

import type { CompletedWorkoutLog, WorkoutExerciseTemplate } from '@/types';

export type HistoryRetrainTemplate = {
  name: string;
  exercises: WorkoutExerciseTemplate[];
};

/** Journal day-record ids for train rows are `train-${CompletedWorkoutLog.id}`. */
export const TRAIN_JOURNAL_ID_PREFIX = 'train-';

/**
 * Resolve a day-replay train entry to a completed log.
 * Null when not a train journal id or log is missing/tombstoned.
 */
export function logFromTrainJournalId(
  journalId: string,
  history: readonly CompletedWorkoutLog[]
): CompletedWorkoutLog | null {
  if (!journalId.startsWith(TRAIN_JOURNAL_ID_PREFIX)) return null;
  const id = journalId.slice(TRAIN_JOURNAL_ID_PREFIX.length);
  if (!id) return null;
  const log = history.find((w) => w.id === id);
  if (!log || log.deletedAt) return null;
  return log;
}

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
