/**
 * Weekly training recap for Today hub (Sunday briefing + mid-week pulse).
 */

import type { CompletedWorkoutLog } from '@/types';
import { getTrainingStreak } from '@/lib/challenges';
import { localDateKey, startOfLocalWeek } from '@/lib/time/localDate';

export type WeekRecap = {
  /** Local Monday as `YYYY-MM-DD` — see `time/localDate.ts`. */
  weekStart: string;
  sessions: number;
  totalVolume: number;
  totalSets: number;
  streak: number;
  /** True when local day is Sunday (end-of-week ceremony). */
  isWeekEnd: boolean;
  /** True when user has at least one session this week. */
  hasActivity: boolean;
};

export function buildWeekRecap(history: CompletedWorkoutLog[], now = new Date()): WeekRecap {
  const weekStart = startOfLocalWeek(now);
  const weekStartMs = weekStart.getTime();
  /*
   * `.223` — tombstones excluded.
   *
   * This filter tested the date and nothing else, while `dayReview.ts:86` and
   * `behaviorImpacts.ts:123` both drop `deletedAt` rows. So a session the athlete
   * deleted still counted here — and these three numbers do not stay on screen:
   * `buildRecapCardData` prints sessions, sets and volume onto the PNG shared to
   * a public feed. `.208`, the same shape as the PR chip that fired on a set the
   * rest of the app declines to trust: a celebration the app cannot support.
   */
  const weekLogs = history.filter((log) => {
    if (log.deletedAt) return false;
    const t = new Date(log.completedAt || log.startedAt).getTime();
    return t >= weekStartMs;
  });
  const totalVolume = weekLogs.reduce((s, l) => s + (l.totalVolume || 0), 0);
  const totalSets = weekLogs.reduce(
    (s, l) => s + l.exercises.reduce((es, ex) => es + ex.sets.length, 0),
    0
  );
  return {
    weekStart: localDateKey(weekStart),
    sessions: weekLogs.length,
    totalVolume,
    totalSets,
    streak: getTrainingStreak(history),
    isWeekEnd: now.getDay() === 0,
    hasActivity: weekLogs.length > 0,
  };
}
