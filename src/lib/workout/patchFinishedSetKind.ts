/**
 * Set kind on a finished History set (`.1039`).
 *
 * History edit `.997` shows kind as a badge.
 * Live already has W/D/F via `toggleSetTag`
 * (`.966`). They cannot mark a warmup they
 * logged as work (or the reverse). Same
 * finished log. Same id. Save still
 * confirm-gated `decideEditSave`. Reuses
 * `SetKind` / `SET_KINDS` / `toggleSetTag`.
 * Warmup still excluded from volume. Does
 * not write Wednesday / saved / live Start.
 * Pure: no store.
 */

import {
  patchDraftSet,
  type FinishedSessionDraft,
} from '@/lib/workout/editFinishedSession';
import { SET_KINDS, toggleSetTag, type SetKind } from '@/lib/workout/setKind';

export type PatchFinishedSetKindDecision =
  | { kind: 'empty' }
  | { kind: 'noop' }
  | { kind: 'apply'; draft: FinishedSessionDraft };

function isSetKind(value: unknown): value is SetKind {
  return typeof value === 'string' && (SET_KINDS as readonly string[]).includes(value);
}

function cloneDraft(draft: FinishedSessionDraft): FinishedSessionDraft {
  return {
    exercises: draft.exercises.map((ex) => ({
      ...ex,
      sets: (ex.sets ?? []).map((set) => ({ ...set })),
    })),
  };
}

/** Tap-to-cycle W → D → F → work. Uses `toggleSetTag`. */
export function cycleFinishedSetKind(current: SetKind | undefined): SetKind {
  const now = current ?? 'normal';
  if (now === 'normal') return toggleSetTag(now, 'warmup');
  if (now === 'warmup') return toggleSetTag(now, 'drop');
  if (now === 'drop') return toggleSetTag(now, 'failure');
  return toggleSetTag(now, 'normal');
}

export function decidePatchFinishedSetKind(input: {
  draft: FinishedSessionDraft | null | undefined;
  exerciseIndex: unknown;
  setIndex: unknown;
  kind: unknown;
}): PatchFinishedSetKindDecision {
  const { draft, exerciseIndex, setIndex, kind } = input;
  if (!draft || !Array.isArray(draft.exercises)) return { kind: 'empty' };
  if (!Number.isInteger(exerciseIndex) || !Number.isInteger(setIndex)) {
    return { kind: 'empty' };
  }
  if (!isSetKind(kind)) return { kind: 'empty' };
  const exIdx = exerciseIndex as number;
  const setIdx = setIndex as number;
  const exercise = draft.exercises[exIdx];
  if (!exercise || !Array.isArray(exercise.sets)) return { kind: 'noop' };
  if (exIdx < 0 || setIdx < 0 || setIdx >= exercise.sets.length) {
    return { kind: 'noop' };
  }
  const current = exercise.sets[setIdx]?.kind ?? 'normal';
  if (current === kind) return { kind: 'noop' };
  return {
    kind: 'apply',
    draft: patchDraftSet(cloneDraft(draft), exIdx, setIdx, { kind }),
  };
}
