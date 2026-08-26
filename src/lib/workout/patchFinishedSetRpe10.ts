/**
 * Optional 1–10 RPE on a finished History set (`.1040`).
 *
 * Live already has `parseOptionalRpe10` / `SetRpe10Select`
 * (`.967`). History edit `.997` could not correct a
 * logged RPE. Same finished log. Same id. Empty is
 * valid (clear) — field absent, never required.
 * Out of range invents nothing (never clamped).
 * Does not write categorical `rpe`. Save still
 * confirm-gated `decideEditSave`. Does not write
 * Wednesday / saved / live Start. Pure: no store.
 */

import {
  patchDraftSet,
  type FinishedSessionDraft,
} from '@/lib/workout/editFinishedSession';
import { parseOptionalRpe10 } from '@/lib/workout/rpe10';

export type PatchFinishedSetRpe10Decision =
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

function omitRpe10(
  draft: FinishedSessionDraft,
  exerciseIndex: number,
  setIndex: number
): FinishedSessionDraft {
  const next = patchDraftSet(draft, exerciseIndex, setIndex, { rpe10: undefined });
  const set = next.exercises[exerciseIndex]?.sets[setIndex];
  if (set) delete set.rpe10;
  return next;
}

export function decidePatchFinishedSetRpe10(input: {
  draft: FinishedSessionDraft | null | undefined;
  exerciseIndex: unknown;
  setIndex: unknown;
  rpe10: unknown;
}): PatchFinishedSetRpe10Decision {
  const { draft, exerciseIndex, setIndex, rpe10 } = input;
  if (!draft || !Array.isArray(draft.exercises)) return { kind: 'empty' };
  if (!Number.isInteger(exerciseIndex) || !Number.isInteger(setIndex)) {
    return { kind: 'empty' };
  }
  const parsed = parseOptionalRpe10(rpe10);
  const clear = isClearRaw(rpe10);
  if (parsed === undefined && !clear) return { kind: 'empty' };
  const exIdx = exerciseIndex as number;
  const setIdx = setIndex as number;
  const exercise = draft.exercises[exIdx];
  if (!exercise || !Array.isArray(exercise.sets)) return { kind: 'noop' };
  if (exIdx < 0 || setIdx < 0 || setIdx >= exercise.sets.length) {
    return { kind: 'noop' };
  }
  const current = parseOptionalRpe10(exercise.sets[setIdx]?.rpe10);
  if (clear) {
    if (current === undefined) return { kind: 'noop' };
    return {
      kind: 'apply',
      draft: omitRpe10(cloneDraft(draft), exIdx, setIdx),
    };
  }
  if (current === parsed) return { kind: 'noop' };
  return {
    kind: 'apply',
    draft: patchDraftSet(cloneDraft(draft), exIdx, setIdx, { rpe10: parsed }),
  };
}
