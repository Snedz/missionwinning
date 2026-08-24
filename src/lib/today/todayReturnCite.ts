/**
 * Quiet last + next cite for Today's Start.
 * Empty history / empty plan invents nothing. Not a Feed.
 */

export type TodayReturnCite = {
  last: string | null;
  next: string | null;
};

export type TodayReturnCiteInput = {
  lastSessionName: string | null | undefined;
  nextSessionName: string | null | undefined;
  /** Missed-day re-entry already occupies the last line. */
  reentryShowing?: boolean;
  /** Planned-miss prompt already occupies the next line. */
  plannedMissShowing?: boolean;
  /** Resume is the cite — do not restack last/next. */
  sessionOpen?: boolean;
};

function cleanName(value: string | null | undefined): string | null {
  const name = value?.trim() || null;
  return name || null;
}

/**
 * Last and next for the Start field. Pure — readers stay outside.
 */
export function todayReturnCite(input: TodayReturnCiteInput): TodayReturnCite {
  if (input.sessionOpen) return { last: null, next: null };
  const last = input.reentryShowing ? null : cleanName(input.lastSessionName);
  const next = input.plannedMissShowing ? null : cleanName(input.nextSessionName);
  return { last, next };
}
