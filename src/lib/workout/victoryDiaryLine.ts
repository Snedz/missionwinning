/**
 * One-line Victory diary (`.1114`).
 *
 * Optional. Local. Empty is a valid save. The line never gates Finish or Next.
 */

export const VICTORY_DIARY_MAX = 120;

/** Collapse newlines, trim, cap. Non-strings are empty. Empty stays empty. */
export function normalizeVictoryDiaryLine(value: unknown): string {
  if (typeof value !== 'string') return '';
  const one = value.replace(/[\r\n]+/g, ' ').replace(/[ \t]+/g, ' ').trim();
  if (!one) return '';
  return one.length > VICTORY_DIARY_MAX ? one.slice(0, VICTORY_DIARY_MAX) : one;
}

/** The diary is never a save condition. Empty, long, or filled all return false. */
export function victoryDiaryBlocksSave(_line: unknown): boolean {
  return false;
}
