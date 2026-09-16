/**
 * Active menu gates — shouldShow* menuitems / chips / skip / volume-trim.
 * Pure. No React / store.
 */
/**
 * After session check-in: offer volume trim only when the athlete completed the
 * strip and readiness landed under the soft threshold.
 */
export function shouldOfferVolumeTrim(params: {
  checkInCompleted: boolean;
  readinessAfter: number;
  threshold?: number;
}): boolean {
  const threshold = params.threshold ?? 40;
  return params.checkInCompleted && params.readinessAfter < threshold;
}
/** Show the readiness delta strip only when both scores exist and differ. */
export function shouldShowReadinessDelta(
  before: number | null,
  after: number | null
): boolean {
  return before != null && after != null && after !== before;
}

/** Volume-trim CTA only when the check-in offered it and a coach plan exists. */
export function shouldShowVolumeTrimOffer(
  offerVolumeTrim: boolean,
  hasPlan: boolean
): boolean {
  return offerVolumeTrim && hasPlan;
}
/**
 * Whether the Set options footer control should render — Apply targets and/or
 * Remove set only make sense with history or more than one planned set.
 */
export function shouldShowSetOptionsFooter(params: {
  hasLastSets: boolean;
  hasPlanned: boolean;
  plannedSetCount: number;
}): boolean {
  return (
    (params.hasLastSets && params.hasPlanned) ||
    (params.hasPlanned && params.plannedSetCount > 1)
  );
}

/** Apply targets menuitem — needs last-session sets and open planned work. */
export function shouldShowApplyTargetsMenuitem(
  hasLastSets: boolean,
  hasPlanned: boolean
): boolean {
  return hasLastSets && hasPlanned;
}

/** Remove set menuitem — only when more than one planned set remains. */
export function shouldShowRemoveSetMenuitem(
  hasPlanned: boolean,
  plannedSetCount: number
): boolean {
  return hasPlanned && plannedSetCount > 1;
}

/** True when any set on this exercise carries a logged weight (> 0). */
export function exerciseHasWeightedSet(
  sets: { weight: number }[]
): boolean {
  return sets.some((s) => s.weight > 0);
}

/** First positive weight on this exercise, or 0 when none. */
export function firstWeightedLoad(sets: { weight: number }[]): number {
  return sets.find((s) => s.weight > 0)?.weight ?? 0;
}

/**
 * Whether the %1RM chip belongs on the exercise header.
 * Needs a positive loadPct and at least one weighted set (BW work hides it).
 */
export function shouldShowLoadPctChip(
  loadPct: number | null | undefined,
  sets: { weight: number }[]
): boolean {
  return loadPct != null && loadPct > 0 && exerciseHasWeightedSet(sets);
}

/** Superset-with-next when the next lift exists and is not already in this group. */
export function shouldShowSupersetLinkMenuitem(
  hasNextExercise: boolean,
  nextAlreadyInThisGroup = false
): boolean {
  return hasNextExercise && !nextAlreadyInThisGroup;
}

/** Swap this session — another movement, not only a garage stand-in (`.959`). */
export function shouldShowExerciseSwapMenuitem(
  hasCompletedSet: boolean,
  _optionCount = 0,
  skippedThisSession = false
): boolean {
  return !hasCompletedSet && !skippedThisSession;
}

/** Skip this exercise once, this session — not a fail and not a discard. */
export function shouldShowSessionSkip(params: {
  skippedThisSession?: boolean;
}): boolean {
  return !params.skippedThisSession;
}
