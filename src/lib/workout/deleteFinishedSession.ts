/**
 * Delete one finished session they own (`.1003`).
 *
 * Backfill mints a day. Edit corrects a log that exists.
 * Missing: undo a bogus Monday. Confirm-gated. Cannot
 * recover. Empty / live / missing invents nothing.
 * Never wipes the account. Never discards the live set
 * (that is cancel elsewhere). Pure: no store.
 */

import type { ActiveWorkout, CompletedWorkoutLog } from '@/types';

export type DeleteFinishedDecision =
  | { kind: 'empty' }
  | { kind: 'noop' }
  | { kind: 'needs-confirm'; sessionId: string };

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

/** Finished log matching id or clientId. Tombstones are not a session. */
export function findFinishedSession(
  history: readonly CompletedWorkoutLog[] | null | undefined,
  sessionId: unknown
): CompletedWorkoutLog | null {
  const id = normalizeSessionId(sessionId);
  if (!id || !Array.isArray(history)) return null;
  for (const log of history) {
    if (!log || log.deletedAt) continue;
    if (normalizeSessionId(log.id) === id) return log;
    if (normalizeSessionId(log.clientId) === id) return log;
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
