/**
 * Resume last completed — Train chip (`.1112`).
 *
 * Not `sessionResume.ts`. That file keeps the open session on this device
 * (`.963`). This chip copies the newest finished log in `workoutHistory`
 * through `templateFromCompletedLog` and starts that list unlogged.
 * Weights stay editable. Empty invents nothing. The tone line does not scold.
 */

import type { ActiveWorkout, CompletedWorkoutLog, WorkoutExerciseTemplate } from '@/types';
import { templateFromCompletedLog } from '@/lib/workout/historyRetrain';

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
 * One finished log → start template. Warmup-only and tombstones invent nothing.
 * Structure comes from `templateFromCompletedLog` (same lift ids, working sets,
 * last loads). This does not restore an open session.
 */
export function prefillFromPriorSession(
  log: Pick<CompletedWorkoutLog, 'workoutName' | 'exercises' | 'deletedAt'> | null | undefined
): ResumeLastPrefill | null {
  if (!log) return null;
  const template = templateFromCompletedLog(log);
  if (!template) return null;
  return { name: template.name, exercises: template.exercises, weightsEditable: true };
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
