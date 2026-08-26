/**
 * Optional exercise group (superset) on a finished
 * History session (`.1047`).
 *
 * Live already has `superset.ts` /
 * `supersetGroup` / `stripOrphanGroups` /
 * "Superset w/ next" (`.980`). History
 * edit `.997` could not pair or unpair
 * lifts on a finished log. Same finished
 * log. Same id. Pair this lift with the
 * next. Unpair clears this lift's group
 * then `stripOrphanGroups` — an orphan
 * is not a group. Not a new SetKind. Not
 * marketplace circuits. Does not rewrite
 * sets / notes / duration / name. Save
 * still confirm-gated `decideEditSave`.
 * Does not write Wednesday / saved /
 * live Start. Pure: no store.
 */

import type { FinishedSessionDraft } from '@/lib/workout/editFinishedSession';
import { stripOrphanGroups } from '@/lib/workout/superset';

export type PatchFinishedSupersetDecision =
  | { kind: 'empty' }
  | { kind: 'noop' }
  | { kind: 'apply'; draft: FinishedSessionDraft };

function groupOf(ex: { supersetGroup?: string } | undefined): string {
  return ex?.supersetGroup?.trim() ?? '';
}

function stripGroup<T extends { supersetGroup?: string }>(ex: T): T {
  const { supersetGroup: _, ...rest } = ex;
  return rest as T;
}

function cloneDraft(draft: FinishedSessionDraft): FinishedSessionDraft {
  return {
    exercises: draft.exercises.map((ex) => ({
      ...ex,
      sets: (ex.sets ?? []).map((set) => ({ ...set })),
    })),
  };
}

function mintShortId(): string {
  return `ss-${Date.now().toString(36)}`;
}

function isPairNext(pair: unknown): boolean {
  return pair === true || pair === 'next';
}

function isUnpair(pair: unknown): boolean {
  if (pair === false) return true;
  return typeof pair === 'string' && pair.trim() === '';
}

function shareWithNext(
  draft: FinishedSessionDraft,
  exerciseIndex: number
): FinishedSessionDraft {
  const next = cloneDraft(draft);
  const current = next.exercises[exerciseIndex];
  const peer = next.exercises[exerciseIndex + 1];
  if (!current || !peer) return next;
  const id = groupOf(current) || groupOf(peer) || mintShortId();
  next.exercises = stripOrphanGroups(
    next.exercises.map((ex, i) =>
      i === exerciseIndex || i === exerciseIndex + 1
        ? { ...ex, supersetGroup: id }
        : ex
    )
  );
  return next;
}

function clearThisThenStrip(
  draft: FinishedSessionDraft,
  exerciseIndex: number
): FinishedSessionDraft {
  const next = cloneDraft(draft);
  const ex = next.exercises[exerciseIndex];
  if (!ex) return next;
  next.exercises[exerciseIndex] = stripGroup(ex);
  next.exercises = stripOrphanGroups(next.exercises);
  return next;
}

export function decidePatchFinishedSuperset(input: {
  draft: FinishedSessionDraft | null | undefined;
  exerciseIndex: unknown;
  pair: unknown;
}): PatchFinishedSupersetDecision {
  const { draft, exerciseIndex, pair } = input;
  if (!draft || !Array.isArray(draft.exercises)) return { kind: 'empty' };
  if (!Number.isInteger(exerciseIndex)) return { kind: 'empty' };
  const wantPair = isPairNext(pair);
  const wantUnpair = isUnpair(pair);
  if (!wantPair && !wantUnpair) return { kind: 'empty' };
  if (draft.exercises.length <= 1) return { kind: 'empty' };
  const exIdx = exerciseIndex as number;
  if (exIdx < 0 || exIdx >= draft.exercises.length) return { kind: 'empty' };
  const current = draft.exercises[exIdx];
  if (!current) return { kind: 'empty' };
  if (wantPair) {
    const peer = draft.exercises[exIdx + 1];
    if (!peer) return { kind: 'empty' };
    if (groupOf(current) && groupOf(current) === groupOf(peer)) {
      return { kind: 'noop' };
    }
    return { kind: 'apply', draft: shareWithNext(draft, exIdx) };
  }
  if (!groupOf(current)) return { kind: 'noop' };
  return { kind: 'apply', draft: clearThisThenStrip(draft, exIdx) };
}
