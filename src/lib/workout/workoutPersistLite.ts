/**
 * Read workout persist blob without importing zustand workoutStore.
 * For cold-path shells (Today lean, nav) that only need history counts / flags.
 */

import type { CompletedWorkoutLog } from '@/types';
import { STORAGE_KEYS, WORKOUT_STORE_KEY } from '@/lib/storage/keys';
import { readJson, readRaw } from '@/lib/storage/safeStorage';

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

/** Streak counter written by challenges module — no catalog import. */
export function readTrainingStreakFromStorage(): number {
  const n = parseInt(readRaw(STORAGE_KEYS.streak) || '0', 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}
