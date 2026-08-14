/**
 * Unique local calendar days with a completed Train log in the current week.
 *
 * Contract: docs/contracts/HABIT.md — daily Train is the habit loop.
 * 0 is a valid count. Never derive the day from toISOString().
 */

import type { CompletedWorkoutLog } from '@/types';
import { localDateKey, localDateKeyFromIso, startOfLocalWeek } from '@/lib/time/localDate';

export function countTrainDaysThisWeek(
  history: readonly CompletedWorkoutLog[],
  now: Date = new Date()
): number {
  const weekStartKey = localDateKey(startOfLocalWeek(now));
  const todayKey = localDateKey(now);
  const days = new Set<string>();

  for (const log of history) {
    if (log.deletedAt) continue;
    const key = localDateKeyFromIso(log.completedAt || log.startedAt);
    if (!key) continue;
    if (key < weekStartKey || key > todayKey) continue;
    days.add(key);
  }

  return days.size;
}

/** Shame-free EN shape — i18n key `todayHabitWeekCount` must stay this sentence. */
export const HABIT_WEEK_COUNT_EN = 'This week: {{count}} days logged';
