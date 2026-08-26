/**
 * This month as a file they own (`.1029`).
 *
 * File out of the History calendar month currently shown. Reuses
 * `decideExportDiary` columns. Empty / missing / junk invents nothing.
 * Tombs stay out. Start-from does not shrink the file. Not a share.
 * Pure: no store.
 */

import type { CompletedWorkoutLog } from '@/types';
import { localDateKeyFromIso, localMonthKey } from '@/lib/time/localDate';
import { decideExportDiary, type ExportDiaryDecision } from '@/lib/history/exportDiary';

export type { ExportDiaryDecision };

function isLocalMonthKey(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}$/.test(value)) return false;
  const [y, m] = value.split('-').map(Number);
  if (!y || !m || m < 1 || m > 12) return false;
  return localMonthKey(new Date(y, m - 1, 1)) === value;
}

function liveInMonth(
  history: readonly CompletedWorkoutLog[] | null | undefined,
  monthKey: string
): CompletedWorkoutLog[] {
  if (!Array.isArray(history)) return [];
  const prefix = `${monthKey}-`;
  return history.filter((log) => {
    if (!log || log.deletedAt) return false;
    const dateKey = localDateKeyFromIso(log.completedAt || log.startedAt);
    return dateKey.startsWith(prefix);
  });
}

export function decideExportMonth(input: {
  monthKey?: unknown;
  history?: readonly CompletedWorkoutLog[] | null;
  startFrom?: string | null;
}): ExportDiaryDecision {
  void input.startFrom;
  if (!isLocalMonthKey(input.monthKey)) return { kind: 'empty' };
  return decideExportDiary(liveInMonth(input.history, input.monthKey));
}

export function exportMonthFileName(
  monthKey: unknown,
  ext: 'csv' | 'json'
): string {
  if (!isLocalMonthKey(monthKey)) return `mission-winning-month.${ext}`;
  return `mission-winning-month-${monthKey}.${ext}`;
}
