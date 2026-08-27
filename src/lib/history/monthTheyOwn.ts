/**
 * Month they own (`.1018`). Empty-day log (`.1028`).
 *
 * Quiet History month. Live sessions only. Tombs out.
 * Start-from fold never erases a month mark or a day row.
 * Empty / missing / junk invents nothing. Not a fire count.
 * Kind `none` past-or-today opens backfill on that dateKey.
 * Pure: no store.
 */

import type { CompletedWorkoutLog } from '@/types';
import { liveLogDateKey, liveSessionLogs } from '@/lib/history/liveLogs';
import { sessionSetCount } from '@/lib/history/sessionHistoryList';
import { isLocalDateKey } from '@/lib/time/localDate';

export type MonthDayFact = {
  dateKey: string;
  sessions: number;
  setCount: number;
};

export type MonthDaySelectDecision =
  | { kind: 'empty' }
  | { kind: 'none'; dateKey: string }
  | { kind: 'day'; dateKey: string; rows: CompletedWorkoutLog[] };

export type EmptyDayLogDecision =
  | { kind: 'empty' }
  | { kind: 'open'; dateKey: string };

/**
 * Per-day live facts already on the logs. Tombs dropped.
 * `startFrom` is accepted so callers cannot "forget" it — and is ignored.
 */
export function monthLiveFacts(
  history: readonly CompletedWorkoutLog[] | null | undefined,
  startFrom?: string | null
): Map<string, MonthDayFact> {
  void startFrom;
  const facts = new Map<string, MonthDayFact>();
  for (const log of liveSessionLogs(history)) {
    const dateKey = liveLogDateKey(log);
    if (!dateKey) continue;
    const prev = facts.get(dateKey);
    const setCount = sessionSetCount(log);
    if (!prev) {
      facts.set(dateKey, { dateKey, sessions: 1, setCount });
      continue;
    }
    facts.set(dateKey, {
      dateKey,
      sessions: prev.sessions + 1,
      setCount: prev.setCount + setCount,
    });
  }
  return facts;
}

/**
 * Empty / missing / junk date → empty.
 * A real day with no live session → none (calm; invents nothing).
 * Live rows that day → day. Tombs never appear.
 * Start-from fold is ignored — the month they own is the full live diary.
 */
export function decideMonthDaySelect(input: {
  dateKey?: unknown;
  history?: readonly CompletedWorkoutLog[] | null;
  startFrom?: string | null;
}): MonthDaySelectDecision {
  void input.startFrom;
  if (!isLocalDateKey(input.dateKey)) return { kind: 'empty' };
  const dateKey = input.dateKey;
  const rows = liveSessionLogs(input.history).filter((log) => liveLogDateKey(log) === dateKey);
  if (rows.length === 0) return { kind: 'none', dateKey };
  return { kind: 'day', dateKey, rows };
}

/**
 * Empty-day door (`.1028`). Kind `none` past-or-today opens backfill on
 * that dateKey. Live rows, junk, missing, and future invent nothing.
 * Tombs do not occupy the day. Vacated day is empty.
 */
export function decideEmptyDayLog(input: {
  dateKey?: unknown;
  todayKey?: unknown;
  history?: readonly CompletedWorkoutLog[] | null;
  startFrom?: string | null;
}): EmptyDayLogDecision {
  void input.startFrom;
  if (!isLocalDateKey(input.todayKey)) return { kind: 'empty' };
  const select = decideMonthDaySelect({
    dateKey: input.dateKey,
    history: input.history,
    startFrom: input.startFrom,
  });
  if (select.kind !== 'none') return { kind: 'empty' };
  if (select.dateKey > input.todayKey) return { kind: 'empty' };
  return { kind: 'open', dateKey: select.dateKey };
}
