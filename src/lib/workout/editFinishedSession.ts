/**
 * Edit a finished session they own (`.997`).
 *
 * History cites the diary. A typo used to stay forever and poison
 * week-4. Resume `.963` is the live set — this file is History Save.
 * Confirm before a destructive change. Empty invents nothing.
 * Never tombstones. Never mints a second session. Pure: no store.
 */

import type { CompletedWorkoutLog } from '@/types';
import { resolveExercise } from '@/lib/workout/customExercise';
import { parseOptionalRir } from '@/lib/workout/rir';
import { parseOptionalRpe10 } from '@/lib/workout/rpe10';
import { parseSetSide } from '@/lib/workout/unilateral';
import { countsTowardVolume } from '@/lib/workout/setKind';
import { attachSessionNote } from '@/lib/workout/sessionNote';
import { resolveSetRowType, setRowHasWork, setRowVolume } from '@/lib/workout/setRowType';

export type FinishedSetDraft = CompletedWorkoutLog['exercises'][number]['sets'][number];
export type FinishedExerciseDraft = CompletedWorkoutLog['exercises'][number];
export type FinishedSessionDraft = { exercises: FinishedExerciseDraft[] };

export type EditSaveDecision =
  | { kind: 'empty' }
  | { kind: 'noop' }
  | { kind: 'apply'; next: CompletedWorkoutLog }
  | { kind: 'needs-confirm'; next: CompletedWorkoutLog };

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object';
}

function setHasEvidence(set: FinishedSetDraft | null | undefined): boolean {
  if (!set) return false;
  const reps = Number(set.reps);
  if (Number.isFinite(reps) && reps > 0) return true;
  const hold = Number(set.durationSeconds);
  return Number.isFinite(hold) && hold > 0;
}

export function setDraftHasWork(set: FinishedSetDraft | null | undefined): boolean {
  return setRowHasWork(set);
}

export function draftHasEvidence(
  draft: FinishedSessionDraft | null | undefined
): boolean {
  return (draft?.exercises ?? []).some((ex) =>
    (ex.sets ?? []).some(setHasEvidence)
  );
}

