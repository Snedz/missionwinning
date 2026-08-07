/**
 * Post-train continuity suggestions — Super Bundle depth (only MW can do this).
 * Pure: maps last train focus → Move/Mind/Fuel next actions with collection deep-links.
 */

export type ContinuityKind = 'move' | 'mind' | 'fuel';

export type ContinuitySuggestion = {
  kind: ContinuityKind;
  href: string;
  titleKey: string;
  titleDefault: string;
  reasonKey: string;
  reasonDefault: string;
  /** Optional collection id for deep-link honesty tests */
  collectionId?: string;
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

function moveHref(collection: string): string {
  return `/move?collection=${encodeURIComponent(collection)}`;
}

function mindHref(collection: string): string {
  return `/mind?collection=${encodeURIComponent(collection)}`;
}

/**
 * Returns 0–3 suggestions. Empty until the athlete has trained at least once.
 *
 * Priority when trained today:
 * 1. Large protein gap → fuel first
 * 2. Focus-matched move collection deep-link
 * 3. Mind post-train / prep
 */
export function buildContinuitySuggestions(opts: {
  hasTrainHistory: boolean;
  /** Muscle / focus labels from last completed session or coach peek */
  lastFocusGroups?: string[];
  /** True if a train log exists for local today */
  trainedToday?: boolean;
  /**
   * Grams short of protein target today (positive = under target).
   * When ≥ 40g and trained today, fuel is prioritized first.
   */
  proteinGapG?: number;
}): ContinuitySuggestion[] {
  if (!opts.hasTrainHistory) return [];

  const groups = lowerGroups(opts.lastFocusGroups);
  const out: ContinuitySuggestion[] = [];
  const proteinGap =
    typeof opts.proteinGapG === 'number' && Number.isFinite(opts.proteinGapG)
      ? opts.proteinGapG
      : 0;

  const fuel: ContinuitySuggestion = {
    kind: 'fuel',
    href: '/nutrition',
    titleKey: 'continuityFuelProtein',
    titleDefault: 'Log protein',
    reasonKey: 'continuityFuelProteinWhy',
    reasonDefault: 'Fuel the session you just earned.',
  };

  if (opts.trainedToday) {
    if (proteinGap >= 40) {
      out.push({
        ...fuel,
        reasonKey: 'continuityFuelProteinGapWhy',
        reasonDefault: 'You are short on protein today — log a meal when you can.',
      });
    }

    if (isLowerBody(groups)) {
      out.push({
        kind: 'move',
        href: moveHref('recover-after-lower'),
        collectionId: 'recover-after-lower',
        titleKey: 'continuityMovePostLegs',
        titleDefault: 'Post-legs mobility',
        reasonKey: 'continuityMovePostLegsWhy',
        reasonDefault: 'Open hips and quads after lower body work.',
      });
      out.push({
        kind: 'mind',
        href: mindHref('post-train'),
        collectionId: 'post-train',
        titleKey: 'continuityMindDownshift',
        titleDefault: 'Post-training downshift',
        reasonKey: 'continuityMindDownshiftWhy',
        reasonDefault: 'Shift from strain to recovery in a few minutes.',
      });
    } else if (isUpperPush(groups) || isUpperPull(groups)) {
      out.push({
        kind: 'move',
        href: moveHref('shoulders'),
        collectionId: 'shoulders',
        titleKey: 'continuityMoveShoulders',
        titleDefault: 'Shoulders & T-spine',
        reasonKey: 'continuityMoveShouldersWhy',
        reasonDefault: 'Keep pressing and pulling joints happy.',
      });
      out.push({
        kind: 'mind',
        href: mindHref('post-train'),
        collectionId: 'post-train',
        titleKey: 'continuityMindDownshift',
        titleDefault: 'Post-training downshift',
        reasonKey: 'continuityMindDownshiftWhy',
        reasonDefault: 'Shift from strain to recovery in a few minutes.',
      });
    } else {
      out.push({
        kind: 'move',
        href: moveHref('all'),
        collectionId: 'all',
        titleKey: 'continuityMoveRecover',
        titleDefault: 'Recovery mobility',
        reasonKey: 'continuityMoveRecoverWhy',
        reasonDefault: 'A short flow helps the next session feel better.',
      });
      out.push({
        kind: 'mind',
        href: mindHref('post-train'),
        collectionId: 'post-train',
        titleKey: 'continuityMindDownshift',
        titleDefault: 'Post-training downshift',
        reasonKey: 'continuityMindDownshiftWhy',
        reasonDefault: 'Shift from strain to recovery in a few minutes.',
      });
    }

    if (!out.some((x) => x.kind === 'fuel')) {
      out.push(fuel);
    }
  } else {
    // Has history but not trained today — gentle prep, not shame
    out.push({
      kind: 'move',
      href: moveHref('pre-session'),
      collectionId: 'pre-session',
      titleKey: 'continuityMovePrep',
      titleDefault: 'Pre-session prime',
      reasonKey: 'continuityMovePrepWhy',
      reasonDefault: 'Open up before you train — or use it as an active rest day.',
    });
    out.push({
      kind: 'mind',
      href: mindHref('pre-lift'),
      collectionId: 'pre-lift',
      titleKey: 'continuityMindFocus',
      titleDefault: 'Pre-workout focus',
      reasonKey: 'continuityMindFocusWhy',
      reasonDefault: 'Two minutes to clear noise before the first set.',
    });
  }

  // Cap at 3; de-dupe by kind keeping first
  const seen = new Set<ContinuityKind>();
  const deduped: ContinuitySuggestion[] = [];
  for (const s of out) {
    if (seen.has(s.kind)) continue;
    seen.add(s.kind);
    deduped.push(s);
    if (deduped.length >= 3) break;
  }
  return deduped;
}

/**
 * Single best next pillar action (Victory secondary / chips).
 * Silence (null) when nothing true — no filler tourism.
 */
export function pickContinuityNextAction(opts: {
  hasTrainHistory: boolean;
  trainedToday?: boolean;
  lastFocusGroups?: string[];
  proteinGapG?: number;
}): ContinuitySuggestion | null {
  const list = buildContinuitySuggestions(opts);
  return list[0] ?? null;
}
