/**
 * Optional L / R / Alt on a finished History set (`.1042`).
 *
 * Live already has `parseSetSide` / `SET_SIDES` /
 * `shouldOfferSetSide` / LogConsole chips
 * (`.724`). History edit `.997` could not
 * correct a logged side. Same finished log.
 * Same id. Empty is valid (clear) — field
 * absent, never required. Values are
 * `L` | `R` | `alt` (do not invent `left`
 * / `Left` / 0–1). Never a SetKind.
 * Bilateral / unknown invents nothing
 * (`persistableSetSide`). Does not write
 * `rpe`, `rpe10`, `rir`, or `kind`. Save
 * still confirm-gated `decideEditSave`.
 * Does not write Wednesday / saved /
 * live Start. Pure: no store.
 */

import {
  patchDraftSet,
  type FinishedSessionDraft,
} from '@/lib/workout/editFinishedSession';
import {
  parseSetSide,
  persistableSetSide,
  shouldOfferSetSide,
} from '@/lib/workout/unilateral';

export type PatchFinishedSetSideDecision =
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

function omitSide(
  draft: FinishedSessionDraft,
  exerciseIndex: number,
  setIndex: number
): FinishedSessionDraft {
  const next = patchDraftSet(draft, exerciseIndex, setIndex, { side: undefined });
  const set = next.exercises[exerciseIndex]?.sets[setIndex];
  if (set) delete set.side;
  return next;
}

function exerciseIdent(exerciseId: string): { id: string; name: string } {
  return { id: exerciseId, name: exerciseId };
}

export function decidePatchFinishedSetSide(input: {
  draft: FinishedSessionDraft | null | undefined;
  exerciseIndex: unknown;
  setIndex: unknown;
  side: unknown;
}): PatchFinishedSetSideDecision {
  const { draft, exerciseIndex, setIndex, side } = input;
  if (!draft || !Array.isArray(draft.exercises)) return { kind: 'empty' };
  if (!Number.isInteger(exerciseIndex) || !Number.isInteger(setIndex)) {
    return { kind: 'empty' };
  }
  const parsed = parseSetSide(side);
  const clear = isClearRaw(side);
  if (parsed === undefined && !clear) return { kind: 'empty' };
  const exIdx = exerciseIndex as number;
  const setIdx = setIndex as number;
  const exercise = draft.exercises[exIdx];
  if (!exercise || !Array.isArray(exercise.sets)) return { kind: 'noop' };
  if (exIdx < 0 || setIdx < 0 || setIdx >= exercise.sets.length) {
    return { kind: 'noop' };
  }
  const ident = exerciseIdent(exercise.exerciseId);
  if (
    !clear &&
    (!shouldOfferSetSide(ident) || persistableSetSide(side, ident) === undefined)
  ) {
    return { kind: 'empty' };
  }
  const current = parseSetSide(exercise.sets[setIdx]?.side);
  if (clear) {
    if (current === undefined) return { kind: 'noop' };
    return {
      kind: 'apply',
      draft: omitSide(cloneDraft(draft), exIdx, setIdx),
    };
  }
  if (current === parsed) return { kind: 'noop' };
  return {
    kind: 'apply',
    draft: patchDraftSet(cloneDraft(draft), exIdx, setIdx, { side: parsed }),
  };
}
