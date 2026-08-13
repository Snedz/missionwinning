/**
 * Victory vs-last receipt — what Hevy's logged-out workout page is for: the
 * session you just did, against the last time, from logs already on the device.
 *
 * Instant, offline, free. No account, no feed, no share-to-unlock. Numbers come
 * from `CompletedWorkoutLog` history the logger already wrote.
 *
 * ## Same sitting, two sessions
 *
 * `personalRecordsFor` keys prior sessions on UTC *day*, so a second log later
 * the same afternoon cannot beat the morning. The receipt is the post-finish
 * ritual for exactly that sitting, so prior means `completedAt` strictly
 * earlier — timestamp, not calendar day. Debrief copy stays on its own clock.
 *
 * ## What "last time" means
 *
 * - Session totals (volume / sets / duration): last earlier log with the same
 *   workout name. A Push does not compare to a random Cardio.
 * - Per lift: last earlier log that actually contains that exercise — even if
 *   the session name differs. Bench vs last bench is the honest row.
 *
 * A first session is still a receipt: the sets you logged, with no invented
 * zeros and no PR for a first-ever (same rule as the debrief).
 */

import type { CompletedWorkoutLog, SetKind } from '@/types';
import { getExerciseById } from '@/data/exercises';
import { estimate1rm, PR_EPSILON, type PrKind } from '@/lib/coach/progress';
import { countsTowardStrengthEstimate } from '@/lib/workout/setKind';

export type VictoryReceiptPr = {
  kind: PrKind;
  value: number;
  /** Beaten value — never null; first-ever is not a record broken. */
  previous: number;
};

export type VictoryReceiptSet = {
  setIndex: number;
  reps: number;
  weight: number;
  kind?: SetKind;
  priorReps: number | null;
  priorWeight: number | null;
  isPr: boolean;
};

export type VictoryExerciseReceipt = {
  exerciseId: string;
  exerciseName: string;
  note?: string;
  sets: VictoryReceiptSet[];
  prs: VictoryReceiptPr[];
};

export type VictorySessionCompare = {
  volumeDelta: number;
  setCountDelta: number;
  durationDelta: number;
};

export type VictoryReceipt = {
  /** Null when no earlier same-named session exists. */
  vsLast: VictorySessionCompare | null;
  exercises: VictoryExerciseReceipt[];
  /** Beaten records only (previous exists). */
  prCount: number;
};

export function isPriorLog(
  candidate: CompletedWorkoutLog,
  current: CompletedWorkoutLog
): boolean {
  if (candidate.deletedAt) return false;
  if (candidate.id === current.id) return false;
  const a = Date.parse(candidate.completedAt);
  const b = Date.parse(current.completedAt);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
  return a < b;
}

function normName(name: string | undefined): string {
  return (name ?? '').trim().toLowerCase();
}

function setCount(log: CompletedWorkoutLog): number {
  return log.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
}

/** Last earlier session with the same workout name. */
export function pickPriorSameNamedSession(
  current: CompletedWorkoutLog,
  history: CompletedWorkoutLog[]
): CompletedWorkoutLog | null {
  const name = normName(current.workoutName);
  if (!name) return null;
  let best: CompletedWorkoutLog | null = null;
  let bestAt = -Infinity;
  for (const log of history) {
    if (!isPriorLog(log, current)) continue;
    if (normName(log.workoutName) !== name) continue;
    const at = Date.parse(log.completedAt);
    if (at > bestAt) {
      best = log;
      bestAt = at;
    }
  }
  return best;
}

/** Last earlier session that logged this exercise. */
export function pickPriorExerciseLog(
  current: CompletedWorkoutLog,
  history: CompletedWorkoutLog[],
  exerciseId: string
): CompletedWorkoutLog | null {
  let best: CompletedWorkoutLog | null = null;
  let bestAt = -Infinity;
  for (const log of history) {
    if (!isPriorLog(log, current)) continue;
    const has = log.exercises.some((ex) => ex.exerciseId === exerciseId && ex.sets.length > 0);
    if (!has) continue;
    const at = Date.parse(log.completedAt);
    if (at > bestAt) {
      best = log;
      bestAt = at;
    }
  }
  return best;
}

function roundTenth(n: number): number {
  return Math.round(n * 10) / 10;
}

export function formatReceiptNumber(n: number): string {
  const r = roundTenth(n);
  return Number.isInteger(r) ? String(r) : r.toFixed(1);
}

/** Load cell: `100 × 5` or `8 reps` when bodyweight. */
export function formatReceiptSetLoad(reps: number, weight: number): string {
  if (weight > 0) return `${formatReceiptNumber(weight)} × ${reps}`;
  return `${reps} reps`;
}

export function formatReceiptSigned(n: number): string {
  const r = roundTenth(n);
  if (r === 0) return '0';
  return r > 0 ? `+${formatReceiptNumber(r)}` : formatReceiptNumber(r);
}

