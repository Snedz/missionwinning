/**
 * Post-train continuity suggestions — Super Bundle depth (only MW can do this).
 * Pure: maps last train focus → Move/Mind/Fuel next actions.
 */

export type ContinuityKind = 'move' | 'mind' | 'fuel';

export type ContinuitySuggestion = {
  kind: ContinuityKind;
  href: string;
  titleKey: string;
  titleDefault: string;
  reasonKey: string;
  reasonDefault: string;
};

function lowerGroups(groups: string[] | undefined): string[] {
  return (groups ?? []).map((g) => g.toLowerCase());
}

function isLowerBody(groups: string[]): boolean {
  const keys = ['leg', 'quad', 'ham', 'glute', 'hip', 'calf', 'lower'];
  return groups.some((g) => keys.some((k) => g.includes(k)));
}

function isUpperPush(groups: string[]): boolean {
  const keys = ['chest', 'shoulder', 'tricep', 'press', 'push'];
  return groups.some((g) => keys.some((k) => g.includes(k)));
}

function isUpperPull(groups: string[]): boolean {
  const keys = ['back', 'lat', 'pull', 'row', 'bicep'];
  return groups.some((g) => keys.some((k) => g.includes(k)));
}

/**
 * Returns 0–3 suggestions. Empty until the athlete has trained at least once.
 */
export function buildContinuitySuggestions(opts: {
  hasTrainHistory: boolean;
  /** Muscle / focus labels from last completed session or coach peek */
  lastFocusGroups?: string[];
  /** True if a train log exists for local today */
  trainedToday?: boolean;
}): ContinuitySuggestion[] {
  if (!opts.hasTrainHistory) return [];

  const groups = lowerGroups(opts.lastFocusGroups);
  const out: ContinuitySuggestion[] = [];

  if (opts.trainedToday) {
    if (isLowerBody(groups)) {
      out.push({
        kind: 'move',
        href: '/move',
        titleKey: 'continuityMovePostLegs',
        titleDefault: 'Post-legs mobility',
        reasonKey: 'continuityMovePostLegsWhy',
        reasonDefault: 'Open hips and quads after lower body work.',
      });
      out.push({
        kind: 'mind',
        href: '/mind',
        titleKey: 'continuityMindDownshift',
        titleDefault: 'Post-training downshift',
        reasonKey: 'continuityMindDownshiftWhy',
        reasonDefault: 'Shift from strain to recovery in a few minutes.',
      });
    } else if (isUpperPush(groups) || isUpperPull(groups)) {
      out.push({
        kind: 'move',
        href: '/move',
        titleKey: 'continuityMoveShoulders',
        titleDefault: 'Shoulders & T-spine',
        reasonKey: 'continuityMoveShouldersWhy',
        reasonDefault: 'Keep pressing and pulling joints happy.',
      });
      out.push({
        kind: 'mind',
        href: '/mind',
        titleKey: 'continuityMindDownshift',
        titleDefault: 'Post-training downshift',
        reasonKey: 'continuityMindDownshiftWhy',
        reasonDefault: 'Shift from strain to recovery in a few minutes.',
      });
    } else {
      out.push({
        kind: 'move',
        href: '/move',
        titleKey: 'continuityMoveRecover',
        titleDefault: 'Recovery mobility',
        reasonKey: 'continuityMoveRecoverWhy',
        reasonDefault: 'A short flow helps the next session feel better.',
      });
      out.push({
        kind: 'mind',
        href: '/mind',
        titleKey: 'continuityMindDownshift',
        titleDefault: 'Post-training downshift',
        reasonKey: 'continuityMindDownshiftWhy',
        reasonDefault: 'Shift from strain to recovery in a few minutes.',
      });
    }
    out.push({
      kind: 'fuel',
      href: '/nutrition',
      titleKey: 'continuityFuelProtein',
      titleDefault: 'Log protein',
      reasonKey: 'continuityFuelProteinWhy',
      reasonDefault: 'Fuel the session you just earned.',
    });
  } else {
    // Has history but not trained today — gentle prep, not shame
    out.push({
      kind: 'move',
      href: '/move',
      titleKey: 'continuityMovePrep',
      titleDefault: 'Pre-session prime',
      reasonKey: 'continuityMovePrepWhy',
      reasonDefault: 'Open up before you train — or use it as an active rest day.',
    });
    out.push({
      kind: 'mind',
      href: '/mind',
      titleKey: 'continuityMindFocus',
      titleDefault: 'Pre-workout focus',
      reasonKey: 'continuityMindFocusWhy',
      reasonDefault: 'Two minutes to clear noise before the first set.',
    });
  }

  // Cap at 3
  return out.slice(0, 3);
}
