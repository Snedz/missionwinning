/**
 * Active session view — next-set, open-idx, progress, post-session path.
 * Pure. No React / store.
 */
/** First incomplete set across the active session, or null when all done. */
export function findNextSet(
  exercises: { sets: { completed: boolean }[]; skippedThisSession?: boolean }[]
): {
  exIdx: number;
  setIdx: number;
} | null {
  for (let exIdx = 0; exIdx < exercises.length; exIdx++) {
    if (exercises[exIdx].skippedThisSession) continue;
    const setIdx = exercises[exIdx].sets.findIndex((s) => !s.completed);
    if (setIdx >= 0) return { exIdx, setIdx };
  }
  return null;
}
/**
 * True when any exercise was prescribed by Mission Coach (Today Just Go coach
 * path or plan-session load). Active chrome + apply-targets must agree.
 */
export function sessionIsCoachPrescribed(
  exercises: { prescribed?: boolean }[]
): boolean {
  return exercises.some((ex) => ex.prescribed === true);
}

/** Count completed sets, planned sets, and hard RPE logs for coach copy. */
export function sessionSetStats(
  exercises: { sets: { completed: boolean; rpe?: string }[] }[]
): { completed: number; total: number; hardCount: number } {
  let completed = 0;
  let total = 0;
  let hardCount = 0;
  for (const ex of exercises) {
    total += ex.sets.length;
    for (const s of ex.sets) {
      if (s.completed) {
        completed++;
        if (s.rpe === 'hard') hardCount++;
      }
    }
  }
  return { completed, total, hardCount };
}
/** Readiness / strain / recovery deltas for Victory “what changed” chrome. */
export type BodyScoreTriple = {
  readiness: number;
  strain: number;
  recovery: number;
};

export function bodyScoreDeltas(
  before: BodyScoreTriple,
  after: BodyScoreTriple
): BodyScoreTriple {
  return {
    readiness: after.readiness - before.readiness,
    strain: after.strain - before.strain,
    recovery: after.recovery - before.recovery,
  };
}
/** Bottom padding so the rest dock does not cover the last exercise card. */
export function activeSessionBottomClass(restTimerActive: boolean): string {
  return restTimerActive ? 'pb-36 md:pb-28' : 'pb-4';
}
/**
 * Active logger goal id — same resolution as coach/contextBuilder so suggestions
 * and plan prescriptions share one goal.
 */
export function resolveActiveGoalId(params: {
  primaryGoal: string | null;
  goals: string | null;
  parseGoalPresetId: (raw: string) => string | null;
  fallback?: string;
}): string {
  const fallback = params.fallback ?? 'general';
  return (
    params.parseGoalPresetId(params.primaryGoal ?? params.goals ?? 'goal:general') ??
    fallback
  );
}

/** True when the active session has at least one exercise to log. */
export function activeSessionHasExercises(exercises: { length: number } | null | undefined): boolean {
  return (exercises?.length ?? 0) > 0;
}

/** Where Victory / discard send the athlete after the session. */
export type ActivePostSessionPath = '/log' | '/history';

export function activePostSessionPath(kind: 'today' | 'history'): ActivePostSessionPath {
  return kind === 'history' ? '/history' : '/log';
}

/** Percent complete for the Active session sets meter (0–100). */
export function sessionSetsProgressPct(completedSets: number, totalSets: number): number {
  if (totalSets <= 0) return 0;
  return Math.round((completedSets / totalSets) * 100);
}

/**
 * Active session coach tip band — hard sets stacking above the threshold get
 * the high-effort note; otherwise the default rate-your-set cue.
 */
export type ActiveCoachTipKind = 'high' | 'default';

export function activeCoachTipKind(
  hardCount: number,
  threshold = 2
): ActiveCoachTipKind {
  return hardCount > threshold ? 'high' : 'default';
}

/**
 * Accordion-style open index: open `idx` when closed / another row open;
 * close when `idx` is already open.
 */
export function toggleOpenIdx(
  current: number | null,
  idx: number
): number | null {
  return current === idx ? null : idx;
}

/** True when accordion/sheet open-index matches this row. */
export function isOpenIdx(current: number | null, idx: number): boolean {
  return current === idx;
}

/** True when any set on this exercise has been logged this session. */
export function exerciseHasCompletedSet(
  sets: { completed: boolean }[]
): boolean {
  return sets.some((s) => s.completed);
}

/**
 * H-15: later lifts stay off the board until the first set of this session
 * is logged. Current + earlier cards stay. After any completed set, all lifts
 * are visible again.
 */
export function laterLiftVisible(
  exercises: { sets: { completed: boolean }[]; skippedThisSession?: boolean }[],
  exIdx: number
): boolean {
  if (exercises[exIdx]?.skippedThisSession) return true;
  if (exercises.some((ex) => exerciseHasCompletedSet(ex.sets))) return true;
  const current = findNextSet(exercises)?.exIdx ?? 0;
  return exIdx <= current;
}

/** True when any set on this exercise is still open to log. */
export function exerciseHasPlannedSet(
  sets: { completed: boolean }[]
): boolean {
  return sets.some((s) => !s.completed);
}

/** Index of the first incomplete set, or -1 when all done. */
export function firstPlannedSetIdx(
  sets: { completed: boolean }[]
): number {
  return sets.findIndex((s) => !s.completed);
}

/** True when this exercise owns the session's next open set. */
export function holdsActiveExercise(
  nextSet: { exIdx: number } | null | undefined,
  exIdx: number
): boolean {
  return nextSet?.exIdx === exIdx;
}

/** True when this set cell is the session's next open set. */
export function isActiveSetCell(
  nextSet: { exIdx: number; setIdx: number } | null | undefined,
  exIdx: number,
  setIdx: number
): boolean {
  return nextSet?.exIdx === exIdx && nextSet?.setIdx === setIdx;
}

/** Active set index for this exercise, or -1 when another exercise is next. */
export function activeSetIdxForExercise(
  nextSet: { exIdx: number; setIdx: number } | null | undefined,
  exIdx: number
): number {
  return nextSet?.exIdx === exIdx ? nextSet.setIdx : -1;
}
