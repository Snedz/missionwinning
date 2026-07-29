/**
 * Pure helpers for the active workout logger (no React / store).
 * Consumers: ActiveWorkoutPage, unit tests.
 */
import type { CompletedWorkoutLog } from '@/types';

/** First incomplete set across the active session, or null when all done. */
export function findNextSet(exercises: { sets: { completed: boolean }[] }[]): {
  exIdx: number;
  setIdx: number;
} | null {
  for (let exIdx = 0; exIdx < exercises.length; exIdx++) {
    const setIdx = exercises[exIdx].sets.findIndex((s) => !s.completed);
    if (setIdx >= 0) return { exIdx, setIdx };
  }
  return null;
}

/** All sets from the most recent session containing this exercise. */
export function getLastSessionSets(
  workoutHistory: CompletedWorkoutLog[],
  exerciseId: string
): CompletedWorkoutLog['exercises'][number]['sets'] | null {
  for (const log of workoutHistory) {
    const ex = log.exercises.find((e) => e.exerciseId === exerciseId);
    if (ex && ex.sets.length > 0) return ex.sets;
  }
  return null;
}

/**
 * Previous value for the matching set index (Strong/Hevy-style), falling back
 * to the last set when this session plans more sets than last time.
 */
export function getLastPerformanceForSet(
  workoutHistory: CompletedWorkoutLog[],
  exerciseId: string,
  setIdx: number
): { reps: number; weight: number } | null {
  const sets = getLastSessionSets(workoutHistory, exerciseId);
  if (!sets) return null;
  const match = sets[setIdx] ?? sets[sets.length - 1];
  return { reps: match.reps, weight: match.weight };
}

export function setInputKey(exIdx: number, setIdx: number): string {
  return `${exIdx}-${setIdx}`;
}

/** Count completed sets, planned sets, and hard RPE logs for coach copy. */
export function sessionSetStats(
  exercises: { sets: { completed: boolean; rpe?: string }[] }[]
): { completed: number; total: number; hardCount: number } {
  let completed = 0;
  let total = 0;
  let hardCount = 0;
  for (const ex of exercises) {
    total += ex.sets.length;
    for (const s of ex.sets) {
      if (s.completed) {
        completed++;
        if (s.rpe === 'hard') hardCount++;
      }
    }
  }
  return { completed, total, hardCount };
}

/**
 * What the reps/weight fields start at for one set — the decision, extracted so it
 * can be tested.
 *
 * This ordering is the fix at the heart of `.175`. It used to live inline in
 * `ActiveWorkoutPage` with the plan's prescription *last*, behind
 * `suggestNextSetTarget` — an engine that assumed 8–12 reps for every athlete, reads
 * no RPE, and has no concept of a deload. A strength plan of 3×5 prefilled as 6, and
 * on a back-off week the coach said "×0.9" while the logger quietly said "add a rep".
 *
 * Order:
 *  1. What the athlete typed. Always wins.
 *  2. The coach's prescription, when this exercise came from a plan.
 *  3. The suggestion engine, for freestyle work, inside the athlete's goal range.
 *  4. The same set last time, then the template default.
 */
export function resolveSetInput(params: {
  manual?: { reps: number; weight: number };
  prescribed?: boolean;
  defaultReps: number;
  defaultWeight: number;
  suggestion?: { reps: number; weight: number } | null;
  lastPerformance?: { reps: number; weight: number } | null;
}): { reps: number; weight: number } {
  const { manual, prescribed, defaultReps, defaultWeight, suggestion, lastPerformance } = params;
  if (manual) return manual;
  if (prescribed) return { reps: defaultReps, weight: defaultWeight };
  if (suggestion) return { reps: suggestion.reps, weight: suggestion.weight };
  if (lastPerformance) return { reps: lastPerformance.reps, weight: lastPerformance.weight };
  return { reps: defaultReps, weight: defaultWeight };
}
