/**
 * A year of logged days for History — Monday-first weeks, counts only.
 *
 * The month grid already owns "which local day had a live session"
 * (`trainedDayKeys`). This window is that map drawn as 53 week columns
 * ending on the week of `today`. A blank cell is nothing logged.
 * A gap is not a mark the grid can honestly paint.
 *
 * Dates are local calendar keys from `localDateKey` / `localDateKeyFromIso`.
 */

import { localDateKey, localDateKeyFromIso, startOfLocalWeek } from '@/lib/time/localDate';
import { trainedDayKeys } from '@/lib/history/monthGrid';

/** This week plus 52 before it — a contribution-graph year. */
export const YEAR_HEAT_WEEKS = 53;

/** 0 nothing logged · 1 · 2 · 3 · 4 or more sessions that local day. */
export type HeatLevel = 0 | 1 | 2 | 3 | 4;

export interface YearHeatCell {
  /** Local `YYYY-MM-DD`. */
  key: string;
  sessions: number;
  level: HeatLevel;
  isToday: boolean;
  /** After `today`. Still a real cell. A log here still counts. */
  isFuture: boolean;
  /** 0 Monday … 6 Sunday. */
  weekday: number;
}

export interface YearHeatWeek {
  /** Monday of this column, `YYYY-MM-DD`. */
  weekKey: string;
  /** The 1st, when this column contains one — the month-label anchor. */
  monthStartKey: string | null;
  cells: YearHeatCell[];
}

export interface YearHeatmap {
  startKey: string;
  /** Local today. The grid runs through the end of this week. */
  endKey: string;
  weeks: YearHeatWeek[];
  /** Days in the window with at least one live session. */
  trainedDays: number;
  /** Live sessions whose local day falls in the window. */
  sessions: number;
}

export interface YearHeatmapInput {
  history: readonly { completedAt: string; deletedAt?: string | null }[];
  /** Injected so the grid has no clock of its own. */
  today?: Date;
  /** 1–53. Anything else falls back to `YEAR_HEAT_WEEKS`. */
  weeks?: number;
}

/**
 * How full the cell is. Non-integers, negatives, and zero are empty —
 * the grid does not invent a session.
 */
export function sessionHeatLevel(sessions: number): HeatLevel {
  if (!Number.isInteger(sessions) || sessions < 1) return 0;
  if (sessions === 1) return 1;
  if (sessions === 2) return 2;
  if (sessions === 3) return 3;
  return 4;
}

function weekColumns(value: number | undefined): number {
  if (value === undefined) return YEAR_HEAT_WEEKS;
  if (!Number.isInteger(value) || value < 1 || value > YEAR_HEAT_WEEKS) return YEAR_HEAT_WEEKS;
  return value;
}

function addLocalDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function buildYearHeatmap({
  history,
  today = new Date(),
  weeks,
}: YearHeatmapInput): YearHeatmap {
  const columns = weekColumns(weeks);
  const todayKey = localDateKey(today);
  const counts = trainedDayKeys(history, localDateKeyFromIso);
  const endMonday = startOfLocalWeek(today);
  const startMonday = addLocalDays(endMonday, -7 * (columns - 1));

  const grid: YearHeatWeek[] = [];
  let trainedDays = 0;
  let sessions = 0;

  for (let w = 0; w < columns; w++) {
    const weekStart = addLocalDays(startMonday, w * 7);
    const cells: YearHeatCell[] = [];
    let monthStartKey: string | null = null;
    for (let weekday = 0; weekday < 7; weekday++) {
      const key = localDateKey(addLocalDays(weekStart, weekday));
      const n = counts.get(key) ?? 0;
      if (n > 0) {
        trainedDays += 1;
        sessions += n;
      }
      if (key.endsWith('-01')) monthStartKey = key;
      cells.push({
        key,
        sessions: n,
        level: sessionHeatLevel(n),
        isToday: key === todayKey,
        isFuture: key > todayKey,
        weekday,
      });
    }
    grid.push({
      weekKey: localDateKey(weekStart),
      monthStartKey,
      cells,
    });
  }

  return {
    startKey: grid[0]?.cells[0]?.key ?? todayKey,
    endKey: todayKey,
    weeks: grid,
    trainedDays,
    sessions,
  };
}