function formatMmSs(seconds: number): string {
  const s = Math.abs(Math.round(seconds));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${rem.toString().padStart(2, '0')}`;
}

/** Signed mm:ss for duration vs-last. */
export function formatReceiptDurationDelta(deltaSeconds: number): string {
  const sign = deltaSeconds > 0 ? '+' : deltaSeconds < 0 ? '-' : '';
  return `${sign}${formatMmSs(deltaSeconds)}`;
}

function countable(kind: string | undefined): boolean {
  return countsTowardStrengthEstimate(kind);
}

function bestsForExercise(sets: CompletedWorkoutLog['exercises'][number]['sets']): {
  weight: number;
  reps: number;
  e1rm: number;
} {
  let weight = 0;
  let reps = 0;
  let e1rm = 0;
  for (const set of sets) {
    if (!countable(set.kind)) continue;
    if (set.weight > weight) weight = set.weight;
    if (set.reps > reps) reps = set.reps;
    const e = estimate1rm(set.weight, set.reps);
    if (e !== null && e > e1rm) e1rm = e;
  }
  return { weight, reps, e1rm };
}

function priorBestsForExercise(
  history: CompletedWorkoutLog[],
  current: CompletedWorkoutLog,
  exerciseId: string
): { weight: number; reps: number; e1rm: number; seen: boolean } {
  let weight = 0;
  let reps = 0;
  let e1rm = 0;
  let seen = false;
  for (const log of history) {
    if (!isPriorLog(log, current)) continue;
    for (const ex of log.exercises) {
      if (ex.exerciseId !== exerciseId) continue;
      for (const set of ex.sets) {
        if (!countable(set.kind)) continue;
        seen = true;
        if (set.weight > weight) weight = set.weight;
        if (set.reps > reps) reps = set.reps;
        const e = estimate1rm(set.weight, set.reps);
        if (e !== null && e > e1rm) e1rm = e;
      }
    }
  }
  return { weight, reps, e1rm, seen };
}

function beatenRecords(
  currentBests: { weight: number; reps: number; e1rm: number },
  prior: { weight: number; reps: number; e1rm: number; seen: boolean }
): VictoryReceiptPr[] {
  if (!prior.seen) return [];
  const out: VictoryReceiptPr[] = [];
  const push = (kind: PrKind, value: number, previous: number) => {
    if (value <= 0) return;
    if (value <= previous + PR_EPSILON) return;
    out.push({
      kind,
      value: roundTenth(value),
      previous: roundTenth(previous),
    });
  };
  push('weight', currentBests.weight, prior.weight);
  push('reps', currentBests.reps, prior.reps);
  push('e1rm', currentBests.e1rm, prior.e1rm);
  return out;
}

function setProducesPr(
  set: { reps: number; weight: number; kind?: SetKind },
  currentBests: { weight: number; reps: number; e1rm: number },
  prs: VictoryReceiptPr[]
): boolean {
  if (!countable(set.kind) || prs.length === 0) return false;
  for (const pr of prs) {
    if (pr.kind === 'weight' && set.weight === currentBests.weight) return true;
    if (pr.kind === 'reps' && set.reps === currentBests.reps) return true;
    if (pr.kind === 'e1rm') {
      const e = estimate1rm(set.weight, set.reps);
      if (e !== null && e === currentBests.e1rm) return true;
    }
  }
  return false;
}

export function buildVictoryReceipt(
  log: CompletedWorkoutLog,
  history: CompletedWorkoutLog[],
  opts?: { resolveName?: (exerciseId: string) => string }
): VictoryReceipt {
  const resolveName =
    opts?.resolveName ??
    ((id: string) => getExerciseById(id)?.name ?? id.replace(/-/g, ' '));

  const priorSession = pickPriorSameNamedSession(log, history);
  const vsLast: VictorySessionCompare | null = priorSession
    ? {
        volumeDelta: log.totalVolume - priorSession.totalVolume,
        setCountDelta: setCount(log) - setCount(priorSession),
        durationDelta: log.durationSeconds - priorSession.durationSeconds,
      }
    : null;

  const exercises: VictoryExerciseReceipt[] = log.exercises.map((ex) => {
    const priorExLog = pickPriorExerciseLog(log, history, ex.exerciseId);
    const priorSets =
      priorExLog?.exercises.find((p) => p.exerciseId === ex.exerciseId)?.sets ?? [];
    const currentBests = bestsForExercise(ex.sets);
    const prior = priorBestsForExercise(history, log, ex.exerciseId);
    const prs = beatenRecords(currentBests, prior);

    const sets: VictoryReceiptSet[] = ex.sets.map((set, setIndex) => {
      // Extra sets this time reuse last-time's last set — same as the logger's
      // Prev column (`getLastPerformanceForSet`). A blank Prev on set 3 when
      // last time was 2 is an unfinished receipt, not honesty.
      const priorSet =
        priorSets.length === 0
          ? undefined
          : (priorSets[setIndex] ?? priorSets[priorSets.length - 1]);
      return {
        setIndex,
        reps: set.reps,
        weight: set.weight,
        kind: set.kind,
        priorReps: priorSet ? priorSet.reps : null,
        priorWeight: priorSet ? priorSet.weight : null,
        isPr: setProducesPr(set, currentBests, prs),
      };
    });

    const receipt: VictoryExerciseReceipt = {
      exerciseId: ex.exerciseId,
      exerciseName: resolveName(ex.exerciseId),
      sets,
      prs,
    };
    const note = ex.note?.trim();
    if (note) receipt.note = note;
    return receipt;
  });

  return {
    vsLast,
    exercises,
    prCount: exercises.reduce((sum, ex) => sum + ex.prs.length, 0),
  };
}

/** Weight / reps deltas for one set — omit zeros (nothing happened). */
export function receiptSetDeltas(set: VictoryReceiptSet): {
  weight: number | null;
  reps: number | null;
} {
  if (set.priorReps === null || set.priorWeight === null) {
    return { weight: null, reps: null };
  }
  const weight = roundTenth(set.weight - set.priorWeight);
  const reps = set.reps - set.priorReps;
  return {
    weight: weight === 0 ? null : weight,
    reps: reps === 0 ? null : reps,
  };
}
