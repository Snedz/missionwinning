/**
 * Live session count on a trained History day (`.1032`).
 *
 * The calendar already has `MonthDay.sessions` from `monthLiveFacts`
 * (tombs out). DayCell still painted one dumbbell for one session or
 * three. This decides whether that count may print.
 *
 * Empty / junk invents nothing. Never invent 1 on a blank / logged /
 * future day. Never count tombs — the caller already dropped them.
 * Does not invent history rows. Pure: no store.
 */

export type DaySessionCountDecision =
  | { kind: 'empty' }
  | { kind: 'apply'; count: number };

function isLiveSessionCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && Number.isInteger(value) && value >= 1;
}

/**
 * Empty when mark is not `'trained'`, or sessions is missing / junk /
 * not a finite integer / `< 1`.
 * Apply when mark is `'trained'` and sessions is a finite integer `≥ 1`.
 */
export function decideDaySessionCount(input: {
  mark?: unknown;
  sessions?: unknown;
}): DaySessionCountDecision {
  if (input.mark !== 'trained' || !isLiveSessionCount(input.sessions)) {
    return { kind: 'empty' };
  }
  return { kind: 'apply', count: input.sessions };
}
