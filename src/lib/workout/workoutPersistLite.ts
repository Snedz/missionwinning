/**
 * Read workout persist blob without importing zustand workoutStore.
 * For cold-path shells (Today lean, nav) that only need history counts / flags.
 */

import type { CompletedWorkoutLog } from '@/types';
import { WORKOUT_STORE_KEY } from '@/lib/storage/keys';
import { readJson } from '@/lib/storage/safeStorage';
import { localDateKey, localDateKeyFromIso } from '@/lib/time/localDate';
import { streakFromDates } from '@/lib/streakRecency';

type PersistShape = {
  state?: {
    workoutHistory?: CompletedWorkoutLog[];
    activeWorkout?: unknown;
  };
};

function parsePersist(): PersistShape | null {
  return readJson<PersistShape | null>(WORKOUT_STORE_KEY, null);
}

export function readWorkoutHistoryFromStorage(): CompletedWorkoutLog[] {
  const parsed = parsePersist();
  const history = parsed?.state?.workoutHistory;
  return Array.isArray(history) ? history : [];
}

/**
 * Consecutive training days for the cold path — 0 unless the run reaches today
 * or yesterday.
 *
 * `.220` — this used to be a bare `parseInt` of `mw_streak`, which `.217` left
 * behind. `.217` gave `getTrainingStreak` a recency rule and its guard claimed
 * *"both streak readers apply it"* — while naming only the two files I had
 * looked at. There were four readers and three writers. This was one of them,
 * and it is the one on Today.
 *
 * The consequence was not theoretical. `HomeTodayLean` overwrites this value
 * from history — **but only when history is non-empty**, which is exactly the
 * case it is wrong for. An athlete with no workouts and an inflated
 * `mw_streak` (see `AssessmentsPage`) saw a training streak from zero sessions,
 * and `streak === 0` gates the *"log a set"* prompt, so the wrong number
 * suppressed the one nudge that screen exists to give them.
 *
 * Computed from the same persist blob this module already reads, so the cold
 * path stays catalog-free — `streakRecency` imports nothing but `localDate`.
 */
export function readTrainingStreakFromStorage(): number {
  return streakFromDates(
    readWorkoutHistoryFromStorage().map((w) => localDateKeyFromIso(w.completedAt)),
    localDateKey()
  );
}
