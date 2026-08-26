/**
 * Optional % of a known 1-rep max on a finished
 * History set (`.1044`).
 *
 * Live already has `parseOptionalLoadPct` /
 * `SetRowPercentField` (`.981`). History edit
 * `.997` could not correct a logged `loadPct`.
 * Same finished log. Same id. Empty is valid
 * (clear) — field absent, never required.
 * Range 1–100, one decimal (`76.5`). Trailing
 * `%` allowed (`80%`). Out of range, extra
 * decimals, and junk invent nothing (never
 * clamped). Does not invent a percent from
 * the logged weight. Does not rewrite
 * `weight` from the percent. Does not write
 * `rpe`, `rpe10`, `rir`, `kind`, `side`, or
 * `tempo`. Save still confirm-gated
 * `decideEditSave`. Does not write Wednesday
 * / saved / live Start. Pure: no store.
 */

import {
  patchDraftSet,
  type FinishedSessionDraft,
} from '@/lib/workout/editFinishedSession';
import { parseOptionalLoadPct } from '@/lib/workout/setRowPercent';

export type PatchFinishedSetLoadPctDecision =
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

function omitLoadPct(
  draft: FinishedSessionDraft,
  exerciseIndex: number,
  setIndex: number
): FinishedSessionDraft {
  const next = patchDraftSet(draft, exerciseIndex, setIndex, { loadPct: undefined });
  const set = next.exercises[exerciseIndex]?.sets[setIndex];
  if (set) delete set.loadPct;
  return next;
}

export function decidePatchFinishedSetLoadPct(input: {
  draft: FinishedSessionDraft | null | undefined;
  exerciseIndex: unknown;
  setIndex: unknown;
  loadPct: unknown;
}): PatchFinishedSetLoadPctDecision {
  const { draft, exerciseIndex, setIndex, loadPct } = input;
  if (!draft || !Array.isArray(draft.exercises)) return { kind: 'empty' };
  if (!Number.isInteger(exerciseIndex) || !Number.isInteger(setIndex)) {
    return { kind: 'empty' };
  }
  const parsed = parseOptionalLoadPct(loadPct);
  const clear = isClearRaw(loadPct);
  if (parsed === undefined && !clear) return { kind: 'empty' };
  const exIdx = exerciseIndex as number;
  const setIdx = setIndex as number;
  const exercise = draft.exercises[exIdx];
  if (!exercise || !Array.isArray(exercise.sets)) return { kind: 'noop' };
  if (exIdx < 0 || setIdx < 0 || setIdx >= exercise.sets.length) {
    return { kind: 'noop' };
  }
  const current = parseOptionalLoadPct(exercise.sets[setIdx]?.loadPct);
  if (clear) {
    if (current === undefined) return { kind: 'noop' };
    return {
      kind: 'apply',
      draft: omitLoadPct(cloneDraft(draft), exIdx, setIdx),
    };
  }
  if (current === parsed) return { kind: 'noop' };
  return {
    kind: 'apply',
    draft: patchDraftSet(cloneDraft(draft), exIdx, setIdx, { loadPct: parsed }),
  };
}
