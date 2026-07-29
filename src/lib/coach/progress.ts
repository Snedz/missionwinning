/**
 * Per-exercise progress from logged sets — estimated 1RM series, PRs, and plateaus.
 *
 * The debrief needs to say things like *"bench e1RM 102 kg, up 4 kg in six weeks"* and
 * *"third session at this weight with no gain — worth a lighter week or a variation"*.
 * Both sentences are arithmetic over history; neither needs a model, an account, or a
 * network.
 *
 * ## Choices worth knowing
 *
 * **Two formulas, deliberately.** `calcHelpers` already ships Epley and Brzycki. They
 * disagree, and they disagree *predictably*: Brzycki reads lower at high reps, Epley
 * higher. Averaging them hides that. We take **Brzycki at ≤10 reps and Epley above**,
 * which is where each is least wrong, and we cap the rep range entirely — an e1RM
 * extrapolated from a set of 20 is a number about endurance, not strength.
 *
 * **Warmups and failure sets are excluded.** A warmup is not evidence of strength; a
 * set taken past failure has a rep count that no formula was fitted on.
 *
 * **A PR needs to beat the record by more than rounding.** Plates come in 2.5 kg
 * jumps and e1RM is an estimate, so a 0.3 kg "record" is noise dressed as progress.
 * `PR_EPSILON` is what stops the app congratulating someone for arithmetic.
 *
 * Pure and dependency-free: same numbers on web, Android and iOS.
 */

import { brzycki1rm, epley1rm } from '@/lib/calcHelpers';
import type { CompletedWorkoutLog } from '@/types';

/** Above this, the set is testing work capacity, not maximal strength. */
export const MAX_REPS_FOR_E1RM = 12;

/** A record must beat the old one by more than this to count. Below it is noise. */
export const PR_EPSILON = 0.5;

/** Exposures at a lift with no e1RM gain before we call it a plateau. */
export const PLATEAU_EXPOSURES = 4;

export interface E1rmPoint {
  /** UTC yyyy-mm-dd. */
  date: string;
  e1rm: number;
  /** The set that produced it — so the UI can say "from 100 kg × 5". */
  weight: number;
  reps: number;
}

export type PrKind = 'weight' | 'reps' | 'e1rm';

export interface PersonalRecord {
  exerciseId: string;
  kind: PrKind;
  value: number;
  date: string;
  /** What it beat. Null when it is the first entry — a first is not a "record broken". */
  previous: number | null;
}

export interface ExerciseProgress {
  exerciseId: string;
  series: E1rmPoint[];
  best: E1rmPoint | null;
  /** e1RM change across the series, null when there is nothing to compare. */
  deltaKg: number | null;
  /** True when the last PLATEAU_EXPOSURES sessions produced no new best. */
  plateaued: boolean;
}

/**
 * Estimated 1RM for one set, or null when the set cannot support the estimate.
 *
 * Brzycki below 10 reps, Epley above — each in the range where it is least wrong.
 * Both formulas are fitted on sets to near-failure, so this is an estimate about a
 * hard set, not a promise about a max attempt.
 */
export function estimate1rm(weight: number, reps: number): number | null {
  if (!Number.isFinite(weight) || !Number.isFinite(reps)) return null;
  if (weight <= 0 || reps <= 0 || reps > MAX_REPS_FOR_E1RM) return null;
  if (reps === 1) return Math.round(weight * 10) / 10;
  const raw = reps <= 10 ? brzycki1rm(weight, reps) : epley1rm(weight, reps);
  if (!Number.isFinite(raw) || raw <= 0) return null;
  return Math.round(raw * 10) / 10;
}

function utcDay(d: string | Date): string {
  return new Date(d).toISOString().slice(0, 10);
}

/** Sets that count as evidence of strength. */
function isCountable(kind: string | undefined): boolean {
  return kind !== 'warmup' && kind !== 'failure';
}

/**
 * Best e1RM per session for one exercise, oldest first.
 *
 * Per session rather than per set: five sets across one evening are one exposure, and
 * treating each as a data point would make a normal top set look like a five-session
 * winning streak.
 */
