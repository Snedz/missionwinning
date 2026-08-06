/**
 * The current week, from logs alone — for athletes the coach strip cannot serve.
 *
 * `WeekStrip` needs a Mission Coach plan to compare against, so `basic` phase
 * and planless `readiness` athletes get no week visual at all on Today. This is
 * the log-driven counterpart: the same seven Monday-first cells, marked only
 * with what actually happened.
 *
 * The vocabulary is `monthGrid.ts`'s `DayMark`, imported rather than redefined
 * (`.178`): `trained` beats `logged`, a future day is forced to `'none'`
 * whatever a clock-skewed row claims, and **`missed` does not exist here** —
 * see the monthGrid header for why that word cannot be reconstructed honestly.
 *
 * Which days count as `logged` is also not decided here: the caller passes the
 * `daysWithData` union (the one sweeper over every dated store) so this module
 * cannot drift from the app's single definition of "the athlete showed up".
 */

import type { DayMark } from '@/lib/history/monthGrid';
import { localDateKey, startOfLocalWeek } from '@/lib/time/localDate';

export interface LogWeekDay {
  /** `YYYY-MM-DD`, Monday-first. */
  dateKey: string;
  /** 0..6 from Monday. */
  weekdayIndex: number;
  mark: DayMark;
  isToday: boolean;
  /** Nothing has happened yet; mark is forced to `'none'`. */
  isFuture: boolean;
}

export function buildLogWeek(
  input: { trainedKeys: ReadonlySet<string>; loggedKeys: ReadonlySet<string> },
  now: Date = new Date()
): LogWeekDay[] {
  const todayKey = localDateKey(now);
  const monday = startOfLocalWeek(now);
  const out: LogWeekDay[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    const key = localDateKey(d);
    // String compare is safe on `YYYY-MM-DD` — same reasoning as monthGrid.
    const isFuture = key > todayKey;
    out.push({
      dateKey: key,
      weekdayIndex: i,
      mark: isFuture
        ? 'none'
        : input.trainedKeys.has(key)
          ? 'trained'
          : input.loggedKeys.has(key)
            ? 'logged'
            : 'none',
      isToday: key === todayKey,
      isFuture,
    });
  }
  return out;
}
