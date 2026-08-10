/**
 * English floors for Coach "why" keys on plan exercises.
 *
 * Same defect class as readiness Today (`.637`): bootstrap / missing pack
 * left `i18n.exists` false, and CoachAdaptBanner painted **nothing** for
 * "Why today's plan" — or raw keys if exists was true without values.
 * Catalog floors match `coachLocales` EN; packs still override via `t`.
 */

export const COACH_WHY_DEFAULTS: Record<string, string> = {
  coachWhyLoadUp: 'Last session felt easy — small load bump.',
  coachWhyRepProgress: 'Building reps before adding weight.',
  coachWhyHold: 'Hold this load until reps feel solid.',
  coachWhyHoldHard: 'Hard sets — hold load and consolidate.',
  coachWhySteadyWeek: 'Big week against your own recent average — holding here.',
  coachWhyPlateauDeload: 'No new best in a month — lighter week to rebuild from.',
  coachWhyDeload: 'Recovery week — lighter load, same patterns.',
  coachWhyRecovery: 'Mobility and activation for better training.',
  coachWhyBodyweightReps: 'Add reps until the set feels challenging.',
  coachFindWorkingWeight: 'Find a weight you could do for 2 more reps.',
  coachWhyConservative: 'Conservative load after an avoid adjustment — quality over ego.',
};

/** Resolve athlete-facing why copy — never blank, never a bare key when catalogued. */
export function coachWhyLine(
  key: string,
  t: (k: string, opts?: Record<string, unknown>) => string
): string {
  const floor = COACH_WHY_DEFAULTS[key];
  if (floor) {
    return t(key, { defaultValue: floor });
  }
  // Unknown key: only show if pack has it; never invent.
  const line = t(key, { defaultValue: '' });
  return line && line !== key ? line : '';
}
