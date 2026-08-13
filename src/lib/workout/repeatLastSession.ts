/**
 * Repeat last completed session (Strong/Hevy empty-start).
 *
 * One control: copy the newest viable log via `templateFromCompletedLog`.
 * Does not generate Just Go, does not mark Coach-prescribed, does not start rest.
 * Pure: no store, no fetch.
 */

import type { CompletedWorkoutLog } from '@/types';
import {
  templateFromCompletedLog,
  type HistoryRetrainTemplate,
} from '@/lib/workout/historyRetrain';

export type { HistoryRetrainTemplate };

/**
 * Newest-first history → startWorkout template (names + last loads/reps).
 * Null when every log is tombstoned, empty, or has no exercise ids.
 */
export function repeatLastSessionTemplate(
  history: readonly CompletedWorkoutLog[]
): HistoryRetrainTemplate | null {
  for (const log of history) {
    const template = templateFromCompletedLog(log);
    if (template) return template;
  }
  return null;
}

/**
 * Today primary may Repeat Last only when Mission Coach does not already own
 * the hero (live session with exercises). Train empty never calls this — it
 * repeats last whenever a template exists.
 */
export function shouldRepeatLastOnToday(opts: {
  hasLiveCoach: boolean;
  history: readonly CompletedWorkoutLog[];
}): HistoryRetrainTemplate | null {
  if (opts.hasLiveCoach) return null;
  return repeatLastSessionTemplate(opts.history);
}
