/**
 * Live workout logs — tombs out. One filter (`.178`).
 *
 * Export, import, search, the month they own, and Today's highlights
 * all asked the same question with private copies. The copies drifted
 * on `Array.isArray` and `Boolean(log)` and launchTruth caught the
 * two-body shape. This is the home; callers do not restate it.
 */

import type { CompletedWorkoutLog } from '@/types';

export function liveSessionLogs(
  history: readonly CompletedWorkoutLog[] | null | undefined
): CompletedWorkoutLog[] {
  if (!Array.isArray(history)) return [];
  return history.filter((log) => Boolean(log) && !log.deletedAt);
}
