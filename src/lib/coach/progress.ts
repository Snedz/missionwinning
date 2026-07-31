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

import { localDateKey } from '@/lib/time/localDate';
import { countsTowardStrengthEstimate } from '@/lib/workout/setKind';
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
  return localDateKey(new Date(d));
}

/** Sets that count as evidence of strength — one definition, in `setKind.ts` (`.208`). */
function isCountable(kind: string | undefined): boolean {
  return countsTowardStrengthEstimate(kind);
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
 * How many exposures of flat work count as a stall. Three, matching the rule this
 * replaced — long enough not to fire on one ordinary hold, short enough to act before
 * a month is spent.
 */
export const FLAT_EXPOSURES = 3;

export type StallKind = 'none' | 'stalled' | 'plateaued';

export interface StallSignal {
  kind: StallKind;
  /** Exposures since the athlete's best e1RM. Zero when no e1RM exists. */
  exposuresSinceBest: number;
}

/**
 * Best reps per session, oldest first — the bodyweight fallback.
 *
 * `estimate1rm` returns null at zero weight and above 12 reps, so `e1rmSeries` is
 * **empty** for a calisthenics athlete and for anyone training only in high-rep
 * ranges. A stall rule written purely in e1RM would therefore report `none` forever
 * for them: not "no stall detected" but "this athlete is invisible". The rule this
 * function replaced compared raw reps, and dropping that would have been a silent
 * regression for exactly the users the free logger exists to serve.
 */
function bestRepsPerSession(
  history: CompletedWorkoutLog[],
  exerciseId: string
): number[] {
  const bySession = new Map<string, number>();
  for (const log of history) {
    if (log.deletedAt) continue;
    const date = utcDay(log.completedAt);
    for (const ex of log.exercises ?? []) {
      if (ex.exerciseId !== exerciseId) continue;
      for (const set of ex.sets ?? []) {
        if (!isCountable(set.kind)) continue;
        const reps = Number.isFinite(set.reps) ? set.reps : 0;
        const current = bySession.get(date);
        if (current == null || reps > current) bySession.set(date, reps);
      }
    }
  }
  return [...bySession.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([, reps]) => reps);
}

/**
 * The one stall truth.
 *
 * Before this there were two, and they could disagree. `progression.ts` held a private
 * `stalled()` — three sessions whose *first working set* matched on reps **and** weight
 * — while `progress.ts` exported `exerciseProgress().plateaued`, "the best is old",
 * which had **no consumers at all**. So the engine could deload on one definition while
 * the module that owned strength truth considered the athlete fine, and the richer
 * signal was computed and thrown away. `.174` and `.175` were both about the app
 * disagreeing with itself; this is the same defect one layer down.
 *
 * Two kinds, because they answer different questions:
 *
 * - **`stalled`** — the last three exposures went nowhere. Fires the existing deload.
 * - **`plateaued`** — the best is `PLATEAU_EXPOSURES` exposures old, *even if* the
 *   sessions since were not identical. This is the case the old rule could not see: an
 *   athlete wobbling below their record for a month reads as "not stalled" to an
 *   equality check, and got told to add weight.
 *
 * A fresh best then a deliberate back-off is **not** a stall, and that guard is
 * inherited rather than re-derived — `exposuresSinceBest` is the same computation
 * `exerciseProgress` uses.
 *
 * One deliberate widening over the rule it replaces: stall is now judged on **e1RM
 * within `PR_EPSILON`**, not on identical numbers. Per `.174`, `5 × 110` and `8 × 100`
 * both estimate 124 — the same strength expressed two ways — so an athlete alternating
 * between them was stalled in fact and progressing on paper.
 */
export function stallSignal(
  history: CompletedWorkoutLog[],
  exerciseId: string
): StallSignal {
  const series = e1rmSeries(history, exerciseId);

  if (series.length === 0) {
    const reps = bestRepsPerSession(history, exerciseId);
    const flat =
      reps.length >= FLAT_EXPOSURES &&
      reps.slice(-FLAT_EXPOSURES).every((r) => r === reps[reps.length - 1]);
    return { kind: flat ? 'stalled' : 'none', exposuresSinceBest: 0 };
  }

  let best = series[0];
  for (const p of series) if (p.e1rm > best.e1rm) best = p;
  // Ties resolve to the *earliest* occurrence, so repeating a record does not keep
  // resetting the clock. Same computation as `exerciseProgress`, deliberately.
  const exposuresSinceBest = series.length - 1 - series.lastIndexOf(best);

  if (series.length >= PLATEAU_EXPOSURES && exposuresSinceBest >= PLATEAU_EXPOSURES) {
    return { kind: 'plateaued', exposuresSinceBest };
  }

  if (series.length >= FLAT_EXPOSURES && exposuresSinceBest >= FLAT_EXPOSURES - 1) {
    const recent = series.slice(-FLAT_EXPOSURES).map((p) => p.e1rm);
    const spread = Math.max(...recent) - Math.min(...recent);
    if (spread <= PR_EPSILON) return { kind: 'stalled', exposuresSinceBest };
  }

  return { kind: 'none', exposuresSinceBest };
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
