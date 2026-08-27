/**
 * Name this finished session (`.1007`).
 *
 * Private title on the History row / receipt. The template name stays
 * `workoutName`. Empty title is allowed — the date is the fallback.
 * Empty / missing / tombstone / live invents nothing. Not a Feed.
 * Pure: no store.
 */

import type { ActiveWorkout, CompletedWorkoutLog } from '@/types';
import { localDateKeyFromIso } from '@/lib/time/localDate';
import {
  findFinishedSession,
  normalizeSessionId,
} from '@/lib/workout/deleteFinishedSession';

export const SESSION_TITLE_MAX = 80;

export type NameFinishedDecision =
  | { kind: 'empty' }
  | { kind: 'noop' }
  | { kind: 'apply'; sessionId: string; title?: string };

export type NameFinishedApply = {
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

/** Trim. Empty / whitespace / non-string → omit. Over-cap truncated. */
export function normalizeSessionTitle(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.length > SESSION_TITLE_MAX
    ? trimmed.slice(0, SESSION_TITLE_MAX)
    : trimmed;
}

/** Title they named, or the date. Never invents a nickname. */
export function historySessionLabel(
  log: Pick<CompletedWorkoutLog, 'sessionTitle' | 'completedAt' | 'startedAt' | 'deletedAt'>,
  dateText?: string
): string {
  const title = normalizeSessionTitle(log.sessionTitle);
  if (title) return title;
  const date = (dateText ?? '').trim();
  if (date) return date;
  return localDateKeyFromIso(log.completedAt || log.startedAt);
}

function attachSessionTitle(
  log: CompletedWorkoutLog,
  title: string | undefined
): CompletedWorkoutLog {
  if (!title) {
    if (log.sessionTitle === undefined) return log;
    const { sessionTitle: _drop, ...rest } = log;
    return rest as CompletedWorkoutLog;
  }
  return { ...log, sessionTitle: title };
}

/**
 * Cloud rows never carry this field. If merge picks a cloud winner, keep
 * the local title when the winner has none. Empty invents nothing.
 */
export function preserveSessionTitle<T extends object>(winner: T, other: T): T {
  const win = winner as T & { sessionTitle?: string };
  const alt = other as T & { sessionTitle?: string };
  if (normalizeSessionTitle(win.sessionTitle)) return winner;
  const kept = normalizeSessionTitle(alt.sessionTitle);
  return kept ? { ...winner, sessionTitle: kept } : winner;
}

export function decideNameFinishedSession(input: {
  sessionId: unknown;
  title: unknown;
  history?: readonly CompletedWorkoutLog[] | null;
  live?: ActiveWorkout | null;
}): NameFinishedDecision {
  const sessionId = normalizeSessionId(input.sessionId);
  if (!sessionId) return { kind: 'empty' };
  if (liveSessionIds(input.live).has(sessionId)) return { kind: 'noop' };
  const found = findFinishedSession(input.history, sessionId);
  if (!found) return { kind: 'noop' };
  const title = normalizeSessionTitle(input.title);
  const current = normalizeSessionTitle(found.sessionTitle);
  if (title === current) return { kind: 'noop' };
  return { kind: 'apply', sessionId: found.id, title };
}

export function applyNameFinishedSession(input: {
  sessionId: unknown;
  title: unknown;
  history?: readonly CompletedWorkoutLog[] | null;
  live?: ActiveWorkout | null;
  now?: string;
}): NameFinishedApply | null {
  const decision = decideNameFinishedSession(input);
  if (decision.kind !== 'apply') return null;
  const history = Array.isArray(input.history) ? input.history : [];
  const now = input.now ?? new Date().toISOString();
  let next: CompletedWorkoutLog | null = null;
  const mapped = history.map((log) => {
    if (!log || normalizeSessionId(log.id) !== decision.sessionId) return log;
    const named = attachSessionTitle(
      {
        ...log,
        updatedAt: now,
        revision: (typeof log.revision === 'number' ? log.revision : 1) + 1,
      },
      decision.title
    );
    next = named;
    return named;
  });
  if (!next) return null;
  return { history: mapped, next };
}
