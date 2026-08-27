/**
 * Live workout logs — tombs out. One filter (`.178`).
 *
 * Export, import, search, the month they own, and Today's highlights
 * all asked the same question with private copies. The copies drifted
 * on `Array.isArray` and `Boolean(log)` and launchTruth caught the
 * two-body shape. This is the home; callers do not restate it.
 */

import type { CompletedWorkoutLog } from '@/types';
import { localDateKeyFromIso } from '@/lib/time/localDate';

export function liveSessionLogs(
  history: readonly CompletedWorkoutLog[] | null | undefined
): CompletedWorkoutLog[] {
  if (!Array.isArray(history)) return [];
  return history.filter((log) => Boolean(log) && !log.deletedAt);
}

/** Local date of a live log. Tombstones have no date here. */
export function liveLogDateKey(
  log: Pick<CompletedWorkoutLog, 'completedAt' | 'startedAt' | 'deletedAt'>
): string {
  if (log.deletedAt) return '';
  return localDateKeyFromIso(log.completedAt || log.startedAt);
}
