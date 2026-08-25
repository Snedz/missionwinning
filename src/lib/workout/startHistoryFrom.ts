/**
 * Start history from this date (`.1005`).
 *
 * Import + backfill can dump years into week 1. Fold older
 * logs out of the week strip / Coach / streak so week 1 is
 * honest. Data stays. Fold, don't erase. History detail still
 * opens the older session. Empty / missing / future invents
 * nothing. Confirm-gated if it hides a lot of days. Clearing
 * restores the full diary. Pure: no store.
 */

import type { CompletedWorkoutLog } from '@/types';
import { remove, readRaw, writeRaw } from '@/lib/storage/safeStorage';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { isLocalDateKey, localDateKeyFromIso } from '@/lib/time/localDate';

/** Unique train days folded before confirm is required. */
export const START_HISTORY_CONFIRM_DAYS = 14;

export const START_HISTORY_FROM_CHANGED = 'mw-start-history-from-changed';

export type StartHistoryFromDecision =
  | { kind: 'empty' }
  | { kind: 'noop' }
  | { kind: 'apply'; dateKey: string; foldedDays: number }
  | { kind: 'needs-confirm'; dateKey: string; foldedDays: number };

export type ClearStartHistoryFromDecision =
  | { kind: 'empty' }
  | { kind: 'clear' };

/** `YYYY-MM-DD` or empty. Never invents a calendar day. */
export function normalizeStartHistoryDate(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  const text = raw.trim();
  return isLocalDateKey(text) ? text : '';
}

function logDateKey(log: CompletedWorkoutLog): string {
  return localDateKeyFromIso(log.completedAt || log.startedAt);
}

/** Unique live train days strictly before `fromDate`. */
export function foldedTrainDays(
  history: readonly CompletedWorkoutLog[] | null | undefined,
  fromDate: string
): number {
  const dateKey = normalizeStartHistoryDate(fromDate);
  if (!dateKey || !Array.isArray(history)) return 0;
  const days = new Set<string>();
  for (const log of history) {
    if (!log || log.deletedAt) continue;
    const key = logDateKey(log);
    if (!key || key >= dateKey) continue;
    days.add(key);
  }
  return days.size;
}

/**
 * Empty / missing / junk / future → empty.
 * Same as the stored fold → noop.
 * A lot of hidden days → needs-confirm.
 * Otherwise apply.
 */
export function decideStartHistoryFrom(input: {
  date: unknown;
  todayKey: string;
  history?: readonly CompletedWorkoutLog[] | null;
  current?: string | null;
}): StartHistoryFromDecision {
  const dateKey = normalizeStartHistoryDate(input.date);
  if (!dateKey) return { kind: 'empty' };
  if (!isLocalDateKey(input.todayKey)) return { kind: 'empty' };
  if (dateKey > input.todayKey) return { kind: 'empty' };
  const current = normalizeStartHistoryDate(input.current);
  if (current === dateKey) return { kind: 'noop' };
  const foldedDays = foldedTrainDays(input.history, dateKey);
  if (foldedDays >= START_HISTORY_CONFIRM_DAYS) {
    return { kind: 'needs-confirm', dateKey, foldedDays };
  }
  return { kind: 'apply', dateKey, foldedDays };
}

export function decideClearStartHistoryFrom(input: {
  current?: string | null;
}): ClearStartHistoryFromDecision {
  const current = normalizeStartHistoryDate(input.current);
  if (!current) return { kind: 'empty' };
  return { kind: 'clear' };
}

/**
 * Week strip / Coach / streak may cite these logs.
 * Older rows stay in the source array and in History.
 */
export function foldHistoryFrom(
  history: readonly CompletedWorkoutLog[] | null | undefined,
  fromDate: string | null | undefined
): CompletedWorkoutLog[] {
  if (!Array.isArray(history)) return [];
  const dateKey = normalizeStartHistoryDate(fromDate);
  if (!dateKey) return history.slice();
  return history.filter((log) => {
    if (!log) return false;
    const key = logDateKey(log);
    if (!key) return false;
    return key >= dateKey;
  });
}

export function loadStartHistoryFrom(): string | null {
  return normalizeStartHistoryDate(readRaw(STORAGE_KEYS.startHistoryFrom)) || null;
}

function notifyStartHistoryFromChanged(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(START_HISTORY_FROM_CHANGED));
  window.dispatchEvent(new Event('mw-coach-plan-changed'));
}

export function persistStartHistoryFrom(dateKey: string | null): void {
  const next = normalizeStartHistoryDate(dateKey);
  if (!next) remove(STORAGE_KEYS.startHistoryFrom);
  else writeRaw(STORAGE_KEYS.startHistoryFrom, next);
  notifyStartHistoryFromChanged();
}

/** Logs week 1 may cite. Default fold is the stored date. */
export function historyForWeek(
  history: readonly CompletedWorkoutLog[] | null | undefined,
  fromDate: string | null | undefined = loadStartHistoryFrom()
): CompletedWorkoutLog[] {
  return foldHistoryFrom(history, fromDate);
}
