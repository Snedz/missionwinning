/**
 * Weekly training recap for Today hub (Sunday briefing + mid-week pulse).
 */

import type { CompletedWorkoutLog } from '@/types';
import { getTrainingStreak } from '@/lib/challenges';

export type WeekRecap = {
  /** ISO date of week start (Monday UTC-ish local Monday). */
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

function startOfLocalWeek(d = new Date()): Date {
  const day = d.getDay(); // 0 Sun … 6 Sat
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const start = new Date(d);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + mondayOffset);
  return start;
}

export function buildWeekRecap(history: CompletedWorkoutLog[], now = new Date()): WeekRecap {
  const weekStart = startOfLocalWeek(now);
  const weekStartMs = weekStart.getTime();
  const weekLogs = history.filter((log) => {
    const t = new Date(log.completedAt || log.startedAt).getTime();
    return t >= weekStartMs;
  });
  const totalVolume = weekLogs.reduce((s, l) => s + (l.totalVolume || 0), 0);
  const totalSets = weekLogs.reduce(
    (s, l) => s + l.exercises.reduce((es, ex) => es + ex.sets.length, 0),
    0
  );
  return {
    weekStart: weekStart.toISOString().slice(0, 10),
    sessions: weekLogs.length,
    totalVolume,
    totalSets,
    streak: getTrainingStreak(history),
    isWeekEnd: now.getDay() === 0,
    hasActivity: weekLogs.length > 0,
  };
}
