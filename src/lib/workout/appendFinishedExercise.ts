/**
 * Add a lift to a finished History session (`.1037`).
 *
 * History edit `.997` can change sets. Reorder `.1034`
 * can move lifts. Replace `.1036` can swap a movement.
 * None of those add a movement they forgot. Backfill
 * `.1000` is a new row. Add set is on an existing lift.
 * Same finished log. Same id. Save still confirm-gated
 * `decideEditSave`. Does not write Wednesday / saved /
 * live Start. Pure: no store.
 */

import { getExerciseById } from '@/data/exercises';
import type { FinishedSessionDraft } from '@/lib/workout/editFinishedSession';
import {
  isCustomExerciseId,
  resolveExercise,
} from '@/lib/workout/customExercise';

export type AppendFinishedExerciseDecision =
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

export function decideAppendFinishedExercise(input: {
  draft: FinishedSessionDraft | null | undefined;
  nextExerciseId: unknown;
}): AppendFinishedExerciseDecision {
  const { draft, nextExerciseId } = input;
  if (!draft || !Array.isArray(draft.exercises)) return { kind: 'empty' };
  const nextId = nextIdOf(nextExerciseId);
  if (!nextId) return { kind: 'empty' };
  if (!isKnownLift(nextId)) return { kind: 'noop' };
  const exercises = cloneDraftExercises(draft.exercises);
  exercises.push({
    exerciseId: nextId,
    sets: [{ reps: 0, weight: 0 }],
  });
  return { kind: 'apply', draft: { exercises } };
}
