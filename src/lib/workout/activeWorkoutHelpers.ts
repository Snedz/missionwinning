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

/**
 * True when any exercise was prescribed by Mission Coach (Today Just Go coach
 * path or plan-session load). Active chrome + apply-targets must agree.
 */
export function sessionIsCoachPrescribed(
  exercises: { prescribed?: boolean }[]
): boolean {
  return exercises.some((ex) => ex.prescribed === true);
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

/**
 * How a completed set reads in the list.
 *
 * Bodyweight work is stored as `weight: 0` (no bar). Showing `8 × 0 kg` after
 * the first Just Go set made the logger look broken — print BW instead.
 */
export function formatLoggedSetLine(
  reps: number,
  weight: number,
  weightLabel: string,
  bodyweightLabel = 'BW'
): string {
  if (!Number.isFinite(weight) || weight <= 0) {
    return `${reps} × ${bodyweightLabel}`;
  }
  return `${reps} × ${weight} ${weightLabel}`;
}

/**
 * Editing one field must not invent the other.
 *
 * `.206` — `updateSetInput` rebuilt the whole `{reps, weight}` pair on every
 * keystroke from `getSetInput(exIdx, setIdx, 10, 0)`. For a **prescribed**
 * exercise `resolveSetInput` returns those defaults verbatim, so:
 *
 *     coach prescribes bench 3×5 @ 100kg
 *     athlete taps reps + once, meaning 6
 *     stored input becomes { reps: 6, weight: 0 }
 *     the set logs 6 × 0kg
 *
 * Zero volume on a prescribed lift, and it poisons `getLastSessionSets` and
 * `suggestNextSetTarget` for the next session — the athlete's next prescription
 * is computed from a set they never did. Every other `getSetInput` call site
 * passes `set.reps, set.weight`; this one alone passed `10, 0`, which is why the
 * console *displayed* the prescription correctly right up until it was edited.
 *
 * The second half is the base. `updateSetInput` read `setInputs` from the render
 * closure rather than the updater's `prev`, so "Apply targets" — which fires two
 * synchronous calls per set — had its reps clobbered by its own weight call. A
 * 3×5 prescription prefilled as **10 reps**, which is verbatim the `.175` bug
 * the surrounding comment says was fixed.
 *
 * Written as a function rather than inline so a test can hold its output: the
 * defect is a *shape* (which base, which field survives), and `.196` is the
 * standing reminder that a rule spelled as a shape can only be checked as one.
 */
export function nextSetInput(params: {
  /** The athlete's own earlier edit, from the updater's `prev` — never a closure. */
  prevManual?: { reps: number; weight: number };
  /** What the row currently displays, resolved with the set's own reps/weight. */
  resolved: { reps: number; weight: number };
  field: 'reps' | 'weight';
  value: number;
}): { reps: number; weight: number } {
  const { prevManual, resolved, field, value } = params;
  const base = prevManual ?? resolved;
  return { reps: base.reps, weight: base.weight, [field]: value };
}
