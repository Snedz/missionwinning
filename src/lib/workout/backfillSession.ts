/**
 * Backfill a past session they already did (`.1000`).
 *
 * Edit `.997` corrects an existing History row. Resume `.963` is the
 * live set. This file mints one new completed log they own, dated
 * honestly. Empty-day month door (`.1028`) may prefill dateKey.
 * Empty invents nothing. Never open a live session. Never
 * tombstone. Pure: no store.
 */

import type { CompletedWorkoutLog, SetKind } from '@/types';
import { resolveExercise } from '@/lib/workout/customExercise';
import {
  draftHasEvidence,
  parseFinishedSetNumber,
  type FinishedExerciseDraft,
  type FinishedSessionDraft,
  type FinishedSetDraft,
} from '@/lib/workout/editFinishedSession';
import {
  decideInSetPr,
  formatInSetPrLabel,
  type InSetPrWords,
} from '@/lib/workout/inSetPr';
import { countsTowardVolume, toggleSetTag } from '@/lib/workout/setKind';
import { resolveSetRowType, setRowVolume } from '@/lib/workout/setRowType';
import { isLocalDateKey } from '@/lib/time/localDate';

export type { FinishedExerciseDraft, FinishedSessionDraft, FinishedSetDraft };

export type BackfillTiming = {
  enabled: boolean;
  startTime: string;
  endTime: string;
};

export type BackfillDraft = {
  dateKey: string;
  timing: BackfillTiming;
  workoutName: string;
  exercises: FinishedExerciseDraft[];
};

export type BackfillSaveDecision =
  | { kind: 'empty' }
  | { kind: 'apply'; next: CompletedWorkoutLog };

const TIME_RE = /^([01]?\d|2[0-3]):([0-5]\d)$/;
const NOON = { hours: 12, minutes: 0 };

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object';
}

/** Finite ≥ 0. Blank / junk → 0. Never invents a load. */
export function parseBackfillSetNumber(raw: unknown): number {
  return parseFinishedSetNumber(raw);
}

