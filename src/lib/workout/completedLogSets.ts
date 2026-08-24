/**
 * One set-count for a completed log. Today highlights and Victory receipt
 * must not each keep a private copy — launchTruth treats that as two answers
 * to the same domain question.
 */
import type { CompletedWorkoutLog } from '@/types';

export function countCompletedLogSets(
  log: Pick<CompletedWorkoutLog, 'exercises'>
): number {
  return log.exercises.reduce((n, ex) => n + ex.sets.length, 0);
}
