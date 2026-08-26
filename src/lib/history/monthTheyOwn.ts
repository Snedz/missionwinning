/**
 * Month they own (`.1018`).
 *
 * Quiet History month. Live sessions only. Tombs out.
 * Start-from fold never erases a month mark or a day row.
 * Empty / missing / junk invents nothing. Not a fire count.
 * Pure: no store.
 */

import type { CompletedWorkoutLog } from '@/types';
import { sessionSetCount } from '@/lib/history/sessionHistoryList';
import { isLocalDateKey, localDateKeyFromIso } from '@/lib/time/localDate';

export type MonthDayFact = {
  dateKey: string;
  sessions: number;
  setCount: number;
};

export type MonthDaySelectDecision =
  | { kind: 'empty' }
  | { kind: 'none'; dateKey: string }
  | { kind: 'day'; dateKey: string; rows: CompletedWorkoutLog[] };

function liveRows(
  history: readonly CompletedWorkoutLog[] | null | undefined
): CompletedWorkoutLog[] {
  if (!Array.isArray(history)) return [];
  return history.filter((log) => Boolean(log) && !log.deletedAt);
}

function logDateKey(log: CompletedWorkoutLog): string {
  return localDateKeyFromIso(log.completedAt || log.startedAt);
}

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
  for (const log of liveRows(history)) {
    const dateKey = logDateKey(log);
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
  const rows = liveRows(input.history).filter((log) => logDateKey(log) === dateKey);
  if (rows.length === 0) return { kind: 'none', dateKey };
  return { kind: 'day', dateKey, rows };
}
