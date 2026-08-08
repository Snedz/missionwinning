import type { CompletedWorkoutLog } from '@/types';
import { localDateKeyFromIso, localWeekKey } from '@/lib/time/localDate';

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

/**
 * The two Mission Score inputs that must be **this week's** (`.606`).
 *
 * Both call sites used to pass `workoutHistory.length` and `sumHistoryVolume(...)`
 * — lifetime figures — into a score documented as a weekly grade that resets, which
 * is most of how ≈32 of its 100 points came to be permanent. They live here, beside
 * the lifetime sum they replace, so the difference is visible in one file rather
 * than re-derived at each caller.
 *
 * `localWeekKey` / `localDateKeyFromIso`, never `toISOString()` — the week boundary
 * has to be the athlete's, and comparing a UTC date half against a local Monday is
 * the `.241` defect that shipped a wrong shared week east of UTC.
 */
function inCurrentLocalWeek(w: CompletedWorkoutLog, weekStart: string): boolean {
  if (w.deletedAt) return false;
  return localDateKeyFromIso(w.completedAt) >= weekStart;
}

/** Non-deleted sessions completed since local Monday. */
export function countSessionsThisWeek(history: readonly CompletedWorkoutLog[]): number {
  const weekStart = localWeekKey();
  let n = 0;
  for (const w of history) if (inCurrentLocalWeek(w, weekStart)) n += 1;
  return n;
}

/** Volume logged since local Monday. */
export function sumVolumeThisWeek(history: readonly CompletedWorkoutLog[]): number {
  const weekStart = localWeekKey();
  let sum = 0;
  for (const w of history) {
    if (!inCurrentLocalWeek(w, weekStart)) continue;
    const v = w.totalVolume;
    if (typeof v === 'number' && Number.isFinite(v)) sum += v;
  }
  return sum;
}
