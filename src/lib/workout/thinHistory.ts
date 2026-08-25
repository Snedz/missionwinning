/**
 * Thin-history honesty — a notebook is not a dataset.
 *
 * Week-1 Strong migrants have one or two sessions. Wednesday must not
 * invent a next day from that, and the week strip must not invent a
 * streak / on-track / consistency score. Tombstones and 0-rep rows
 * are not sessions. `.964`.
 */

import type { CompletedWorkoutLog } from '@/types';

/** 1–2 live sessions stay a notebook. 3+ may earn a log cite. */
export const THIN_HISTORY_MAX_LIVE_SESSIONS = 2;

/** Specified E-Adjacency empty target — never an invented number. */
export const ACTIVE_TARGET_EMPTY_LINE = 'No prior sets yet — log this one';

function isPerformedSet(set: { reps?: number }): boolean {
  return (set.reps ?? 0) > 0;
}

export function isLiveSession(log: CompletedWorkoutLog): boolean {
  if (log.deletedAt) return false;
  return (log.exercises ?? []).some((ex) => (ex.sets ?? []).some(isPerformedSet));
}

export function countLiveSessions(history: readonly CompletedWorkoutLog[]): number {
  return history.filter(isLiveSession).length;
}

/** True when the diary is empty or only one or two live sessions. */
export function isThinHistory(history: readonly CompletedWorkoutLog[]): boolean {
  return countLiveSessions(history) <= THIN_HISTORY_MAX_LIVE_SESSIONS;
}