/** Finite ≥ 0. Blank / junk → 0. Never invents a load. */
export function parseFinishedSetNumber(raw: unknown): number {
  if (typeof raw === 'number' && Number.isFinite(raw) && raw >= 0) {
    return raw;
  }
  if (typeof raw !== 'string') return 0;
  const text = raw.trim().replace(',', '.');
  if (!text) return 0;
  const n = Number(text);
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

export function draftFromLog(
  log: CompletedWorkoutLog | null | undefined
): FinishedSessionDraft | null {
  if (!log || !isRecord(log) || log.deletedAt) return null;
  if (!Array.isArray(log.exercises)) return null;
  const exercises = log.exercises
    .filter((ex) => ex && typeof ex.exerciseId === 'string' && ex.exerciseId.trim())
    .map((ex) => ({
      ...ex,
      exerciseId: ex.exerciseId.trim(),
      sets: (ex.sets ?? []).map((set) => ({ ...set })),
    }));
  return { exercises };
}

function sameEvidence(
  a: FinishedSetDraft | undefined,
  b: FinishedSetDraft | undefined
): boolean {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return (
    Number(a.reps) === Number(b.reps) &&
    Number(a.weight) === Number(b.weight) &&
    Number(a.durationSeconds ?? 0) === Number(b.durationSeconds ?? 0) &&
    (a.kind ?? 'normal') === (b.kind ?? 'normal') &&
    parseOptionalRpe10(a.rpe10) === parseOptionalRpe10(b.rpe10) &&
    parseOptionalRir(a.rir) === parseOptionalRir(b.rir) &&
    parseSetSide(a.side) === parseSetSide(b.side)
  );
}

export function isDestructiveEdit(
  original: CompletedWorkoutLog | null | undefined,
  draft: FinishedSessionDraft | null | undefined
): boolean {
  if (!original || !draft) return false;
  for (let exIdx = 0; exIdx < original.exercises.length; exIdx += 1) {
    const before = original.exercises[exIdx];
    if (!before) continue;
    const after = draft.exercises[exIdx];
    for (let setIdx = 0; setIdx < (before.sets ?? []).length; setIdx += 1) {
      const prev = before.sets[setIdx];
      if (!setHasEvidence(prev)) continue;
      const next = after?.sets[setIdx];
      if (!setHasEvidence(next)) return true;
    }
    if ((before.sets ?? []).some(setHasEvidence) && !after) return true;
  }
  return false;
}

function stripDraft(draft: FinishedSessionDraft): FinishedExerciseDraft[] {
  return draft.exercises
    .map((ex) => ({
      ...ex,
      exerciseId: ex.exerciseId.trim(),
      sets: (ex.sets ?? []).filter(setHasEvidence).map((set) => {
        const hold = Number(set.durationSeconds);
        const next = { ...set };
        if (!Number.isFinite(hold) || hold <= 0) delete next.durationSeconds;
        if (next.rpe10 === undefined) delete next.rpe10;
        if (next.rir === undefined) delete next.rir;
        if (next.side === undefined) delete next.side;
        return next;
      }),
    }))
    .filter((ex) => ex.exerciseId && ex.sets.length > 0);
}

function volumeOf(exercises: FinishedExerciseDraft[]): number {
  return exercises.reduce((sum, ex) => {
    const type = resolveSetRowType(resolveExercise(ex.exerciseId));
    const work = ex.sets.filter((s) => countsTowardVolume(s.kind));
    return sum + work.reduce((n, s) => n + setRowVolume(s, type), 0);
  }, 0);
}

function draftsEqual(
  original: CompletedWorkoutLog,
  draft: FinishedSessionDraft
): boolean {
  if (original.exercises.length !== draft.exercises.length) return false;
  for (let i = 0; i < original.exercises.length; i += 1) {
    const a = original.exercises[i];
    const b = draft.exercises[i];
    if (!a || !b || a.exerciseId !== b.exerciseId) return false;
    if ((a.sets ?? []).length !== (b.sets ?? []).length) return false;
    for (let j = 0; j < a.sets.length; j += 1) {
      if (!sameEvidence(a.sets[j], b.sets[j])) return false;
    }
  }
  return true;
}

export function applyEditedLog(
  original: CompletedWorkoutLog | null | undefined,
  draft: FinishedSessionDraft | null | undefined,
  now: string = new Date().toISOString()
): CompletedWorkoutLog | null {
  if (!original || original.deletedAt || !draft) return null;
  const exercises = stripDraft(draft);
  if (exercises.length === 0) return null;
  const next: CompletedWorkoutLog = {
    ...original,
    exercises,
    totalVolume: volumeOf(exercises),
    revision: (typeof original.revision === 'number' ? original.revision : 1) + 1,
    updatedAt: now,
    deletedAt: null,
  };
  return attachSessionNote(next, original.sessionNote);
}

export function decideEditSave(input: {
  original: CompletedWorkoutLog | null | undefined;
  draft: FinishedSessionDraft | null | undefined;
}): EditSaveDecision {
  const { original, draft } = input;
  if (!original || original.deletedAt || !draft) return { kind: 'empty' };
  if (!draftHasEvidence(draft)) return { kind: 'empty' };
  if (draftsEqual(original, draft)) return { kind: 'noop' };
  const next = applyEditedLog(original, draft);
  if (!next) return { kind: 'empty' };
  if (isDestructiveEdit(original, draft)) return { kind: 'needs-confirm', next };
  return { kind: 'apply', next };
}

export function patchDraftSet(
  draft: FinishedSessionDraft,
  exerciseIndex: number,
  setIndex: number,
  patch: Partial<FinishedSetDraft>
): FinishedSessionDraft {
  return {
    exercises: draft.exercises.map((ex, i) => {
      if (i !== exerciseIndex) return ex;
      return {
        ...ex,
        sets: ex.sets.map((set, j) => (j === setIndex ? { ...set, ...patch } : set)),
      };
    }),
  };
}

export function appendDraftSet(
  draft: FinishedSessionDraft,
  exerciseIndex: number
): FinishedSessionDraft {
  return {
    exercises: draft.exercises.map((ex, i) => {
      if (i !== exerciseIndex) return ex;
      return { ...ex, sets: [...ex.sets, { reps: 0, weight: 0 }] };
    }),
  };
}

export function removeDraftSet(
  draft: FinishedSessionDraft,
  exerciseIndex: number,
  setIndex: number
): FinishedSessionDraft {
  return {
    exercises: draft.exercises.map((ex, i) => {
      if (i !== exerciseIndex) return ex;
      return { ...ex, sets: ex.sets.filter((_, j) => j !== setIndex) };
    }),
  };
}
