/**
 * What empty `/active` Start should load.
 *
 * Cold device / no repeatable log → blank Quick Workout (shame-free).
 * Otherwise copy the last completed session (names + last loads/reps).
 * Train is the logger — this path never seeds Just Go or Coach.
 */

import type { CompletedWorkoutLog, SavedWorkout, WorkoutExerciseTemplate } from '@/types';
import { pickHonoredStart } from '@/lib/workout/honorSavedRoutine';
import { repeatLastSessionTemplate } from '@/lib/workout/repeatLastSession';

export type ActiveEmptyStart =
  | {
      kind: 'saved';
      name: string;
      exercises: WorkoutExerciseTemplate[];
      id: string;
    }
  | {
      kind: 'repeat_last';
      name: string;
      exercises: WorkoutExerciseTemplate[];
    }
  | { kind: 'empty' };

export function resolveActiveEmptyStart(
  history: readonly CompletedWorkoutLog[],
  saved: readonly SavedWorkout[] = []
): ActiveEmptyStart {
  const honored = pickHonoredStart({ saved, history });
  if (honored) {
    return {
      kind: 'saved',
      name: honored.name,
      exercises: honored.exercises,
      id: honored.id,
    };
  }
  const template = repeatLastSessionTemplate(history);
  if (!template) return { kind: 'empty' };
  return {
    kind: 'repeat_last',
    name: template.name,
    exercises: template.exercises,
  };
}
