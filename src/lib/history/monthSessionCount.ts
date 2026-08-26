/**
 * Live session count for the History month on screen (`.1033`).
 *
 * The calendar footer already prints training days. Two logs on
 * Tuesday is still one training day. This counts live sessions
 * whose local date key starts with that `YYYY-MM`.
 *
 * Tombs stay out. `startFrom` is accepted and ignored — the month
 * they own is the full live diary. Empty / junk invents nothing.
 * Never invent 0 as apply. Empty month is empty, not a fire-zero.
 * Pure: no store.
 */

import type { CompletedWorkoutLog } from '@/types';
import { isLocalMonthKey } from '@/lib/time/localDate';
import { monthLiveFacts } from '@/lib/history/monthTheyOwn';

export type MonthSessionCountDecision =
  | { kind: 'empty' }
  | { kind: 'apply'; count: number };

/**
 * Empty / missing / junk month → empty.
 * No live rows in that `YYYY-MM` → empty (never apply 0).
 * Live rows in that month → apply with how many sessions, not days.
 * Start-from fold is ignored.
 */
export function decideMonthSessionCount(input: {
  monthKey?: unknown;
  history?: readonly CompletedWorkoutLog[] | null;
  startFrom?: string | null;
}): MonthSessionCountDecision {
  void input.startFrom;
  if (!isLocalMonthKey(input.monthKey)) return { kind: 'empty' };
  const monthKey = input.monthKey;
  const facts = monthLiveFacts(input.history, input.startFrom);
  let count = 0;
  for (const [dateKey, fact] of facts) {
    if (dateKey.startsWith(monthKey)) count += fact.sessions;
  }
  if (count < 1) return { kind: 'empty' };
  return { kind: 'apply', count };
}
