/**
 * Resume last — Train chip (`.1112`).
 *
 * History has a finished session and today has no logged sets: offer the
 * prior exercise list with last weights. Those numbers are a starting point.
 * The set row can change them. Empty invents nothing. The tone line does not scold.
 */

import type { ActiveWorkout, CompletedWorkoutLog, WorkoutExerciseTemplate } from '@/types';
import { workingSets } from '@/lib/workout/setMath';
import { stripOrphanGroups } from '@/lib/workout/superset';

export const RESUME_LAST_CHIP_LABEL = 'Resume last';
export const RESUME_LAST_SAME_LABEL = 'Same as last time';
export const RESUME_LAST_TONE = 'Session 2 — lock the habit';

const GUILT =
  /\b(streak|shame|guilt|missed|behind|failed|don't break|do not break|you slipped)\b/i;

export type ResumeLastPrefill = {
  name: string;
  exercises: WorkoutExerciseTemplate[];
  /** Last loads are editable set-row numbers, never a lock. */
  weightsEditable: true;
};

export type ResumeLastOffer =
  | { show: false }
  | {
      show: true;
      label: typeof RESUME_LAST_CHIP_LABEL;
      sameLabel: typeof RESUME_LAST_SAME_LABEL;
      tone: typeof RESUME_LAST_TONE;
      prefill: ResumeLastPrefill;
    };

type ActiveLike = {
  exercises?: { sets?: { completed?: boolean }[] }[];
} | null | undefined;

/** Same line as `hasLoggedWork`: a completed set is in progress. */
export function sessionHasLoggedWork(active: ActiveLike): boolean {
  if (!active?.exercises) return false;
  return active.exercises.some((ex) => (ex.sets ?? []).some((s) => s.completed === true));
}

export function resumeLastCopyIsCalm(): boolean {
  const copy = `${RESUME_LAST_CHIP_LABEL} ${RESUME_LAST_SAME_LABEL} ${RESUME_LAST_TONE}`;
  return !GUILT.test(copy);
}

/**
 * Newest viable log → template. Warmup-only and tombstones invent nothing.
 * Reps stay the logged count. Weight stays the logged load, including 0.
 */
export function prefillFromPriorSession(
  log: Pick<CompletedWorkoutLog, 'workoutName' | 'exercises' | 'deletedAt'> | null | undefined
): ResumeLastPrefill | null {
  if (!log || log.deletedAt) return null;
  if (!log.exercises?.length) return null;

  const exercises: WorkoutExerciseTemplate[] = [];
  for (const ex of log.exercises) {
    if (!ex.exerciseId) continue;
    const sets = workingSets(ex.sets ?? [])
      .map((s) => ({
        reps: typeof s.reps === 'number' && s.reps > 0 ? s.reps : 0,
        weight: typeof s.weight === 'number' && s.weight >= 0 ? s.weight : 0,
      }))
      .filter((s) => s.reps > 0);
    if (sets.length === 0) continue;
    exercises.push({
      exerciseId: ex.exerciseId,
      sets,
      ...(ex.supersetGroup?.trim() ? { supersetGroup: ex.supersetGroup.trim() } : {}),
    });
  }

  const kept = stripOrphanGroups(exercises);
  if (kept.length === 0) return null;
  const name = (log.workoutName || 'Session').trim() || 'Session';
  return { name, exercises: kept, weightsEditable: true };
}

function completedAtMs(log: CompletedWorkoutLog): number {
  const at = Date.parse(log.completedAt);
  return Number.isFinite(at) ? at : -Infinity;
}

/** Newest finished log that can prefill. Array order is not the clock. */
export function newestPrefillableSession(
  history: readonly CompletedWorkoutLog[] | null | undefined
): ResumeLastPrefill | null {
  if (!history?.length) return null;
  let best: ResumeLastPrefill | null = null;
  let bestAt = -Infinity;
  for (const log of history) {
    const prefill = prefillFromPriorSession(log);
    if (!prefill) continue;
    const at = completedAtMs(log);
    if (at >= bestAt) {
      best = prefill;
      bestAt = at;
    }
  }
  return best;
}

/**
 * Show the chip when a prefill exists and this session has no logged set.
 * `todayKey` is required so a caller cannot skip the day the athlete is on.
 * Logged work from any day still open is in progress — do not replace it.
 */
export function decideResumeLast(opts: {
  history: readonly CompletedWorkoutLog[] | null | undefined;
  active: ActiveLike;
  todayKey: string;
}): ResumeLastOffer {
  if (!opts.todayKey) return { show: false };
  if (sessionHasLoggedWork(opts.active)) return { show: false };
  const prefill = newestPrefillableSession(opts.history);
  if (!prefill) return { show: false };
  return {
    show: true,
    label: RESUME_LAST_CHIP_LABEL,
    sameLabel: RESUME_LAST_SAME_LABEL,
    tone: RESUME_LAST_TONE,
    prefill,
  };
}

/**
 * Replace an unlogged live session with the prefill. Logged work returns null.
 * No live session returns null — the store starts one instead of inventing ids.
 */
export function nextActiveFromResumeLast(
  active: ActiveWorkout | null | undefined,
  prefill: ResumeLastPrefill | null | undefined
): ActiveWorkout | null {
  if (!active || !prefill?.exercises.length || prefill.weightsEditable !== true) return null;
  if (sessionHasLoggedWork(active)) return null;
  const now = Date.now();
  return {
    ...active,
    workoutName: prefill.name,
    exercises: prefill.exercises.map((ex, i) => ({
      exerciseId: ex.exerciseId,
      sets: ex.sets.map((s, j) => ({
        id: `resume-${now}-${i}-${j}`,
        reps: s.reps,
        weight: s.weight,
        completed: false as const,
      })),
      ...(ex.supersetGroup?.trim() ? { supersetGroup: ex.supersetGroup.trim() } : {}),
    })),
  };
}
