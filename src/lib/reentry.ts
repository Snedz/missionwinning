/**
 * Coming back after a gap.
 *
 * Excellence criterion 4 is "missed day → re-entry without shame". The failure mode
 * is not a missing feature, it is tone plus size: someone who has been away a week
 * opens Today, sees a broken streak and a full plan they have already failed, and
 * closes the app. So the rules here do two things — say something true and kind, and
 * make the next session visibly smaller than the one they missed.
 *
 * S7 (Horizon W): two or more local calendar days since the last session, Today's
 * Start field shows one quiet line (0.1 beta freeze) and starts the 20-minute
 * version. No streak guilt. Outbound nudges still must not name the absence —
 * that contract lives in `reentryTone.ts`.
 *
 * Pure and dateless by parameter so it is testable.
 */

import type { CompletedWorkoutLog } from '@/types';
import { localDateKey } from '@/lib/time/localDate';

/**
 * Below this, nothing is "missed" — one rest day is part of training.
 * Two local calendar days off is the quiet-line floor (S7).
 */
export const REENTRY_MIN_DAYS = 2;
/** Past this, a plan is not stale, it is gone; treat them as starting fresh. */
export const REENTRY_MAX_DAYS = 90;
/** Working copy for the short session the quiet line names. */
export const REENTRY_SHORT_MINUTES = 20;
/** Never shrink past this — a session with no sets is not a lighter session. */
export const REENTRY_MIN_DOSE = 0.4;
/** When the last log has no usable duration, assume a typical session. */
const USUAL_MINUTES_FALLBACK = 40;

export type ReentryTone = 'none' | 'gap' | 'long-gap' | 'lapsed';

export type ReentryWitness = {
  /** Stored exercise id from the last live log. Not a catalog lookup. */
  exerciseId: string;
};

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
  /** Last stored working set, or null when the log has no set to quote. */
  witness: ReentryWitness | null;
}

const NONE: Reentry = { daysSince: null, tone: 'none', show: false, doseScale: 1, witness: null };

const OFF_WORDS = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
] as const;

/**
 * Most recent non-deleted session as an epoch ms, or null when nothing is logged.
 * Split out so the return channel can send a *date* to the server without sending
 * any of the history it was derived from.
 */
function latestSessionMs(history: CompletedWorkoutLog[]): number | null {
  let latest = -Infinity;
  for (const log of history) {
    if (log.deletedAt) continue;
    const t = new Date(log.completedAt).getTime();
    if (Number.isFinite(t) && t > latest) latest = t;
  }
  return latest === -Infinity ? null : latest;
}

function latestLiveLog(history: CompletedWorkoutLog[]): CompletedWorkoutLog | null {
  let best: CompletedWorkoutLog | null = null;
  let latest = -Infinity;
  for (const log of history) {
    if (log.deletedAt) continue;
    const t = new Date(log.completedAt).getTime();
    if (Number.isFinite(t) && t > latest) {
      latest = t;
      best = log;
    }
  }
  return best;
}

/**
 * Local calendar days from `earlierMs` to `nowMs`.
 *
 * Elapsed 24h blocks are the wrong unit for "two days off": Monday evening to
 * Wednesday morning is two calendar days and about 34 hours. Built from local
 * Y-M-D, never `toISOString()`.
 */
function localCalendarDaysBetween(earlierMs: number, nowMs: number): number {
  const from = localDateKey(new Date(earlierMs));
  const to = localDateKey(new Date(nowMs));
  const [y1, m1, d1] = from.split('-').map(Number);
  const [y2, m2, d2] = to.split('-').map(Number);
  if (!y1 || !m1 || !d1 || !y2 || !m2 || !d2) {
    return Math.max(0, Math.floor((nowMs - earlierMs) / 86_400_000));
  }
  const a = new Date(y1, m1 - 1, d1).getTime();
  const b = new Date(y2, m2 - 1, d2).getTime();
  return Math.max(0, Math.round((b - a) / 86_400_000));
}

function usualSessionMinutes(history: CompletedWorkoutLog[]): number {
  const log = latestLiveLog(history);
  if (!log) return USUAL_MINUTES_FALLBACK;
  const secs = log.durationSeconds;
  if (Number.isFinite(secs) && secs >= 60) return Math.max(1, Math.round(secs / 60));
  let sets = 0;
  for (const ex of log.exercises ?? []) sets += ex.sets?.length ?? 0;
  if (sets > 0) return Math.max(REENTRY_SHORT_MINUTES, Math.round(sets * 2.5));
  return USUAL_MINUTES_FALLBACK;
}

