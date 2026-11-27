/**
 * Delete one finished session they own (`.1003`) and restore
 * it (`.1006`).
 *
 * Confirm-gated delete. Soft-delete. Restore on History.
 * Empty / live / missing / not-deleted invents nothing.
 * Never wipes the account. Never discards the live set
 * (that is cancel elsewhere). Pure: no store.
 */

import type { ActiveWorkout, CompletedWorkoutLog } from '@/types';

export type DeleteFinishedDecision =
  | { kind: 'empty' }
  | { kind: 'noop' }
  | { kind: 'needs-confirm'; sessionId: string };

export type RestoreFinishedDecision =
  | { kind: 'empty' }
  | { kind: 'noop' }
  | { kind: 'restore'; sessionId: string };

export type DeleteFinishedApply = {
  history: CompletedWorkoutLog[];
  next: CompletedWorkoutLog;
};

export function normalizeSessionId(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  return raw.trim();
}

function liveSessionIds(
  live: ActiveWorkout | null | undefined
): Set<string> {
  const ids = new Set<string>();
  if (!live) return ids;
  const clientId = normalizeSessionId(live.clientId);
  const workoutId = normalizeSessionId(live.workoutId);
  if (clientId) ids.add(clientId);
  if (workoutId) ids.add(workoutId);
  return ids;
}

function matchSessionId(log: CompletedWorkoutLog, id: string): boolean {
  return normalizeSessionId(log.id) === id || normalizeSessionId(log.clientId) === id;
}

/** Finished log matching id or clientId. Tombstones are not a session. */
export function findFinishedSession(
  history: readonly CompletedWorkoutLog[] | null | undefined,
  sessionId: unknown
): CompletedWorkoutLog | null {
  const id = normalizeSessionId(sessionId);
  if (!id || !Array.isArray(history)) return null;
  for (const log of history) {
    if (!log || log.deletedAt) continue;
    if (matchSessionId(log, id)) return log;
  }
  return null;
}

/** Tombstone matching id or clientId. Non-deleted rows are not this. */
export function findDeletedSession(
  history: readonly CompletedWorkoutLog[] | null | undefined,
  sessionId: unknown
): CompletedWorkoutLog | null {
  const id = normalizeSessionId(sessionId);
  if (!id || !Array.isArray(history)) return null;
  for (const log of history) {
    if (!log || !log.deletedAt) continue;
    if (matchSessionId(log, id)) return log;
  }
  return null;
}

/**
 * Empty id → empty. Live / missing / already gone → noop.
 * A real finished log always needs confirm — never auto-delete.
 */
export function decideDeleteFinishedSession(input: {
  sessionId: unknown;
  history?: readonly CompletedWorkoutLog[] | null;
  live?: ActiveWorkout | null;
}): DeleteFinishedDecision {
  const sessionId = normalizeSessionId(input.sessionId);
  if (!sessionId) return { kind: 'empty' };
  if (liveSessionIds(input.live).has(sessionId)) return { kind: 'noop' };
  const found = findFinishedSession(input.history, sessionId);
  if (!found) return { kind: 'noop' };
  return { kind: 'needs-confirm', sessionId: found.id };
}

export function applyDeleteFinishedSession(input: {
  sessionId: unknown;
  history?: readonly CompletedWorkoutLog[] | null;
  live?: ActiveWorkout | null;
  now?: string;
}): DeleteFinishedApply | null {
  const decision = decideDeleteFinishedSession(input);
  if (decision.kind !== 'needs-confirm') return null;
  const history = Array.isArray(input.history) ? input.history : [];
  const now = input.now ?? new Date().toISOString();
  let next: CompletedWorkoutLog | null = null;
  const mapped = history.map((log) => {
    if (!log || normalizeSessionId(log.id) !== decision.sessionId) return log;
    const tomb: CompletedWorkoutLog = {
      ...log,
      deletedAt: now,
      updatedAt: now,
      revision: (typeof log.revision === 'number' ? log.revision : 1) + 1,
    };
    next = tomb;
    return tomb;
  });
  if (!next) return null;
  return { history: mapped, next };
}

/**
 * Empty id → empty. Live / missing / not-deleted → noop.
 * A tombstone restores that one log. Never mints a row.
 */
export function decideRestoreFinishedSession(input: {
  sessionId: unknown;
  history?: readonly CompletedWorkoutLog[] | null;
  live?: ActiveWorkout | null;
}): RestoreFinishedDecision {
  const sessionId = normalizeSessionId(input.sessionId);
  if (!sessionId) return { kind: 'empty' };
  if (liveSessionIds(input.live).has(sessionId)) return { kind: 'noop' };
  const found = findDeletedSession(input.history, sessionId);
  if (!found) return { kind: 'noop' };
  return { kind: 'restore', sessionId: found.id };
}

export function applyRestoreFinishedSession(input: {
  sessionId: unknown;
  history?: readonly CompletedWorkoutLog[] | null;
  live?: ActiveWorkout | null;
  now?: string;
}): DeleteFinishedApply | null {
  const decision = decideRestoreFinishedSession(input);
  if (decision.kind !== 'restore') return null;
  const history = Array.isArray(input.history) ? input.history : [];
  const now = input.now ?? new Date().toISOString();
  let next: CompletedWorkoutLog | null = null;
  const mapped = history.map((log) => {
    if (!log || normalizeSessionId(log.id) !== decision.sessionId) return log;
    const restored: CompletedWorkoutLog = {
      ...log,
      deletedAt: null,
      updatedAt: now,
      revision: (typeof log.revision === 'number' ? log.revision : 1) + 1,
    };
    next = restored;
    return restored;
  });
  if (!next) return null;
  return { history: mapped, next };
}
