import type { CompletedWorkoutLog } from '@/types';

/** Sum totalVolume across non-deleted history. Pure for Today memo deps. */
export function sumHistoryVolume(history: readonly CompletedWorkoutLog[]): number {
  let sum = 0;
  for (const w of history) {
    if (w.deletedAt) continue;
    const v = w.totalVolume;
    if (typeof v === 'number' && Number.isFinite(v)) sum += v;
  }
  return sum;
}
