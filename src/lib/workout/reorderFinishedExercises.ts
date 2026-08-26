/**
 * Reorder lifts on a finished History session (`.1034`).
 *
 * Live Train already drags this session (`.998`). History edit
 * `.997` could change sets, not lift order. Same finished log.
 * Same id. Save still confirm-gated `decideEditSave`.
 * Wraps `reorderSessionExercises` — does not fork the splice.
 * Does not write Wednesday / saved / live Start. Pure: no store.
 */

import type { FinishedSessionDraft } from '@/lib/workout/editFinishedSession';
import { reorderSessionExercises } from '@/lib/workout/sessionReorder';

export type ReorderFinishedExercisesDecision =
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

export function decideReorderFinishedExercises(input: {
  draft: FinishedSessionDraft | null | undefined;
  fromIndex: unknown;
  toIndex: unknown;
}): ReorderFinishedExercisesDecision {
  const { draft, fromIndex, toIndex } = input;
  if (!draft || !Array.isArray(draft.exercises)) return { kind: 'empty' };
  if (!Number.isInteger(fromIndex) || !Number.isInteger(toIndex)) {
    return { kind: 'empty' };
  }
  const next = reorderSessionExercises(
    draft.exercises,
    fromIndex as number,
    toIndex as number
  );
  if (!next) return { kind: 'noop' };
  return { kind: 'apply', draft: { exercises: cloneDraftExercises(next) } };
}
