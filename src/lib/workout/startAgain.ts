/**
 * Session-out Start this again (`.991`).
 *
 * A finished log becomes a new Start — same lifts, last loads as targets,
 * sets not completed. Not a shop. Does not write the saved notebook (`.960`).
 * Live this-device session still wins (`.963`). Empty invents nothing.
 * Pure: no store, no fetch.
 */

import type { ActiveWorkout, CompletedWorkoutLog, WorkoutExerciseTemplate } from '@/types';
import { templateFromCompletedLog } from '@/lib/workout/historyRetrain';
import { protectLiveStart } from '@/lib/workout/sessionResume';

export type StartAgainDecision =
  | { kind: 'empty' }
  | { kind: 'resume-live' }
  | { kind: 'start'; name: string; exercises: WorkoutExerciseTemplate[] };

export function decideStartAgain(input: {
  log: Pick<CompletedWorkoutLog, 'workoutName' | 'exercises' | 'deletedAt'> | null | undefined;
  active?: ActiveWorkout | null;
}): StartAgainDecision {
  if (!input.log) return { kind: 'empty' };
  const template = templateFromCompletedLog(input.log);
  if (!template) return { kind: 'empty' };
  if (protectLiveStart(input.active) === 'keep') return { kind: 'resume-live' };
  return { kind: 'start', name: template.name, exercises: template.exercises };
}
