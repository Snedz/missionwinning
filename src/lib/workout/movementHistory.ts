/**
 * This-movement history — prior sessions of one lift (`.993`).
 *
 * Vs-last / next-set cite already show last. This list is the rest of
 * their diary when they tap the open lift. Empty invents nothing.
 * Short list stays a notebook (honesty `.971`). Not a chart. Not a Feed.
 */

import type { CompletedWorkoutLog, SetRowType } from '@/types';
import { localDateKeyFromIso } from '@/lib/time/localDate';
import { hasUsableWorkingSet } from '@/lib/workout/setRowAdjacency';
import { formatSetRowPrev, setRowHasWork } from '@/lib/workout/setRowType';

export type MovementHistorySet = {
  reps: number;
  weight: number;
  durationSeconds?: number;
};

export type MovementHistoryRow = {
  sessionId: string;
  completedAt: string;
  workoutName: string;
  /** Local YYYY-MM-DD, or '' when the ISO is unusable — never invent a day. */
  dateKey: string;
  sets: MovementHistorySet[];
};

/** 1–2 sessions of this lift stay a notebook. No slope / streak from that. */
export const SHORT_MOVEMENT_HISTORY_MAX = 2;

export function isShortMovementHistory(rows: readonly MovementHistoryRow[]): boolean {
  return rows.length <= SHORT_MOVEMENT_HISTORY_MAX;
}

function workingSetsForLift(
  sets: CompletedWorkoutLog['exercises'][number]['sets']
): MovementHistorySet[] {
  const out: MovementHistorySet[] = [];
  for (const s of sets) {
    if (!setRowHasWork(s)) continue;
    out.push({
      reps: s.reps,
      weight: s.weight,
      ...(s.durationSeconds && s.durationSeconds > 0
        ? { durationSeconds: s.durationSeconds }
        : {}),
    });
  }
  return out;
}

/**
 * Newest-first (store order) live sessions that logged this lift.
 * Tombstones, warmup-only, and 0-rep-only are not sessions.
 */
export function listMovementHistory(
  history: readonly CompletedWorkoutLog[],
  exerciseId: string
): MovementHistoryRow[] {
  if (!exerciseId) return [];
  const rows: MovementHistoryRow[] = [];
  for (const log of history) {
    if (log.deletedAt) continue;
    const ex = log.exercises.find((e) => e.exerciseId === exerciseId);
    if (!ex || !hasUsableWorkingSet(ex.sets)) continue;
    const sets = workingSetsForLift(ex.sets);
    if (!sets.length) continue;
    rows.push({
      sessionId: log.id,
      completedAt: log.completedAt,
      workoutName: log.workoutName,
      dateKey: localDateKeyFromIso(log.completedAt),
      sets,
    });
  }
  return rows;
}

/** Prev-shaped join — one home for the sheet line. Speaks the open-row type. */
export function formatMovementHistorySets(
  sets: readonly MovementHistorySet[],
  type: SetRowType = 'weight'
): string {
  return sets
    .map((s) =>
      formatSetRowPrev({
        type,
        reps: s.reps,
        weight: s.weight,
        durationSeconds: s.durationSeconds,
      })
    )
    .join(' · ');
}