/**
 * ISO timestamp of the last session — the single field the server is allowed to hold
 * about what the athlete did. Sets, exercises and volume never leave the device.
 */
export function lastSessionAt(history: CompletedWorkoutLog[]): string | null {
  const ms = latestSessionMs(history);
  return ms === null ? null : new Date(ms).toISOString();
}

/** First stored set on the latest live log. No catalog lookup, no inferred load. */
export function witnessedSetFromHistory(history: CompletedWorkoutLog[]): ReentryWitness | null {
  const log = latestLiveLog(history);
  if (!log) return null;
  for (const ex of log.exercises ?? []) {
    if (ex.exerciseId && (ex.sets?.length ?? 0) > 0) {
      return { exerciseId: ex.exerciseId };
    }
  }
  return null;
}

export function daysSinceLastSession(
  history: CompletedWorkoutLog[],
  now: number
): number | null {
  const latest = latestSessionMs(history);
  if (latest === null) return null;
  return localCalendarDaysBetween(latest, now);
}

/** Scale toward the named short session; never grow the ask. */
export function doseScaleForShortSession(
  usualMinutes: number,
  targetMinutes = REENTRY_SHORT_MINUTES
): number {
  if (!(usualMinutes > 0) || !(targetMinutes > 0)) return 0.5;
  if (usualMinutes <= targetMinutes) return 1;
  return Math.max(REENTRY_MIN_DOSE, Math.min(1, targetMinutes / usualMinutes));
}

export function computeReentry(history: CompletedWorkoutLog[], now: number): Reentry {
  const daysSince = daysSinceLastSession(history, now);
  const witness = witnessedSetFromHistory(history);
  // Never logged: that is onboarding, not re-entry — I-Day owns that story.
  if (daysSince === null) return NONE;
  if (daysSince < REENTRY_MIN_DAYS) return { ...NONE, daysSince, witness };
  const doseScale = doseScaleForShortSession(usualSessionMinutes(history));
  if (daysSince > REENTRY_MAX_DAYS) {
    // Long enough that pretending to continue a plan would be a lie.
    return { daysSince, tone: 'lapsed', show: true, doseScale, witness };
  }
  if (daysSince >= 14) return { daysSince, tone: 'long-gap', show: true, doseScale, witness };
  return { daysSince, tone: 'gap', show: true, doseScale, witness };
}

/**
 * "Two days off" / "11 days off" — factual, not a verdict. Words through ten so
 * the S7 example line is the one athletes actually see.
 */
export function formatReentryOffSpan(daysSince: number): string {
  const n = Math.max(0, Math.floor(daysSince));
  if (n === 1) return 'One day off';
  if (n >= 2 && n <= 10) return `${OFF_WORDS[n]} days off`;
  return `${n} days off`;
}

/**
 * The working Today line. H-03: the subject is the last stored set, never the gap.
 * A line that cannot quote a stored set does not invent one or name the absence.
 */
export function formatReentryQuietLine(
  reentry: Pick<Reentry, 'daysSince' | 'tone'> & { witness?: ReentryWitness | null }
): string {
  const minutes = REENTRY_SHORT_MINUTES;
  const id = reentry.witness?.exerciseId;
  if (id) return `Back from ${id}. Here's the ${minutes}-minute version.`;
  return `Here's the ${minutes}-minute version.`;
}

/** Set count for the first session back — always at least one set, never more than usual. */
export function easedSetCount(usual: number, doseScale: number): number {
  if (usual <= 1) return usual;
  return Math.max(1, Math.min(usual, Math.round(usual * doseScale)));
}

/**
 * Apply re-entry dose to a planned exercise list (Just Go or coach day).
 * Trims trailing planned sets so the first session back is finishable.
 * Pure — no React; unit-tested.
 */
export function scaleExercisesByDose<
  T extends { sets: unknown[] },
>(exercises: T[], doseScale: number): T[] {
  if (!(doseScale > 0) || doseScale >= 1) return exercises;
  return exercises.map((ex) => {
    const n = easedSetCount(ex.sets.length, doseScale);
    if (n >= ex.sets.length) return ex;
    return { ...ex, sets: ex.sets.slice(0, n) };
  });
}

/** Percent label for UI (70, 50) — never invents precision beyond the scale. */
export function doseScalePercent(doseScale: number): number {
  return Math.round(Math.min(1, Math.max(0, doseScale)) * 100);
}
