/**
 * Find a past session (`.1008`).
 *
 * Search the History list. Empty query invents nothing — same live
 * rows, same order. Tombs stay out. Not a Feed. Pure: no store.
 */

import type { CompletedWorkoutLog } from '@/types';
import { liveSessionLogs } from '@/lib/history/liveLogs';
import { localDateKeyFromIso } from '@/lib/time/localDate';
import { humanizeExerciseId } from '@/lib/workout/customExercise';

export type SearchHistoryOpts = {
  dateText?: (log: CompletedWorkoutLog) => string | undefined;
  liftName?: (exerciseId: string) => string | undefined;
};

function normalizeQuery(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim().toLowerCase();
}

function pushHay(parts: string[], value: unknown): void {
  if (typeof value !== 'string') return;
  const trimmed = value.trim();
  if (trimmed) parts.push(trimmed);
}

/** Fields a query may hit. Joined so a substring cannot span two fields. */
export function historySearchHaystack(
  log: CompletedWorkoutLog,
  opts?: SearchHistoryOpts
): string {
  const parts: string[] = [];
  pushHay(parts, log.sessionTitle);
  pushHay(parts, log.workoutName);
  pushHay(parts, localDateKeyFromIso(log.completedAt || log.startedAt));
  if (opts?.dateText) pushHay(parts, opts.dateText(log));
  pushHay(parts, log.sessionNote);
  for (const ex of log.exercises ?? []) {
    if (!ex?.exerciseId) continue;
    pushHay(parts, ex.exerciseId);
    pushHay(parts, humanizeExerciseId(ex.exerciseId));
    if (opts?.liftName) pushHay(parts, opts.liftName(ex.exerciseId));
  }
  return parts.join('\n').toLowerCase();
}

export function decideSearchHistory(input: {
  query: unknown;
  rows?: readonly CompletedWorkoutLog[] | null;
  dateText?: (log: CompletedWorkoutLog) => string | undefined;
  liftName?: (exerciseId: string) => string | undefined;
}): CompletedWorkoutLog[] {
  const live = liveSessionLogs(input.rows);
  const q = normalizeQuery(input.query);
  if (!q) return live;
  return live.filter((log) =>
    historySearchHaystack(log, {
      dateText: input.dateText,
      liftName: input.liftName,
    }).includes(q)
  );
}
