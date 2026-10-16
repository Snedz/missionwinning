/**
 * Large-history first-paint budget — 2,000 sessions / 40k sets stay fast.
 *
 * Today and History scan helpers must finish in one linear pass (or memoised
 * bests that match brute-force). Seed + measure live in tests so a quadratic
 * regression fails CI instead of a slow phone.
 */

import type { CompletedWorkoutLog } from '@/types';
import { estimateOneRepMax } from '@/lib/benchmarks';
import { computeCareerLine, type CareerLine } from '@/lib/careerLine';
import { listSessionHistoryRows } from '@/lib/history/sessionHistoryList';
import { sumHistoryVolume } from '@/lib/workout/historyVolume';
import { countsTowardPr } from '@/lib/workout/setKind';
import {
  getBestPriorSet,
  type SetPerformance,
} from '@/lib/workout/workoutPr';

/** Card acceptance: seed size. */
export const LARGE_HISTORY_SESSIONS = 2000;
/** 20 sets × 2000 sessions = 40,000 sets. */
export const LARGE_HISTORY_SETS_PER_SESSION = 20;

/**
 * Soft wall-clock budget for the first-paint scan pack on a CI box.
 * Pure O(n) over 40k sets is typically tens of ms; 2s catches accidental O(n²).
 */
export const LARGE_HISTORY_BUDGET_MS = 2000;

const SEED_EXERCISES = [
  'bench-press',
  'squat',
  'deadlift',
  'overhead-press',
  'barbell-row',
] as const;

function dayIso(index: number): { startedAt: string; completedAt: string } {
  // Spread across ~5.5 years so week/day keys vary; UTC noon avoids TZ edges.
  const start = Date.UTC(2021, 0, 1, 12, 0, 0) + index * 86_400_000;
  return {
    startedAt: new Date(start).toISOString(),
    completedAt: new Date(start + 3_600_000).toISOString(),
  };
}

/**
 * Deterministic seed: `sessionCount` live sessions, each with
 * `setsPerSession` performed work sets across a small exercise rotation.
 * Tombstones are not included — callers can splice one in for honesty checks.
 */
export function seedLargeHistory(
  sessionCount: number = LARGE_HISTORY_SESSIONS,
  setsPerSession: number = LARGE_HISTORY_SETS_PER_SESSION
): CompletedWorkoutLog[] {
  const out: CompletedWorkoutLog[] = [];
  for (let i = 0; i < sessionCount; i++) {
    const { startedAt, completedAt } = dayIso(i);
    const exerciseId = SEED_EXERCISES[i % SEED_EXERCISES.length];
    const sets = Array.from({ length: setsPerSession }, (_, s) => ({
      reps: 5 + (s % 5),
      // Climb slowly so a real best exists and e1rm stays in formula range (≤12 reps).
      weight: 40 + (i % 80) + s,
      kind: 'normal' as const,
    }));
    const totalVolume = sets.reduce((n, set) => n + set.reps * set.weight, 0);
    out.push({
      id: `lh-${i}`,
      workoutName: `Session ${i}`,
      startedAt,
      completedAt,
      durationSeconds: 3600,
      totalVolume,
      exercises: [{ exerciseId, sets }],
    });
  }
  // Newest first — matches store order used by History list.
  out.reverse();
  return out;
}

/**
 * One linear pass: best set per exercise by estimated 1RM.
 * Must match `getBestPriorSet(exerciseId, history)` for every exercise present.
 */
export function memoPersonalBests(
  history: readonly CompletedWorkoutLog[]
): Map<string, SetPerformance> {
  const best = new Map<string, SetPerformance>();
  const bestEst = new Map<string, number>();

  for (const log of history) {
    if (!log || log.deletedAt) continue;
    for (const ex of log.exercises ?? []) {
      if (!ex?.exerciseId) continue;
      for (const set of ex.sets ?? []) {
        if (set.weight <= 0 || set.reps <= 0) continue;
        if (!countsTowardPr(set.kind)) continue;
        const est = estimateOneRepMax(set.weight, set.reps);
        if (est <= 0) continue;
        const prev = bestEst.get(ex.exerciseId) ?? 0;
        if (est > prev) {
          bestEst.set(ex.exerciseId, est);
          best.set(ex.exerciseId, { weight: set.weight, reps: set.reps });
        }
      }
    }
  }
  return best;
}

/** Totals Today / History first paint actually need — single pass friendly. */
export type HistoryFirstPaintTotals = {
  sessionCount: number;
  volume: number;
  career: CareerLine;
  bests: Map<string, SetPerformance>;
};

export function computeHistoryFirstPaintTotals(
  history: readonly CompletedWorkoutLog[]
): HistoryFirstPaintTotals {
  const rows = listSessionHistoryRows(history);
  return {
    sessionCount: rows.length,
    volume: sumHistoryVolume(history),
    career: computeCareerLine(history),
    bests: memoPersonalBests(history),
  };
}

export type HistoryBudgetReport = {
  totalMs: number;
  listMs: number;
  careerMs: number;
  volumeMs: number;
  bestsMs: number;
  rowCount: number;
  setCount: number;
  withinBudget: boolean;
};

function countSets(history: readonly CompletedWorkoutLog[]): number {
  let n = 0;
  for (const log of history) {
    if (log.deletedAt) continue;
    for (const ex of log.exercises ?? []) n += ex.sets?.length ?? 0;
  }
  return n;
}

/**
 * Time the first-paint scan pack. Pure CPU — no React, no DOM.
 * Callers assert `withinBudget` and result honesty separately.
 */
export function measureHistoryFirstPaint(
  history: readonly CompletedWorkoutLog[],
  budgetMs: number = LARGE_HISTORY_BUDGET_MS
): HistoryBudgetReport {
  const t0 = performance.now();
  const tList0 = performance.now();
  const rows = listSessionHistoryRows(history);
  const listMs = performance.now() - tList0;

  const tCareer0 = performance.now();
  computeCareerLine(history);
  const careerMs = performance.now() - tCareer0;

  const tVol0 = performance.now();
  sumHistoryVolume(history);
  const volumeMs = performance.now() - tVol0;

  const tBests0 = performance.now();
  memoPersonalBests(history);
  const bestsMs = performance.now() - tBests0;

  const totalMs = performance.now() - t0;
  return {
    totalMs,
    listMs,
    careerMs,
    volumeMs,
    bestsMs,
    rowCount: rows.length,
    setCount: countSets(history),
    withinBudget: totalMs <= budgetMs,
  };
}

/** Brute-force oracle: memo map equals getBestPriorSet for every seeded exercise. */
export function bestsMatchBruteForce(
  history: readonly CompletedWorkoutLog[],
  bests: Map<string, SetPerformance>
): boolean {
  const ids = new Set<string>();
  for (const log of history) {
    if (log.deletedAt) continue;
    for (const ex of log.exercises ?? []) ids.add(ex.exerciseId);
  }
  for (const id of ids) {
    const brute = getBestPriorSet(id, history as CompletedWorkoutLog[]);
    const memo = bests.get(id) ?? null;
    if (brute === null && memo === null) continue;
    if (!brute || !memo) return false;
    if (brute.weight !== memo.weight || brute.reps !== memo.reps) return false;
  }
  return true;
}