/** `HH:MM` or empty. Never invents a clock. */
export function parseBackfillTime(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  const text = raw.trim();
  const m = TIME_RE.exec(text);
  if (!m) return '';
  const hours = Number(m[1]);
  const minutes = Number(m[2]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return '';
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function emptyBackfillDraft(dateKey?: unknown): BackfillDraft {
  return {
    dateKey: isLocalDateKey(dateKey) ? dateKey : '',
    timing: { enabled: false, startTime: '', endTime: '' },
    workoutName: '',
    exercises: [],
  };
}

function parseHmm(hhmm: string): { hours: number; minutes: number } | null {
  const parsed = parseBackfillTime(hhmm);
  if (!parsed) return null;
  const [hours, minutes] = parsed.split(':').map(Number) as [number, number];
  return { hours, minutes };
}

/** Instant from local calendar fields. Never Date.parse of a bare date. */
export function localInstantFromDateAndTime(
  dateKey: string,
  hhmm: string
): string | null {
  if (!isLocalDateKey(dateKey)) return null;
  const clock = parseHmm(hhmm) ?? NOON;
  const [y, m, d] = dateKey.split('-').map(Number) as [number, number, number];
  return new Date(y, m - 1, d, clock.hours, clock.minutes, 0, 0).toISOString();
}

function setHasEvidence(set: FinishedSetDraft | null | undefined): boolean {
  if (!set) return false;
  const reps = Number(set.reps);
  if (Number.isFinite(reps) && reps > 0) return true;
  const hold = Number(set.durationSeconds);
  return Number.isFinite(hold) && hold > 0;
}

function stripDraft(exercises: FinishedExerciseDraft[]): FinishedExerciseDraft[] {
  return exercises
    .map((ex) => ({
      ...ex,
      exerciseId: ex.exerciseId.trim(),
      sets: (ex.sets ?? []).filter(setHasEvidence).map((set) => {
        const hold = Number(set.durationSeconds);
        const next = { ...set };
        if (!Number.isFinite(hold) || hold <= 0) delete next.durationSeconds;
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

function honestClock(draft: BackfillDraft): {
  startedAt: string;
  completedAt: string;
  durationSeconds: number;
} | null {
  const { dateKey, timing } = draft;
  if (!isLocalDateKey(dateKey)) return null;
  const [y, m, d] = dateKey.split('-').map(Number) as [number, number, number];

  if (!timing.enabled) {
    const noon = new Date(y, m - 1, d, NOON.hours, NOON.minutes, 0, 0).toISOString();
    return { startedAt: noon, completedAt: noon, durationSeconds: 0 };
  }

  const startClock = parseHmm(timing.startTime);
  const endClock = parseHmm(timing.endTime);
  if (!startClock || !endClock) {
    const noon = new Date(y, m - 1, d, NOON.hours, NOON.minutes, 0, 0).toISOString();
    return { startedAt: noon, completedAt: noon, durationSeconds: 0 };
  }

  const started = new Date(y, m - 1, d, startClock.hours, startClock.minutes, 0, 0);
  const ended = new Date(y, m - 1, d, endClock.hours, endClock.minutes, 0, 0);
  if (ended.getTime() <= started.getTime()) {
    ended.setDate(ended.getDate() + 1);
  }
  const durationSeconds = Math.round((ended.getTime() - started.getTime()) / 1000);
  if (durationSeconds <= 0) return null;
  return {
    startedAt: started.toISOString(),
    completedAt: ended.toISOString(),
    durationSeconds,
  };
}

export function applyBackfillLog(input: {
  draft: BackfillDraft | null | undefined;
  todayKey: string;
  id: string;
  clientId: string;
}): CompletedWorkoutLog | null {
  if (!input.draft || !isRecord(input.draft)) return null;
  const id = input.id.trim();
  const clientId = input.clientId.trim();
  if (!id || !clientId) return null;
  if (!isLocalDateKey(input.todayKey)) return null;
  if (!isLocalDateKey(input.draft.dateKey)) return null;
  if (input.draft.dateKey > input.todayKey) return null;

  const session: FinishedSessionDraft = { exercises: input.draft.exercises };
  if (!draftHasEvidence(session)) return null;

  const exercises = stripDraft(input.draft.exercises);
  if (exercises.length === 0) return null;

  const clock = honestClock(input.draft);
  if (!clock) return null;

  const name = input.draft.workoutName.trim() || 'Workout';

  return {
    id,
    clientId,
    revision: 1,
    updatedAt: clock.completedAt,
    deletedAt: null,
    workoutName: name,
    startedAt: clock.startedAt,
    completedAt: clock.completedAt,
    durationSeconds: clock.durationSeconds,
    exercises,
    totalVolume: volumeOf(exercises),
  };
}

export function decideBackfillSession(input: {
  draft: BackfillDraft | null | undefined;
  todayKey: string;
  id: string;
  clientId: string;
}): BackfillSaveDecision {
  const next = applyBackfillLog(input);
  if (!next) return { kind: 'empty' };
  return { kind: 'apply', next };
}

export function appendBackfillExercise(
  draft: BackfillDraft,
  exerciseId: string
): BackfillDraft {
  const id = exerciseId.trim();
  if (!id) return draft;
  return {
    ...draft,
    exercises: [...draft.exercises, { exerciseId: id, sets: [{ reps: 0, weight: 0 }] }],
  };
}

export function removeBackfillExercise(
  draft: BackfillDraft,
  exerciseIndex: number
): BackfillDraft {
  return {
    ...draft,
    exercises: draft.exercises.filter((_, i) => i !== exerciseIndex),
  };
}

export function patchBackfillSet(
  draft: BackfillDraft,
  exerciseIndex: number,
  setIndex: number,
  patch: Partial<FinishedSetDraft>
): BackfillDraft {
  return {
    ...draft,
    exercises: draft.exercises.map((ex, i) => {
      if (i !== exerciseIndex) return ex;
      return {
        ...ex,
        sets: ex.sets.map((set, j) => (j === setIndex ? { ...set, ...patch } : set)),
      };
    }),
  };
}

export function appendBackfillSet(
  draft: BackfillDraft,
  exerciseIndex: number
): BackfillDraft {
  return {
    ...draft,
    exercises: draft.exercises.map((ex, i) => {
      if (i !== exerciseIndex) return ex;
      return { ...ex, sets: [...ex.sets, { reps: 0, weight: 0 }] };
    }),
  };
}

export function removeBackfillSet(
  draft: BackfillDraft,
  exerciseIndex: number,
  setIndex: number
): BackfillDraft {
  return {
    ...draft,
    exercises: draft.exercises.map((ex, i) => {
      if (i !== exerciseIndex) return ex;
      return { ...ex, sets: ex.sets.filter((_, j) => j !== setIndex) };
    }),
  };
}

export function toggleBackfillSetTag(
  draft: BackfillDraft,
  exerciseIndex: number,
  setIndex: number,
  tag: SetKind
): BackfillDraft {
  return {
    ...draft,
    exercises: draft.exercises.map((ex, i) => {
      if (i !== exerciseIndex) return ex;
      return {
        ...ex,
        sets: ex.sets.map((set, j) =>
          j === setIndex ? { ...set, kind: toggleSetTag(set.kind, tag) } : set
        ),
      };
    }),
  };
}

/** Quiet diary PR vs prior History. First-ever invents nothing. */
export function backfillPrLabels(
  draft: BackfillDraft | null | undefined,
  history: readonly CompletedWorkoutLog[],
  words: InSetPrWords
): (string | null)[][] {
  if (!draft) return [];
  return draft.exercises.map((ex) => {
    const type = resolveSetRowType(resolveExercise(ex.exerciseId));
    return (ex.sets ?? []).map((set, idx) => {
      const { kinds } = decideInSetPr({
        exerciseId: ex.exerciseId,
        justLogged: set,
        rowType: type,
        history,
        sessionPriors: (ex.sets ?? []).slice(0, idx),
      });
      return formatInSetPrLabel(kinds, words);
    });
  });
}
