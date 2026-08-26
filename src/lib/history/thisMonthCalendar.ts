/**
 * This month on the History calendar (`.1031`).
 *
 * After paging prev/next, jump back to the current local month and today.
 * Empty / junk invents nothing. Already-this-month is noop.
 * Does not mutate history. Does not invent sessions.
 * Pure: no store.
 */

import { isLocalDateKey, isLocalMonthKey } from '@/lib/time/localDate';

export type ThisMonthDecision =
  | { kind: 'empty' }
  | { kind: 'noop' }
  | { kind: 'apply'; monthKey: string; dateKey: string };

function monthKeyFromDateKey(dateKey: string): string {
  const [y, m] = dateKey.split('-');
  return `${y}-${m}`;
}

/**
 * Empty / missing / junk viewed month or junk today → empty.
 * Viewed month already today's local month → noop.
 * Otherwise apply today's `YYYY-MM` and today's date key.
 */
export function decideThisMonth(input: {
  viewedMonthKey?: unknown;
  todayKey?: unknown;
}): ThisMonthDecision {
  if (!isLocalMonthKey(input.viewedMonthKey) || !isLocalDateKey(input.todayKey)) {
    return { kind: 'empty' };
  }
  const dateKey = input.todayKey;
  const monthKey = monthKeyFromDateKey(dateKey);
  if (!isLocalMonthKey(monthKey)) return { kind: 'empty' };
  if (input.viewedMonthKey === monthKey) return { kind: 'noop' };
  return { kind: 'apply', monthKey, dateKey };
}
