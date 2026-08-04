/**
 * Today header focus line — show gate + optional bodyweight tag (.430).
 * Localization stays in the shell (`formatRecommendedFocusLine` + t()).
 */

export function buildTodayHeaderFocusLine(opts: {
  showFocusLine: boolean;
  focusLineBase: string;
  equipment: string;
  bodyweightTag: string;
}): string | null {
  if (!opts.showFocusLine) return null;
  if (opts.equipment === 'bodyweight') {
    return `${opts.focusLineBase} · ${opts.bodyweightTag}`;
  }
  return opts.focusLineBase;
}
