/**
 * Unified training + fuel streak reads.
 * Training semantics match legacy challenges/missionJourney (mw_streak LS override).
 * Keep free of nutrition/guidebook imports so missionJourney can call this safely.
 */

import type { CompletedWorkoutLog } from '@/types';
import { getFuelLogStreak } from '@/lib/fuelStreak';

export const STREAK_KEY = 'mw_streak';

/** Consecutive training days — exact prior semantics (localStorage override when > 0). */
export function getTrainingStreak(workoutHistory: CompletedWorkoutLog[]): number {
  if (typeof window !== 'undefined') {
    try {
      const stored = parseInt(localStorage.getItem(STREAK_KEY) || '0', 10);
      if (Number.isFinite(stored) && stored > 0) return stored;
    } catch {
      /* fall through */
    }
  }
  if (workoutHistory.length === 0) return 0;

  const dates = [
    ...new Set(workoutHistory.map((w) => new Date(w.completedAt).toISOString().split('T')[0])),
  ]
    .sort()
    .reverse();

  let streak = 1;
  for (let i = 0; i < dates.length - 1; i++) {
    const a = new Date(dates[i]);
    const b = new Date(dates[i + 1]);
    const diff = Math.floor((a.getTime() - b.getTime()) / (1000 * 3600 * 24));
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

export function getStreaks(workoutHistory: CompletedWorkoutLog[]): {
  training: number;
  fuel: number;
} {
  return {
    training: getTrainingStreak(workoutHistory),
    fuel: getFuelLogStreak(),
  };
}
