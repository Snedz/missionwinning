/**
 * Victory top lifts vs the previous session of the same template name (`.1112`).
 *
 * Shape-based receipt stays on `victoryReceipt`. This row is the name: Push
 * compares to the last Push, not to a Pull that happened to share a lift.
 * Up is green. Even or down is amber. A first time on that name is neither —
 * no shame-red.
 */

import type { CompletedWorkoutLog } from '@/types';
import { getExerciseById } from '@/data/exercises';
import { countsTowardVolume } from '@/lib/workout/setKind';

export const TOP_LIFT_LIMIT = 3;

export type LiftDeltaTone = 'up' | 'flat' | 'first';

export type TopLiftDelta = {
  exerciseId: string;
  name: string;
  volume: number;
  priorVolume: number | null;
  /** Null when this name, or this lift on that name, has no prior. */
  delta: number | null;
  tone: LiftDeltaTone;
};

export function templateKey(name: string | undefined | null): string {
  return (name ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Load × reps when loaded. Reps alone when the bar is empty. Warmup skipped. */
export function liftVolume(
  sets: readonly { reps?: number; weight?: number; kind?: string }[] | null | undefined
): number {
  let total = 0;
  for (const set of sets ?? []) {
    if (!countsTowardVolume(set.kind as 'normal' | 'warmup' | 'failure' | 'drop' | undefined)) {
      continue;
    }
    const reps = typeof set.reps === 'number' && set.reps > 0 ? set.reps : 0;
    if (reps <= 0) continue;
    const weight = typeof set.weight === 'number' && set.weight > 0 ? set.weight : 0;
    total += weight > 0 ? weight * reps : reps;
  }
  return total;
}

export function liftDeltaTone(delta: number | null): LiftDeltaTone {
  if (delta == null || !Number.isFinite(delta)) return 'first';
  if (delta > 0) return 'up';
  return 'flat';
}

/** Green for up, amber for even or down. First time has no status color. */
export function liftDeltaClass(tone: LiftDeltaTone): string {
  if (tone === 'up') return 'text-status-ok';
  if (tone === 'flat') return 'text-status-warn';
  return '';
}

export function formatLiftDelta(delta: number): string {
  const rounded = Math.round(delta * 10) / 10;
  const abs = Math.abs(rounded);
  const body = Number.isInteger(abs) ? String(abs) : abs.toFixed(1);
  if (rounded > 0) return `+${body}`;
  if (rounded < 0) return `−${body}`;
  return '0';
}

function liftName(exerciseId: string): string {
  return getExerciseById(exerciseId)?.name ?? exerciseId;
}

function isEarlier(candidate: CompletedWorkoutLog, current: CompletedWorkoutLog): boolean {
  if (candidate.deletedAt) return false;
  if (candidate.id === current.id) return false;
  const a = Date.parse(candidate.completedAt);
  const b = Date.parse(current.completedAt);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
  return a < b;
}

/** Last earlier log with the same workout name. A different name is not last time. */
export function pickPriorSameTemplate(
  current: Pick<CompletedWorkoutLog, 'id' | 'workoutName' | 'completedAt' | 'deletedAt'>,
  history: readonly CompletedWorkoutLog[] | null | undefined
): CompletedWorkoutLog | null {
  const key = templateKey(current.workoutName);
  if (!key || current.deletedAt) return null;
  let best: CompletedWorkoutLog | null = null;
  let bestAt = -Infinity;
  for (const log of history ?? []) {
    if (templateKey(log.workoutName) !== key) continue;
    if (!isEarlier(log, current as CompletedWorkoutLog)) continue;
    const at = Date.parse(log.completedAt);
    if (at >= bestAt) {
      best = log;
      bestAt = at;
    }
  }
  return best;
}

function volumeByExercise(
  log: Pick<CompletedWorkoutLog, 'exercises'> | null | undefined
): Map<string, number> {
  const map = new Map<string, number>();
  for (const ex of log?.exercises ?? []) {
    if (!ex.exerciseId) continue;
    const vol = liftVolume(ex.sets);
    if (vol <= 0) continue;
    map.set(ex.exerciseId, (map.get(ex.exerciseId) ?? 0) + vol);
  }
  return map;
}

/**
 * Top lifts in this session by volume, each against the same lift on the
 * previous same-name session. No prior name, or a new lift, is `first`.
 */
export function topLiftDeltas(
  current: CompletedWorkoutLog | null | undefined,
  history: readonly CompletedWorkoutLog[] | null | undefined,
  limit = TOP_LIFT_LIMIT
): TopLiftDelta[] {
  if (!current || current.deletedAt) return [];
  const mine = volumeByExercise(current);
  if (mine.size === 0) return [];
  const prior = pickPriorSameTemplate(current, history);
  const theirs = volumeByExercise(prior);
  const ranked = [...mine.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  return ranked.slice(0, Math.max(0, limit)).map(([exerciseId, volume]) => {
    const priorVolume = prior && theirs.has(exerciseId) ? theirs.get(exerciseId)! : null;
    const delta = priorVolume == null ? null : volume - priorVolume;
    return {
      exerciseId,
      name: liftName(exerciseId),
      volume,
      priorVolume,
      delta,
      tone: liftDeltaTone(delta),
    };
  });
}
