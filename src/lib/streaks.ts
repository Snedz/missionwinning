/**
 * Unified training + fuel streak reads.
 * Training semantics match legacy challenges/missionJourney (mw_streak LS override).
 * Keep free of nutrition/guidebook imports so missionJourney can call this safely.
 */

import type { CompletedWorkoutLog } from '@/types';
import { getFuelLogStreak } from '@/lib/fuelStreak';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readRaw, writeRaw } from '@/lib/storage/safeStorage';
import { localDateKeyFromIso } from '@/lib/time/localDate';

export const STREAK_KEY = STORAGE_KEYS.streak;

/**
 * Increment the stored streak override and return the new value.
 *
 * The founder tools on Today and Benchmarks each hand-rolled this read-increment-write
 * a dozen times over, every copy with its own try/catch. One version means one place to
 * fix when the semantics change.
 */
export function bumpTrainingStreak(): number {
  const current = parseInt(readRaw(STREAK_KEY) || '0', 10);
  const next = (Number.isFinite(current) ? Math.max(0, current) : 0) + 1;
  writeRaw(STREAK_KEY, String(next));
  return next;
}

/** Consecutive training days — exact prior semantics (stored override when > 0). */
export function getTrainingStreak(workoutHistory: CompletedWorkoutLog[]): number {
  const stored = parseInt(readRaw(STREAK_KEY) || '0', 10);
  if (Number.isFinite(stored) && stored > 0) return stored;
  if (workoutHistory.length === 0) return 0;

  const dates = [
    ...new Set(workoutHistory.map((w) => localDateKeyFromIso(w.completedAt))),
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
