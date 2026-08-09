/**
 * The career line — what an athlete has actually done, since they started.
 *
 * The Athlete Page needs one block that is never empty for someone who has
 * trained even once, because `zero-state.spec.ts` forbids a headed void and D8
 * forbids a screen that explains nothing. Mission Score is a weekly grade that
 * resets and rewards XP is a separate economy; neither answers *"what have I
 * done"*. This does, from `workoutHistory` alone — no new storage, no new sync,
 * nothing to keep in step.
 *
 * Everything here is a **count of logged work**, which is the same clinical
 * register [CLUB_PLAN.md](../../docs/CLUB_PLAN.md) uses to reconcile an odometer
 * with "clinical metrics, not gamification". No 0–100 judgment, no grade.
 *
 * Two rules this file exists to obey rather than restate:
 *
 *   - **Tombstones are not history.** A log with `deletedAt` was deleted by the
 *     athlete on some device; counting it would resurrect it in a number.
 *     `benchmarks.ts` and `dayReview.ts` both skip them and this must agree, or
 *     the same session is gone from History and present in the career total.
 *   - **Dates come from `localDateKeyFromIso`, never `toISOString().slice(0,10)`.**
 *     The second shipped a wrong shared week east of UTC once already; a "days
 *     trained" count built on it would be wrong by one for a whole timezone band.
 */

import type { CompletedWorkoutLog } from '@/types';
import { localDateKeyFromIso, localWeekKey } from '@/lib/time/localDate';

export interface CareerLine {
  /** Completed sessions, tombstones excluded. */
  sessions: number;
  /** Σ reps × weight across every set, in whatever unit the athlete logged. */
  tonnage: number;
  /** How many different exercises they have touched. */
  distinctExercises: number;
  /** Most sessions inside a single local week. */
  bestWeek: number;
  /** Distinct local dates with at least one session — never more than `sessions`. */
  daysTrained: number;
  /** Local date key of the first session, or `null` before there is one. */
  firstSessionOn: string | null;
}

export const EMPTY_CAREER_LINE: CareerLine = {
  sessions: 0,
  tonnage: 0,
  distinctExercises: 0,
  bestWeek: 0,
  daysTrained: 0,
  firstSessionOn: null,
};

/**
 * Pure, single pass, defensive about shape.
 *
 * A log that has synced from another device may be missing `exercises` or carry a
 * set with a non-finite weight; the athlete still trained. Skipping the whole
 * session because one number is malformed would under-count the one thing this
 * block promises to count honestly, so bad values contribute zero and the
 * session still counts.
 */
export function computeCareerLine(history: readonly CompletedWorkoutLog[]): CareerLine {
  const exercises = new Set<string>();
  const days = new Set<string>();
  const weeks = new Map<string, number>();
  let sessions = 0;
  let tonnage = 0;
  let firstSessionOn: string | null = null;

  for (const log of history) {
    if (!log || log.deletedAt) continue;
    if (typeof log.completedAt !== 'string' || !log.completedAt) continue;

    const day = localDateKeyFromIso(log.completedAt);
    if (!day) continue;

    sessions += 1;
    days.add(day);
    if (firstSessionOn === null || day < firstSessionOn) firstSessionOn = day;

    const week = localWeekKey(new Date(log.completedAt));
    weeks.set(week, (weeks.get(week) ?? 0) + 1);

    for (const entry of log.exercises ?? []) {
      if (entry?.exerciseId) exercises.add(entry.exerciseId);
      for (const set of entry?.sets ?? []) {
        const reps = Number(set?.reps);
        const weight = Number(set?.weight);
        if (Number.isFinite(reps) && Number.isFinite(weight) && reps > 0 && weight > 0) {
          tonnage += reps * weight;
        }
      }
    }
  }

  return {
    sessions,
    tonnage: Math.round(tonnage),
    distinctExercises: exercises.size,
    bestWeek: weeks.size ? Math.max(...weeks.values()) : 0,
    daysTrained: days.size,
    firstSessionOn,
  };
}

/** Has this athlete done enough for the career block to say anything at all? */
export function hasCareer(line: CareerLine): boolean {
  return line.sessions > 0;
}

/**
 * The signature line on the Athlete Page — derived counts only, never rank/XP.
 *
 * S2.5 (You composition): the identity block needs one sentence that is present
 * after a single session so the page reads as a person, not a stack of empty
 * shelves. Callers format with i18n; this returns the numbers only so locales
 * never re-derive which fields belong on the line.
 */
export type CareerSignature = {
  sessions: number;
  bestWeek: number;
  daysTrained: number;
  distinctExercises: number;
};

export function careerSignature(line: CareerLine): CareerSignature | null {
  if (!hasCareer(line)) return null;
  return {
    sessions: line.sessions,
    bestWeek: line.bestWeek,
    daysTrained: line.daysTrained,
    distinctExercises: line.distinctExercises,
  };
}
