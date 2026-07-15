/**
 * Read workout persist blob without importing zustand workoutStore.
 * For cold-path shells (Today lean, nav) that only need history counts / flags.
 */

import type { CompletedWorkoutLog } from '@/types';

const STORAGE_KEY = 'workout-tracker-storage';

type PersistShape = {
  state?: {
    workoutHistory?: CompletedWorkoutLog[];
    activeWorkout?: unknown;
  };
};

function parsePersist(): PersistShape | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistShape;
  } catch {
    return null;
  }
}

export function readWorkoutHistoryFromStorage(): CompletedWorkoutLog[] {
  const parsed = parsePersist();
  const history = parsed?.state?.workoutHistory;
  return Array.isArray(history) ? history : [];
}

/** Streak counter written by challenges module — no catalog import. */
export function readTrainingStreakFromStorage(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const n = parseInt(localStorage.getItem('mw_streak') || '0', 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}
