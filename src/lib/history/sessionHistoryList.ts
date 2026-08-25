/**
 * The one session-history list — row projection.
 *
 * `/history` Sessions is the list (PLAN.md `.720`). Calendar and day-replay
 * are other surfaces. This module is the scan: date, title, muscles, set count.
 * It does not decide how to open a row (the page opens the log; `.997` can edit;
 * `.1003` can delete one finished session).
 */

import { EXERCISES } from '@/data/exercises';
import { resolveMajorMuscleGroups } from '@/lib/exerciseMuscleMap';
import { MAJOR_GROUPS, type MuscleGroup } from '@/lib/muscleGroups';
import type { CompletedWorkoutLog } from '@/types';

export type SessionHistoryRow = {
  id: string;
  title: string;
  completedAt: string;
  setCount: number;
  muscles: MuscleGroup[];
};

/** Every logged set on the session, including warmup — the count the athlete sees. */
export function sessionSetCount(
  log: Pick<CompletedWorkoutLog, 'exercises'>
): number {
  return log.exercises.reduce((n, ex) => n + ex.sets.length, 0);
}

/**
 * Unique major groups, first-seen order.
 * Stored snapshot first; catalog backfill for logs that predate the snapshot
 * (same priority as `buildMuscleHeatmap`).
 */
export function sessionMuscles(
  log: Pick<CompletedWorkoutLog, 'exercises'>
): MuscleGroup[] {
  const seen = new Set<MuscleGroup>();
  const out: MuscleGroup[] = [];
  for (const ex of log.exercises) {
    const stored = resolveMajorMuscleGroups(ex.exerciseId, ex.muscleGroups);
    const groups = stored.length
      ? stored
      : (EXERCISES.find((e) => e.id === ex.exerciseId)?.muscleGroups ?? []).filter(
          (mg): mg is MuscleGroup => (MAJOR_GROUPS as readonly string[]).includes(mg)
        );
    for (const g of groups) {
      if (seen.has(g)) continue;
      seen.add(g);
      out.push(g);
    }
  }
  return out;
}

/** Null when the log is a tombstone — it must not appear in the list. */
export function toSessionHistoryRow(
  log: CompletedWorkoutLog
): SessionHistoryRow | null {
  if (log.deletedAt) return null;
  return {
    id: log.id,
    title: log.workoutName,
    completedAt: log.completedAt,
    setCount: sessionSetCount(log),
    muscles: sessionMuscles(log),
  };
}

/** Live rows, store order (newest first). Tombstones omitted. */
export function listSessionHistoryRows(
  history: readonly CompletedWorkoutLog[]
): SessionHistoryRow[] {
  const rows: SessionHistoryRow[] = [];
  for (const log of history) {
    const row = toSessionHistoryRow(log);
    if (row) rows.push(row);
  }
  return rows;
}

export function liveSessionLogs(
  history: readonly CompletedWorkoutLog[]
): CompletedWorkoutLog[] {
  return history.filter((log) => !log.deletedAt);
}
