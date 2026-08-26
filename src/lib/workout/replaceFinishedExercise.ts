/**
 * Replace a lift on a finished History session (`.1036`).
 *
 * History edit `.997` can change sets. Reorder `.1034` can
 * move lifts. Neither swaps the movement they logged by
 * mistake. Same finished log. Same id. Sets ride unchanged.
 * Save still confirm-gated `decideEditSave`.
 * Does not write Wednesday / saved / live Start. Pure: no store.
 */

import { getExerciseById } from '@/data/exercises';
import type { FinishedSessionDraft } from '@/lib/workout/editFinishedSession';
import {
  isCustomExerciseId,
  resolveExercise,
} from '@/lib/workout/customExercise';

export type ReplaceFinishedExerciseDecision =
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

function nextIdOf(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  return raw.trim();
}

function isKnownLift(id: string): boolean {
  if (!resolveExercise(id)) return false;
  if (getExerciseById(id)) return true;
  return isCustomExerciseId(id);
}

export function decideReplaceFinishedExercise(input: {
  draft: FinishedSessionDraft | null | undefined;
  exerciseIndex: unknown;
  nextExerciseId: unknown;
}): ReplaceFinishedExerciseDecision {
  const { draft, exerciseIndex, nextExerciseId } = input;
  if (!draft || !Array.isArray(draft.exercises)) return { kind: 'empty' };
  if (!Number.isInteger(exerciseIndex)) return { kind: 'empty' };
  const nextId = nextIdOf(nextExerciseId);
  if (!nextId) return { kind: 'empty' };
  const index = exerciseIndex as number;
  if (index < 0 || index >= draft.exercises.length) return { kind: 'noop' };
  const current = draft.exercises[index];
  if (!current) return { kind: 'noop' };
  if (current.exerciseId === nextId) return { kind: 'noop' };
  if (!isKnownLift(nextId)) return { kind: 'noop' };
  const exercises = cloneDraftExercises(draft.exercises);
  const target = exercises[index];
  if (!target) return { kind: 'noop' };
  target.exerciseId = nextId;
  return { kind: 'apply', draft: { exercises } };
}
