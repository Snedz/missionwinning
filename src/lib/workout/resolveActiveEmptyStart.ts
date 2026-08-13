/**
 * What empty `/active` Start should load.
 *
 * Cold device / no repeatable log → blank Quick Workout (shame-free).
 * Otherwise copy the last completed session (names + last loads/reps).
 * Train is the logger — this path never seeds Just Go or Coach.
 */

import type { CompletedWorkoutLog, WorkoutExerciseTemplate } from '@/types';
import { repeatLastSessionTemplate } from '@/lib/workout/repeatLastSession';

export type ActiveEmptyStart =
  | {
      kind: 'repeat_last';
      name: string;
      exercises: WorkoutExerciseTemplate[];
    }
  | { kind: 'empty' };

export function resolveActiveEmptyStart(
  history: readonly CompletedWorkoutLog[]
): ActiveEmptyStart {
  const template = repeatLastSessionTemplate(history);
  if (!template) return { kind: 'empty' };
  return {
    kind: 'repeat_last',
    name: template.name,
    exercises: template.exercises,
  };
}
