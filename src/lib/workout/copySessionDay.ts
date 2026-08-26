/**
 * Copy a finished History session onto another calendar day (`.1030`).
 *
 * Move `.1027` re-dates the same id. Repeat `.1026` lands the live Start.
 * This mints a new finished log. New id. New clientId. Same sets.
 * Same name/title/notes. Duration copied as logged, not invented.
 * Clock stays. Source day still lists the original.
 * Empty / missing / tomb / live-open / junk / future invents nothing.
 * Same-day is noop. Not Resume. Pure: no store.
 */

import type { ActiveWorkout, CompletedWorkoutLog } from '@/types';
import { isLocalDateKey } from '@/lib/time/localDate';
import { newClientId } from '@/lib/workout/clientId';
import {
  findFinishedSession,
  normalizeSessionId,
} from '@/lib/workout/deleteFinishedSession';
import {
  localDayDelta,
  sessionDayKey,
  shiftIsoByLocalDays,
} from '@/lib/workout/moveSessionDay';

export type CopySessionDayDecision =
  | { kind: 'empty' }
  | { kind: 'noop' }
  | { kind: 'apply'; sessionId: string; dateKey: string };

export type CopySessionDayApply = {
  history: CompletedWorkoutLog[];
  next: CompletedWorkoutLog;
  source: CompletedWorkoutLog;
};

function liveSessionIds(live: ActiveWorkout | null | undefined): Set<string> {
  const ids = new Set<string>();
  if (!live) return ids;
  const clientId = normalizeSessionId(live.clientId);
  const workoutId = normalizeSessionId(live.workoutId);
  if (clientId) ids.add(clientId);
  if (workoutId) ids.add(workoutId);
  return ids;
}

function cloneExercises(
  exercises: CompletedWorkoutLog['exercises'] | null | undefined
): CompletedWorkoutLog['exercises'] {
  return (exercises ?? []).map((ex) => ({
    ...ex,
    sets: (ex.sets ?? []).map((set) => ({ ...set })),
  }));
}

function loggedDuration(log: CompletedWorkoutLog): number {
  return typeof log.durationSeconds === 'number' && Number.isFinite(log.durationSeconds)
    ? log.durationSeconds
    : 0;
}

function mintFreshIds(history: readonly CompletedWorkoutLog[]): {
  id: string;
  clientId: string;
} {
  const taken = new Set<string>();
  for (const row of history) {
    if (!row) continue;
    if (row.id) taken.add(row.id);
    if (row.clientId) taken.add(row.clientId);
  }
  const mint = (): string => {
    let next = newClientId();
    while (taken.has(next)) next = newClientId();
    taken.add(next);
    return next;
  };
  return { id: mint(), clientId: mint() };
}

/**
 * Empty id / date / today → empty. Live / missing / tomb / same day → noop.
 * Future invents nothing. A real finished log on another past-or-today day applies.
 */
export function decideCopySessionDay(input: {
  sessionId: unknown;
  dateKey: unknown;
  todayKey: unknown;
  history?: readonly CompletedWorkoutLog[] | null;
  live?: ActiveWorkout | null;
}): CopySessionDayDecision {
  const sessionId = normalizeSessionId(input.sessionId);
  if (!sessionId) return { kind: 'empty' };
  if (!isLocalDateKey(input.todayKey)) return { kind: 'empty' };
  if (!isLocalDateKey(input.dateKey)) return { kind: 'empty' };
  if (input.dateKey > input.todayKey) return { kind: 'empty' };
  if (liveSessionIds(input.live).has(sessionId)) return { kind: 'noop' };
  const found = findFinishedSession(input.history, sessionId);
  if (!found) return { kind: 'noop' };
  const fromKey = sessionDayKey(found);
  if (!isLocalDateKey(fromKey)) return { kind: 'empty' };
  if (fromKey === input.dateKey) return { kind: 'noop' };
  return { kind: 'apply', sessionId: found.id, dateKey: input.dateKey };
}

export function applyCopySessionDay(input: {
  sessionId: unknown;
  dateKey: unknown;
  todayKey: unknown;
  history?: readonly CompletedWorkoutLog[] | null;
  live?: ActiveWorkout | null;
  now?: string;
}): CopySessionDayApply | null {
  const decision = decideCopySessionDay(input);
  if (decision.kind !== 'apply') return null;
  const history = Array.isArray(input.history) ? input.history : [];
  const source = findFinishedSession(history, decision.sessionId);
  if (!source) return null;
  const fromKey = sessionDayKey(source);
  const days = localDayDelta(fromKey, decision.dateKey);
  if (days === null) return null;
  const now = input.now ?? new Date().toISOString();
  const ids = mintFreshIds(history);
  const next: CompletedWorkoutLog = {
    ...source,
    id: ids.id,
    clientId: ids.clientId,
    revision: 1,
    updatedAt: now,
    deletedAt: null,
    startedAt: shiftIsoByLocalDays(source.startedAt, days),
    completedAt: shiftIsoByLocalDays(source.completedAt, days),
    durationSeconds: loggedDuration(source),
    exercises: cloneExercises(source.exercises),
  };
  return { history: [next, ...history], next, source };
}
