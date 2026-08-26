/**
 * Remove this lift from a finished History session (`.1038`).
 *
 * History edit `.997` can change sets. Reorder `.1034`
 * can move lifts. Replace `.1036` can swap a movement.
 * Add `.1037` can append a lift. None of those drop a
 * whole movement they added by mistake. Session delete
 * `.1003` is the whole log. Same finished log. Same id.
 * Last remaining lift is noop. Save still confirm-gated
 * `decideEditSave`. Does not write Wednesday / saved /
 * live Start. Does not delete the session. Pure: no store.
 */

import type { FinishedSessionDraft } from '@/lib/workout/editFinishedSession';

export type RemoveFinishedExerciseDecision =
  | { kind: 'empty' }
  | { kind: 'noop' }
  | { kind: 'apply'; draft: FinishedSessionDraft };

function cloneDraftExercises(
  exercises: FinishedSessionDraft['exercises']
): FinishedSessionDraft['exercises'] {
  return exercises.map((ex) => ({
    ...ex,
    sets: (ex.sets ?? []).map((set) => ({ ...set })),
  }));
}

export function decideRemoveFinishedExercise(input: {
  draft: FinishedSessionDraft | null | undefined;
  exerciseIndex: unknown;
}): RemoveFinishedExerciseDecision {
  const { draft, exerciseIndex } = input;
  if (!draft || !Array.isArray(draft.exercises)) return { kind: 'empty' };
  if (!Number.isInteger(exerciseIndex)) return { kind: 'empty' };
  const index = exerciseIndex as number;
  if (index < 0 || index >= draft.exercises.length) return { kind: 'noop' };
  if (draft.exercises.length <= 1) return { kind: 'noop' };
  const exercises = cloneDraftExercises(draft.exercises);
  exercises.splice(index, 1);
  return { kind: 'apply', draft: { exercises } };
}
