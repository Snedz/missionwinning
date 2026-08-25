/**
 * Quiet Mon–Sun glance for Today — diary, not a shame grid.
 *
 * Done = a live log on that local calendar day. Empty stays empty.
 * Planned holes are not an input. Dates stay local-field.
 */

import type { CompletedWorkoutLog } from '@/types';
import {
  localDateKey,
  localDateKeyFromIso,
  startOfLocalWeek,
} from '@/lib/time/localDate';

export type QuietWeekDay = {
  dateKey: string;
  offset: number;
  done: boolean;
  isToday: boolean;
};

export type QuietWeekGlance = {
  weekStart: string;
  todayOffset: number;
  days: QuietWeekDay[];
};

function isPerformedSet(set: { reps?: number }): boolean {
  return (set.reps ?? 0) > 0;
}

function isLiveLog(log: CompletedWorkoutLog): boolean {
  if (log.deletedAt) return false;
  return (log.exercises ?? []).some((ex) => (ex.sets ?? []).some(isPerformedSet));
}

function localDateKeyPlusDays(key: string, days: number): string {
  const [y, m, d] = key.split('-').map(Number);
  if (!y || !m || !d) return '';
  return localDateKey(new Date(y, m - 1, d + days));
}

function loggedDateKeys(history: readonly CompletedWorkoutLog[]): Set<string> {
  const keys = new Set<string>();
  for (const log of history) {
    if (!isLiveLog(log)) continue;
    const key = localDateKeyFromIso(log.completedAt || log.startedAt);
    if (!key) continue;
    keys.add(key);
  }
  return keys;
}

/**
 * Seven local days of this week. Empty history invents no shame.
 */
export function quietWeekGlance(opts: {
  history: readonly CompletedWorkoutLog[];
  now?: Date;
}): QuietWeekGlance {
  const now = opts.now ?? new Date();
  const weekStart = localDateKey(startOfLocalWeek(now));
  const todayKey = localDateKey(now);
  const doneKeys = loggedDateKeys(opts.history);
  const days: QuietWeekDay[] = [];
  let todayOffset = 0;

  for (let offset = 0; offset <= 6; offset++) {
    const dateKey = localDateKeyPlusDays(weekStart, offset);
    const isToday = dateKey === todayKey;
    if (isToday) todayOffset = offset;
    days.push({
      dateKey,
      offset,
      done: doneKeys.has(dateKey),
      isToday,
    });
  }

  return { weekStart, todayOffset, days };
}
