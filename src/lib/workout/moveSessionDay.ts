/**
 * Move a finished History session to another calendar day (`.1027`).
 *
 * Edit `.997` is sets. Backfill `.1000` mints a new row. This re-dates
 * the existing finished log. Same id. Same sets. Clock stays.
 * Vacated day drops that row. Destination day shows it.
 * Empty / missing / tomb / future invents nothing. Not Resume.
 * Pure: no store.
 */

import type { ActiveWorkout, CompletedWorkoutLog } from '@/types';
import { isLocalDateKey, localDateKeyFromIso } from '@/lib/time/localDate';
import {
  findFinishedSession,
  normalizeSessionId,
} from '@/lib/workout/deleteFinishedSession';

export type MoveSessionDayDecision =
  | { kind: 'empty' }
  | { kind: 'noop' }
  | { kind: 'apply'; sessionId: string; dateKey: string };

export type MoveSessionDayApply = {
  history: CompletedWorkoutLog[];
  next: CompletedWorkoutLog;
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

/** Local calendar day this finished log sits on. Empty when unparseable. */
export function sessionDayKey(
  log: Pick<CompletedWorkoutLog, 'completedAt' | 'startedAt'> | null | undefined
): string {
  if (!log) return '';
  return localDateKeyFromIso(log.completedAt || log.startedAt);
}

/**
 * Calendar-day count from `fromKey` to `toKey`.
 * Built from local fields — never `Date.parse` of a bare date.
 */
export function localDayDelta(fromKey: string, toKey: string): number | null {
  if (!isLocalDateKey(fromKey) || !isLocalDateKey(toKey)) return null;
  const [fy, fm, fd] = fromKey.split('-').map(Number) as [number, number, number];
  const [ty, tm, td] = toKey.split('-').map(Number) as [number, number, number];
  const from = new Date(fy, fm - 1, fd);
  const to = new Date(ty, tm - 1, td);
  return Math.round((to.getTime() - from.getTime()) / 86_400_000);
}

/** Shift an instant by N local calendar days. Clock stays. Junk stays junk. */
export function shiftIsoByLocalDays(iso: string, days: number): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

/**
 * Empty id / date / today → empty. Live / missing / tomb / same day → noop.
 * Future invents nothing. A real finished log on another past-or-today day applies.
 */
export function decideMoveSessionDay(input: {
  sessionId: unknown;
  dateKey: unknown;
  todayKey: unknown;
  history?: readonly CompletedWorkoutLog[] | null;
  live?: ActiveWorkout | null;
}): MoveSessionDayDecision {
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

export function applyMoveSessionDay(input: {
  sessionId: unknown;
  dateKey: unknown;
  todayKey: unknown;
  history?: readonly CompletedWorkoutLog[] | null;
  live?: ActiveWorkout | null;
  now?: string;
}): MoveSessionDayApply | null {
  const decision = decideMoveSessionDay(input);
  if (decision.kind !== 'apply') return null;
  const history = Array.isArray(input.history) ? input.history : [];
  const now = input.now ?? new Date().toISOString();
  let next: CompletedWorkoutLog | null = null;
  const mapped = history.map((log) => {
    if (!log || normalizeSessionId(log.id) !== decision.sessionId) return log;
    const fromKey = sessionDayKey(log);
    const days = localDayDelta(fromKey, decision.dateKey);
    if (days === null) return log;
    const moved: CompletedWorkoutLog = {
      ...log,
      startedAt: shiftIsoByLocalDays(log.startedAt, days),
      completedAt: shiftIsoByLocalDays(log.completedAt, days),
      updatedAt: now,
      revision: (typeof log.revision === 'number' ? log.revision : 1) + 1,
      deletedAt: null,
    };
    next = moved;
    return moved;
  });
  if (!next) return null;
  return { history: mapped, next };
}
