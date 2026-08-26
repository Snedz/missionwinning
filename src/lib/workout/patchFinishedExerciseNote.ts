/**
 * Optional per-lift diary on a finished History
 * exercise (`.1045`).
 *
 * Live already has `exerciseNote.ts` /
 * `EXERCISE_NOTE_MAX` 200 (`.996`). History
 * edit `.997` displayed `ex.note` as italic
 * and could not correct it. Same finished
 * log. Same id. Empty is valid (clear) —
 * field absent, never required. Over-cap
 * truncates at 200 (same as
 * `normalizeSessionNote` — never emptied).
 * Not a pin. Not `sessionNote`. Does not
 * rewrite sets. Save still confirm-gated
 * `decideEditSave`. Does not write Wednesday
 * / saved / live Start. Pure: no store.
 */

import type { FinishedSessionDraft } from '@/lib/workout/editFinishedSession';
import { normalizeExerciseNote } from '@/lib/workout/exerciseNote';

export type PatchFinishedExerciseNoteDecision =
  | { kind: 'empty' }
  | { kind: 'noop' }
  | { kind: 'apply'; draft: FinishedSessionDraft };

function isClearRaw(raw: unknown): boolean {
  if (raw === null || raw === undefined) return true;
  return typeof raw === 'string' && raw.trim() === '';
}

function cloneDraft(draft: FinishedSessionDraft): FinishedSessionDraft {
  return {
    exercises: draft.exercises.map((ex) => ({
      ...ex,
      sets: (ex.sets ?? []).map((set) => ({ ...set })),
    })),
  };
}

function applyExerciseNote(
  draft: FinishedSessionDraft,
  exerciseIndex: number,
  note: string | undefined
): FinishedSessionDraft {
  const next = cloneDraft(draft);
  const ex = next.exercises[exerciseIndex];
  if (!ex) return next;
  if (note === undefined) {
    const { note: _drop, ...rest } = ex;
    next.exercises[exerciseIndex] = rest;
    return next;
  }
  next.exercises[exerciseIndex] = { ...ex, note };
  return next;
}

export function decidePatchFinishedExerciseNote(input: {
  draft: FinishedSessionDraft | null | undefined;
  exerciseIndex: unknown;
  note: unknown;
}): PatchFinishedExerciseNoteDecision {
  const { draft, exerciseIndex, note } = input;
  if (!draft || !Array.isArray(draft.exercises)) return { kind: 'empty' };
  if (!Number.isInteger(exerciseIndex)) return { kind: 'empty' };
  const clear = isClearRaw(note);
  const parsed = normalizeExerciseNote(note);
  if (parsed === undefined && !clear) return { kind: 'empty' };
  const exIdx = exerciseIndex as number;
  if (exIdx < 0 || exIdx >= draft.exercises.length) return { kind: 'noop' };
  const exercise = draft.exercises[exIdx];
  if (!exercise) return { kind: 'noop' };
  const current = normalizeExerciseNote(exercise.note);
  if (clear) {
    if (current === undefined) return { kind: 'noop' };
    return {
      kind: 'apply',
      draft: applyExerciseNote(draft, exIdx, undefined),
    };
  }
  if (current === parsed) return { kind: 'noop' };
  return {
    kind: 'apply',
    draft: applyExerciseNote(draft, exIdx, parsed),
  };
}
