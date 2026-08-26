/**
 * Optional 0–5 RIR on a finished History set (`.1041`).
 *
 * Live already has `parseOptionalRir` / `SetRirSelect`
 * (`.725`). History edit `.997` could not correct a
 * logged RIR. Same finished log. Same id. Empty is
 * valid (clear) — field absent, never required.
 * Scale is 0–5 (do not invent 0–10 — collides
 * with RPE). Out of range invents nothing
 * (never clamped). Does not write `rpe` or
 * `rpe10`. Save still confirm-gated
 * `decideEditSave`. Does not write Wednesday
 * / saved / live Start. Pure: no store.
 */

import {
  patchDraftSet,
  type FinishedSessionDraft,
} from '@/lib/workout/editFinishedSession';
import { parseOptionalRir } from '@/lib/workout/rir';

export type PatchFinishedSetRirDecision =
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

function omitRir(
  draft: FinishedSessionDraft,
  exerciseIndex: number,
  setIndex: number
): FinishedSessionDraft {
  const next = patchDraftSet(draft, exerciseIndex, setIndex, { rir: undefined });
  const set = next.exercises[exerciseIndex]?.sets[setIndex];
  if (set) delete set.rir;
  return next;
}

export function decidePatchFinishedSetRir(input: {
  draft: FinishedSessionDraft | null | undefined;
  exerciseIndex: unknown;
  setIndex: unknown;
  rir: unknown;
}): PatchFinishedSetRirDecision {
  const { draft, exerciseIndex, setIndex, rir } = input;
  if (!draft || !Array.isArray(draft.exercises)) return { kind: 'empty' };
  if (!Number.isInteger(exerciseIndex) || !Number.isInteger(setIndex)) {
    return { kind: 'empty' };
  }
  const parsed = parseOptionalRir(rir);
  const clear = isClearRaw(rir);
  if (parsed === undefined && !clear) return { kind: 'empty' };
  const exIdx = exerciseIndex as number;
  const setIdx = setIndex as number;
  const exercise = draft.exercises[exIdx];
  if (!exercise || !Array.isArray(exercise.sets)) return { kind: 'noop' };
  if (exIdx < 0 || setIdx < 0 || setIdx >= exercise.sets.length) {
    return { kind: 'noop' };
  }
  const current = parseOptionalRir(exercise.sets[setIdx]?.rir);
  if (clear) {
    if (current === undefined) return { kind: 'noop' };
    return {
      kind: 'apply',
      draft: omitRir(cloneDraft(draft), exIdx, setIdx),
    };
  }
  if (current === parsed) return { kind: 'noop' };
  return {
    kind: 'apply',
    draft: patchDraftSet(cloneDraft(draft), exIdx, setIdx, { rir: parsed }),
  };
}
