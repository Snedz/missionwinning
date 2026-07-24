/**
 * Coming back after a gap.
 *
 * Excellence criterion 4 is "missed day → re-entry without shame". The failure mode
 * is not a missing feature, it is tone plus size: someone who has been away a week
 * opens Today, sees a broken streak and a full plan they have already failed, and
 * closes the app. So the rules here do two things — say something true and kind, and
 * make the next session visibly smaller than the one they missed.
 *
 * Pure and dateless by parameter so it is testable.
 */

import type { CompletedWorkoutLog } from '@/types';

/** Below this, nothing is "missed" — rest days are part of training. */
export const REENTRY_MIN_DAYS = 4;
/** Past this, a plan is not stale, it is gone; treat them as starting fresh. */
export const REENTRY_MAX_DAYS = 90;

export type ReentryTone = 'none' | 'gap' | 'long-gap' | 'lapsed';

export interface Reentry {
  daysSince: number | null;
  tone: ReentryTone;
  /** Show the calm re-entry surface instead of the normal plan. */
  show: boolean;
  /**
   * Fraction of the usual set count to suggest. Deliberately conservative: the
   * first session back should feel easy enough to finish.
   */
  doseScale: number;
}

const NONE: Reentry = { daysSince: null, tone: 'none', show: false, doseScale: 1 };

export function daysSinceLastSession(
  history: CompletedWorkoutLog[],
  now: number
): number | null {
  let latest = -Infinity;
  for (const log of history) {
    if (log.deletedAt) continue;
    const t = new Date(log.completedAt).getTime();
    if (Number.isFinite(t) && t > latest) latest = t;
  }
  if (latest === -Infinity) return null;
  // Floor, so "yesterday evening to this morning" is 0 days, not 1.
  return Math.max(0, Math.floor((now - latest) / 86_400_000));
}

export function computeReentry(history: CompletedWorkoutLog[], now: number): Reentry {
  const daysSince = daysSinceLastSession(history, now);
  // Never logged: that is onboarding, not re-entry — I-Day owns that story.
  if (daysSince === null) return NONE;
  if (daysSince < REENTRY_MIN_DAYS) return { ...NONE, daysSince };
  if (daysSince > REENTRY_MAX_DAYS) {
    // Long enough that pretending to continue a plan would be a lie.
    return { daysSince, tone: 'lapsed', show: true, doseScale: 0.5 };
  }
  if (daysSince >= 14) return { daysSince, tone: 'long-gap', show: true, doseScale: 0.5 };
  return { daysSince, tone: 'gap', show: true, doseScale: 0.7 };
}

/** Set count for the first session back — always at least one set, never more than usual. */
export function easedSetCount(usual: number, doseScale: number): number {
  if (usual <= 1) return usual;
  return Math.max(1, Math.min(usual, Math.round(usual * doseScale)));
}
