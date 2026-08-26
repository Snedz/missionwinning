/**
 * Optional e-p-c tempo on a finished History set (`.1043`).
 *
 * Live already has `parseOptionalTempo` / `SetTempoField`
 * (`.734`). History edit `.997` could not
 * correct a logged tempo. Same finished log.
 * Same id. Empty is valid (clear) — field
 * absent, never required. Display is `e-p-c`
 * (e.g. `3-1-1`). Each phase is an integer
 * 0–9. Out of range, 4-count strings, bare
 * `311`, and NaN invent nothing (never
 * clamped). Does not write `rpe`, `rpe10`,
 * `rir`, `kind`, or `side`. Does not write
 * live last-used storage. Save still
 * confirm-gated `decideEditSave`.
 * Does not write Wednesday / saved /
 * live Start. Pure: no store.
 */

import {
  patchDraftSet,
  type FinishedSessionDraft,
} from '@/lib/workout/editFinishedSession';
import { parseOptionalTempo, temposEqual } from '@/lib/workout/tempo';

export type PatchFinishedSetTempoDecision =
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

function omitTempo(
  draft: FinishedSessionDraft,
  exerciseIndex: number,
  setIndex: number
): FinishedSessionDraft {
  const next = patchDraftSet(draft, exerciseIndex, setIndex, { tempo: undefined });
  const set = next.exercises[exerciseIndex]?.sets[setIndex];
  if (set) delete set.tempo;
  return next;
}

export function decidePatchFinishedSetTempo(input: {
  draft: FinishedSessionDraft | null | undefined;
  exerciseIndex: unknown;
  setIndex: unknown;
  tempo: unknown;
}): PatchFinishedSetTempoDecision {
  const { draft, exerciseIndex, setIndex, tempo } = input;
  if (!draft || !Array.isArray(draft.exercises)) return { kind: 'empty' };
  if (!Number.isInteger(exerciseIndex) || !Number.isInteger(setIndex)) {
    return { kind: 'empty' };
  }
  const parsed = parseOptionalTempo(tempo);
  const clear = isClearRaw(tempo);
  if (parsed === undefined && !clear) return { kind: 'empty' };
  const exIdx = exerciseIndex as number;
  const setIdx = setIndex as number;
  const exercise = draft.exercises[exIdx];
  if (!exercise || !Array.isArray(exercise.sets)) return { kind: 'noop' };
  if (exIdx < 0 || setIdx < 0 || setIdx >= exercise.sets.length) {
    return { kind: 'noop' };
  }
  const current = parseOptionalTempo(exercise.sets[setIdx]?.tempo);
  if (clear) {
    if (current === undefined) return { kind: 'noop' };
    return {
      kind: 'apply',
      draft: omitTempo(cloneDraft(draft), exIdx, setIdx),
    };
  }
  if (temposEqual(current, parsed)) return { kind: 'noop' };
  return {
    kind: 'apply',
    draft: patchDraftSet(cloneDraft(draft), exIdx, setIdx, { tempo: parsed }),
  };
}