export function e1rmSeries(
  history: CompletedWorkoutLog[],
  exerciseId: string
): E1rmPoint[] {
  const bySession = new Map<string, E1rmPoint>();

  for (const log of history) {
    if (log.deletedAt) continue;
    const date = utcDay(log.completedAt);
    for (const ex of log.exercises ?? []) {
      if (ex.exerciseId !== exerciseId) continue;
      for (const set of ex.sets ?? []) {
        if (!isCountable(set.kind)) continue;
        const e1rm = estimate1rm(set.weight, set.reps);
        if (e1rm === null) continue;
        const current = bySession.get(date);
        if (!current || e1rm > current.e1rm) {
          bySession.set(date, { date, e1rm, weight: set.weight, reps: set.reps });
        }
      }
    }
  }

  return [...bySession.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export function exerciseProgress(
  history: CompletedWorkoutLog[],
  exerciseId: string
): ExerciseProgress {
  const series = e1rmSeries(history, exerciseId);

  if (series.length === 0) {
    return { exerciseId, series, best: null, deltaKg: null, plateaued: false };
  }

  let best = series[0];
  for (const p of series) if (p.e1rm > best.e1rm) best = p;

  const deltaKg =
    series.length < 2
      ? null
      : Math.round((series[series.length - 1].e1rm - series[0].e1rm) * 10) / 10;

  // A plateau is "the best is old", not "the last few were equal" — a lifter who
  // beats their record then backs off deliberately is not stalled.
  const exposuresSinceBest = series.length - 1 - series.lastIndexOf(best);
  const plateaued =
    series.length >= PLATEAU_EXPOSURES && exposuresSinceBest >= PLATEAU_EXPOSURES;

  return { exerciseId, series, best, deltaKg, plateaued };
}

/**
 * Records set by one session — what the debrief congratulates.
 *
 * Compared only against sessions *before* this one, so re-opening an old session does
 * not re-award its PRs, and the first ever entry reports `previous: null` rather than
 * claiming a record was broken.
 */
export function personalRecordsFor(
  log: CompletedWorkoutLog,
  history: CompletedWorkoutLog[]
): PersonalRecord[] {
  if (log.deletedAt) return [];
  const date = utcDay(log.completedAt);
  const prior = history.filter((l) => !l.deletedAt && utcDay(l.completedAt) < date);
  const out: PersonalRecord[] = [];

  for (const ex of log.exercises ?? []) {
    let bestWeight = 0;
    let bestReps = 0;
    let bestE1rm = 0;

    for (const set of ex.sets ?? []) {
      if (!isCountable(set.kind)) continue;
      if (set.weight > bestWeight) bestWeight = set.weight;
      if (set.reps > bestReps) bestReps = set.reps;
      const e = estimate1rm(set.weight, set.reps);
      if (e !== null && e > bestE1rm) bestE1rm = e;
    }

    let priorWeight = 0;
    let priorReps = 0;
    let priorE1rm = 0;
    for (const l of prior) {
      for (const pex of l.exercises ?? []) {
        if (pex.exerciseId !== ex.exerciseId) continue;
        for (const set of pex.sets ?? []) {
          if (!isCountable(set.kind)) continue;
          if (set.weight > priorWeight) priorWeight = set.weight;
          if (set.reps > priorReps) priorReps = set.reps;
          const e = estimate1rm(set.weight, set.reps);
          if (e !== null && e > priorE1rm) priorE1rm = e;
        }
      }
    }

    const seenBefore = priorWeight > 0 || priorReps > 0;

    const push = (kind: PrKind, value: number, previous: number) => {
      if (value <= 0) return;
      if (seenBefore && value <= previous + PR_EPSILON) return;
      out.push({
        exerciseId: ex.exerciseId,
        kind,
        value: Math.round(value * 10) / 10,
        date,
        previous: seenBefore ? Math.round(previous * 10) / 10 : null,
      });
    };

    push('weight', bestWeight, priorWeight);
    push('reps', bestReps, priorReps);
    push('e1rm', bestE1rm, priorE1rm);
  }

  return out;
}
