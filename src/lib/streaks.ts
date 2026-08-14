/**
 * Unified training + fuel streak reads.
 *
 * Keep free of nutrition/guidebook imports so missionJourney can call this safely.
 *
 * `.217` — every read here used to overstate. See `streakRecency.ts` for the
 * full account and the one definition of "live"; the short version is that
 * neither branch below ever asked **when** the athlete last trained, so a run
 * that ended three months ago still reported its old length to the share card,
 * the commissioning milestone and the public leaderboard.
 */

import type { CompletedWorkoutLog } from '@/types';
import { getFuelLogStreak } from '@/lib/fuelStreak';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readRaw, writeRaw } from '@/lib/storage/safeStorage';
import { localDateKey, localDateKeyFromIso } from '@/lib/time/localDate';
import { isStreakLive } from '@/lib/streakRecency';
import { loadPlannedRestDays } from '@/lib/rewards/plannedRestStorage';
import { streakFromDatesAllowingRest } from '@/lib/rewards/plannedRest';

export const STREAK_KEY = STORAGE_KEYS.streak;

/**
 * Increment the stored streak override and return the new value.
 *
 * The founder tools on Today and Benchmarks each hand-rolled this read-increment-write
 * a dozen times over, every copy with its own try/catch. One version means one place to
 * fix when the semantics change.
 *
 * `.217` gave it the semantics `bumpFuelLogStreak` has always had, because a
 * "day streak" that counts taps rather than days is not a day streak:
 *
 *   - **same day is a no-op** — three pillar wins in one afternoon used to add +3;
 *   - **a gap resets to 1** rather than continuing from a stale number;
 *   - **the day is recorded**, so a reader can tell whether the count is live.
 *
 * The correct implementation was already in this repo, one file over. It simply
 * was not the one this streak used.
 */
export function bumpTrainingStreak(): number {
  const today = localDateKey();
  const last = readRaw(STORAGE_KEYS.streakLastBump);
  const current = parseInt(readRaw(STREAK_KEY) || '0', 10);
  const safeCurrent = Number.isFinite(current) ? Math.max(0, current) : 0;

  if (last === today) return safeCurrent;

  const next = isStreakLive(last ?? '', today) ? safeCurrent + 1 : 1;
  writeRaw(STREAK_KEY, String(next));
  writeRaw(STORAGE_KEYS.streakLastBump, today);
  return next;
}

/**
 * Consecutive training days — 0 unless the run reaches today or yesterday.
 *
 * Both branches are gated. An override that survives a three-month gap is
 * exactly as dishonest as a computed one, and the override is the branch
 * `dayReview` singled out as *"unfit for a factual sentence"*.
 */
export function getTrainingStreak(workoutHistory: CompletedWorkoutLog[]): number {
  const today = localDateKey();

  const stored = parseInt(readRaw(STREAK_KEY) || '0', 10);
  if (Number.isFinite(stored) && stored > 0) {
    /*
     * Overrides written before `.217` carry no day. They are not evidence of a
     * live streak — only that some number was written at an unknown time — so
     * they fall through to the history, which can actually be checked.
     */
    const last = readRaw(STORAGE_KEYS.streakLastBump);
    if (last && isStreakLive(last, today)) return stored;
  }

  return streakFromDatesAllowingRest(
    workoutHistory.map((w) => localDateKeyFromIso(w.completedAt)),
    loadPlannedRestDays(),
    today
  );
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
