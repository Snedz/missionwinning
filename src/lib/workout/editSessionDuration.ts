/**
 * Edit this finished session's logged duration (`.1035`).
 *
 * History already prints `durationSeconds`. Set-hold duration is
 * already editable. This is the session clock they logged — same
 * id, same sets, same date. Empty / junk / negative / over-cap
 * invents nothing. 0 clears the clock (the list already hides 0).
 * Never invents elapsed from `startedAt`. Not a live clock write.
 * Pure: no store.
 */

import type { ActiveWorkout, CompletedWorkoutLog } from '@/types';
import { parseDurationSeconds } from '@/lib/workout/setRowType';
import {
  findFinishedSession,
  normalizeSessionId,
} from '@/lib/workout/deleteFinishedSession';

export const SESSION_DURATION_MAX = 86400;

export type EditSessionDurationDecision =
  | { kind: 'empty' }
  | { kind: 'noop' }
  | { kind: 'apply'; sessionId: string; durationSeconds: number };

export type EditSessionDurationApply = {
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

/** Missing / non-finite current clock is 0 — the list already hides 0. */
export function currentSessionDuration(
  log: Pick<CompletedWorkoutLog, 'durationSeconds'> | null | undefined
): number {
  const n = Number(log?.durationSeconds);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n);
}

/**
 * Seconds or mm:ss via `parseDurationSeconds`. Junk / negative /
 * over-cap / unparseable → null. Explicit 0 is 0 (clear).
 */
export function parseEditSessionDuration(raw: unknown): number | null {
  if (typeof raw === 'number') {
    if (!Number.isFinite(raw) || raw < 0) return null;
    const rounded = Math.round(raw);
    if (rounded > SESSION_DURATION_MAX) return null;
    return parseDurationSeconds(rounded);
  }
  if (typeof raw !== 'string') return null;
  const text = raw.trim().replace(',', '.');
  if (!text) return null;
  const clock = /^(\d{1,3}):([0-5]?\d)$/.exec(text);
  if (clock) {
    const seconds = Number(clock[1]) * 60 + Number(clock[2]);
    if (!Number.isFinite(seconds) || seconds < 0 || seconds > SESSION_DURATION_MAX) {
      return null;
    }
    return parseDurationSeconds(text);
  }
  if (!/^-?\d+(?:\.\d+)?$/.test(text)) return null;
  const n = Number(text);
  if (!Number.isFinite(n) || n < 0 || n > SESSION_DURATION_MAX) return null;
  return parseDurationSeconds(text);
}

/**
 * Empty id / junk / negative / over-cap / unparseable → empty.
 * Live / missing / tomb / same value → noop.
 * A real finished log with a different clock applies. 0 clears.
 */
export function decideEditSessionDuration(input: {
  sessionId: unknown;
  durationSeconds: unknown;
  history?: readonly CompletedWorkoutLog[] | null;
  live?: ActiveWorkout | null;
}): EditSessionDurationDecision {
  const sessionId = normalizeSessionId(input.sessionId);
  if (!sessionId) return { kind: 'empty' };
  const durationSeconds = parseEditSessionDuration(input.durationSeconds);
  if (durationSeconds == null) return { kind: 'empty' };
  if (liveSessionIds(input.live).has(sessionId)) return { kind: 'noop' };
  const found = findFinishedSession(input.history, sessionId);
  if (!found) return { kind: 'noop' };
  if (durationSeconds === currentSessionDuration(found)) return { kind: 'noop' };
  return { kind: 'apply', sessionId: found.id, durationSeconds };
}

export function applyEditSessionDuration(input: {
  sessionId: unknown;
  durationSeconds: unknown;
  history?: readonly CompletedWorkoutLog[] | null;
  live?: ActiveWorkout | null;
  now?: string;
}): EditSessionDurationApply | null {
  const decision = decideEditSessionDuration(input);
  if (decision.kind !== 'apply') return null;
  const history = Array.isArray(input.history) ? input.history : [];
  const now = input.now ?? new Date().toISOString();
  let next: CompletedWorkoutLog | null = null;
  const mapped = history.map((log) => {
    if (!log || normalizeSessionId(log.id) !== decision.sessionId) return log;
    const edited: CompletedWorkoutLog = {
      ...log,
      durationSeconds: decision.durationSeconds,
      updatedAt: now,
      revision: (typeof log.revision === 'number' ? log.revision : 1) + 1,
    };
    next = edited;
    return edited;
  });
  if (!next) return null;
  return { history: mapped, next };
}
