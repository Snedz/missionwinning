/**
 * Door from a template session into the free logger.
 * Returns draft exercises only. Does not read or write history.
 */

import type { WorkoutExerciseTemplate, WorkoutSetTemplate } from '@/types';
import type { ProgramSession } from './types';

export function sessionToTrainDraft(session: ProgramSession): WorkoutExerciseTemplate[] {
  return [...session.exercises]
    .sort((a, b) => a.order - b.order)
    .map((exercise) => ({
      exerciseId: exercise.exerciseId,
      prescribed: true,
      sets: [...exercise.suggestedSets]
        .sort((a, b) => a.setIndex - b.setIndex)
        .map((set): WorkoutSetTemplate => {
          const seconds = set.seconds;
          return {
            reps: set.reps ?? 1,
            weight: set.weightKg ?? 0,
            ...(seconds != null ? { durationSeconds: seconds } : {}),
          };
        }),
    }));
}
