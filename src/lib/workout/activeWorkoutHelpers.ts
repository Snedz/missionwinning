/**
 * Pure helpers for the active workout logger (no React / store).
 * Consumers: ActiveWorkoutPage, unit tests.
 */
import type { CompletedWorkoutLog } from '@/types';
import { repRangeForGoal } from '@/lib/coach/progression';
import { suggestNextSetTarget } from '@/lib/workout/nextSetTargets';
import {
  buildOverloadCue,
  formatOverloadSetLine,
  overloadReasonDefault,
  overloadReasonKey,
} from '@/lib/workout/progressiveOverloadCue';

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
 * Most recent completed set before `setIdx` in this exercise (same session).
 * Hevy/Strong gym-speed: the next dial starts where you just left off — not a
 * second copy of last session's set 2 while set 1 of *today* is already logged.
 * Null when nothing earlier in this exercise is completed.
 */
export function priorCompletedInExercise(
  sets: { completed: boolean; reps: number; weight: number }[],
  setIdx: number
): { reps: number; weight: number } | null {
  for (let i = setIdx - 1; i >= 0; i--) {
    const s = sets[i];
    if (s?.completed) return { reps: s.reps, weight: s.weight };
  }
  return null;
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
 *  3. Same-session carry — prior completed set of this exercise (gym speed, `.289`).
 *  4. The suggestion engine, for freestyle work, inside the athlete's goal range.
 *  5. The same set last time, then the template default.
 */
export function resolveSetInput(params: {
  manual?: { reps: number; weight: number };
  prescribed?: boolean;
  defaultReps: number;
  defaultWeight: number;
  /** Same-session prior completed set of this exercise (freestyle only). */
  sessionCarry?: { reps: number; weight: number } | null;
  suggestion?: { reps: number; weight: number } | null;
  lastPerformance?: { reps: number; weight: number } | null;
}): { reps: number; weight: number } {
  const {
    manual,
    prescribed,
    defaultReps,
    defaultWeight,
    sessionCarry,
    suggestion,
    lastPerformance,
  } = params;
  if (manual) return manual;
  if (prescribed) return { reps: defaultReps, weight: defaultWeight };
  if (sessionCarry) return { reps: sessionCarry.reps, weight: sessionCarry.weight };
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

/**
 * Swap picker ranking — shared muscle groups first, then locale name order.
 * Extracted from ActiveWorkoutPage so the sort cannot silently invert (Kaizen K5).
 */
export function rankSwapCandidates<T extends { id: string; name: string; muscleGroups: string[] }>(
  catalog: readonly T[],
  current: { id: string; muscleGroups: readonly string[] },
  compareNames: (a: string, b: string) => number
): T[] {
  return [...catalog]
    .filter((e) => e.id !== current.id)
    .sort((a, b) => {
      const aShared = a.muscleGroups.some((m) => current.muscleGroups.includes(m));
      const bShared = b.muscleGroups.some((m) => current.muscleGroups.includes(m));
      if (aShared !== bShared) return aShared ? -1 : 1;
      return compareNames(a.name, b.name);
    });
}

export type ConsoleSetKind = 'normal' | 'warmup' | 'failure' | 'drop';

export type ConsoleSetView = {
  exIdx: number;
  setIdx: number;
  exerciseName: string;
  totalSets: number;
  kind: ConsoleSetKind;
  input: { reps: number; weight: number };
  overloadCue: {
    lastLine: string | null;
    nextLine: string | null;
    reasonLine: string | null;
    nextTarget: { reps: number; weight: number } | null;
  };
};

/**
 * Compact log-console payload for the next incomplete set.
 * Extracted from ActiveWorkoutPage so coach-vs-freestyle + overload cue cannot
 * silently diverge from tests (Kaizen Loop 2 L2 / `.297`).
 */
export function buildConsoleSet(params: {
  exercises: {
    exerciseId: string;
    prescribed?: boolean;
    sets: {
      reps: number;
      weight: number;
      completed: boolean;
      kind?: ConsoleSetKind;
    }[];
  }[];
  nextSet: { exIdx: number; setIdx: number } | null;
  workoutHistory: CompletedWorkoutLog[];
  units: 'metric' | 'imperial';
  goalId: string;
  unitLabel: string;
  bodyweightLabel: string;
  resolveExerciseName: (exerciseId: string) => string;
  resolveInput: (
    exIdx: number,
    setIdx: number,
    defaultReps: number,
    defaultWeight: number
  ) => { reps: number; weight: number };
  translateReason: (key: string, defaultValue: string) => string;
}): ConsoleSetView | null {
  const { exercises, nextSet } = params;
  if (!nextSet) return null;
  const exLog = exercises[nextSet.exIdx];
  if (!exLog) return null;
  const set = exLog.sets[nextSet.setIdx];
  if (!set) return null;

  const last = getLastPerformanceForSet(
    params.workoutHistory,
    exLog.exerciseId,
    nextSet.setIdx
  );
  const lastSets = getLastSessionSets(params.workoutHistory, exLog.exerciseId);
  const range = repRangeForGoal(params.goalId);

  const suggested = exLog.prescribed
    ? { reps: set.reps, weight: set.weight, reason: null as null }
    : lastSets
      ? suggestNextSetTarget(lastSets, nextSet.setIdx, params.units, {
          repMin: range.min,
          repMax: range.max,
        })
      : null;

  const cue = buildOverloadCue({
    last: last ? { reps: last.reps, weight: last.weight } : null,
    next: suggested ? { reps: suggested.reps, weight: suggested.weight } : null,
    reason: suggested && 'reason' in suggested ? suggested.reason : null,
    prescribed: !!exLog.prescribed,
  });

  const reasonKey = overloadReasonKey(cue.reason);
  const reasonLine =
    reasonKey && cue.reason
      ? params.translateReason(reasonKey, overloadReasonDefault(cue.reason) ?? '')
      : null;

  return {
    exIdx: nextSet.exIdx,
    setIdx: nextSet.setIdx,
    exerciseName: params.resolveExerciseName(exLog.exerciseId),
    totalSets: exLog.sets.length,
    kind: set.kind ?? 'normal',
    input: params.resolveInput(nextSet.exIdx, nextSet.setIdx, set.reps, set.weight),
    overloadCue: {
      lastLine: cue.last
        ? formatOverloadSetLine(
            cue.last.reps,
            cue.last.weight,
            params.unitLabel,
            params.bodyweightLabel
          )
        : null,
      nextLine: cue.next
        ? formatOverloadSetLine(
            cue.next.reps,
            cue.next.weight,
            params.unitLabel,
            params.bodyweightLabel
          )
        : null,
      reasonLine: reasonLine || null,
      nextTarget: cue.next
        ? { reps: cue.next.reps, weight: cue.next.weight }
        : null,
    },
  };
}

/**
 * Which incomplete sets get which targets when the athlete taps Apply targets.
 * Prescribed → template numbers; freestyle → suggestion engine in goal range.
 */
export function planApplyTargets(params: {
  prescribed?: boolean;
  sets: { completed: boolean; reps: number; weight: number }[];
  lastSets: { reps: number; weight: number }[] | null;
  units: 'metric' | 'imperial';
  repMin: number;
  repMax: number;
}): { setIdx: number; reps: number; weight: number }[] {
  const out: { setIdx: number; reps: number; weight: number }[] = [];
  if (params.prescribed) {
    params.sets.forEach((set, setIdx) => {
      if (set.completed) return;
      out.push({ setIdx, reps: set.reps, weight: set.weight });
    });
    return out;
  }
  if (!params.lastSets) return out;
  params.sets.forEach((set, setIdx) => {
    if (set.completed) return;
    const target = suggestNextSetTarget(params.lastSets!, setIdx, params.units, {
      repMin: params.repMin,
      repMax: params.repMax,
    });
    if (!target) return;
    out.push({ setIdx, reps: target.reps, weight: target.weight });
  });
  return out;
}

/**
 * What the Active dial shows for one set — prescribed vs freestyle carry vs
 * suggestion. Extracted so the page cannot silently reorder resolveSetInput
 * inputs (Kaizen Loop 3 M3 / `.303`).
 */
export function resolveActiveSetDial(params: {
  manual?: { reps: number; weight: number };
  prescribed?: boolean;
  defaultReps: number;
  defaultWeight: number;
  sets: { completed: boolean; reps: number; weight: number }[];
  setIdx: number;
  lastSets: { reps: number; weight: number }[] | null;
  units: 'metric' | 'imperial';
  repMin: number;
  repMax: number;
  lastPerformance: { reps: number; weight: number } | null;
}): { reps: number; weight: number } {
  const sessionCarry = params.prescribed
    ? null
    : priorCompletedInExercise(params.sets, params.setIdx);
  const suggestion =
    !params.prescribed && params.lastSets
      ? suggestNextSetTarget(params.lastSets, params.setIdx, params.units, {
          repMin: params.repMin,
          repMax: params.repMax,
        })
      : null;
  return resolveSetInput({
    manual: params.manual,
    prescribed: params.prescribed,
    defaultReps: params.defaultReps,
    defaultWeight: params.defaultWeight,
    sessionCarry,
    suggestion,
    lastPerformance: params.lastPerformance,
  });
}

/**
 * Repeat-last on Active: copy the most recent completed set onto the next open
 * slot. Returns null when there is nothing to copy or nowhere to put it.
 */
export function resolveRepeatLastTarget(ex: {
  sets: { completed: boolean; reps: number; weight: number }[];
}): { setIdx: number; reps: number; weight: number } | null {
  const lastCompleted = [...ex.sets].reverse().find((s) => s.completed);
  const nextIdx = ex.sets.findIndex((s) => !s.completed);
  if (!lastCompleted || nextIdx < 0) return null;
  return { setIdx: nextIdx, reps: lastCompleted.reps, weight: lastCompleted.weight };
}

/**
 * Active bottom dock: rest takes the console over; compact freestyle gets
 * LogConsole; desktop set entry stays in the row. Never both docks.
 */
export type ActiveDockMode = 'rest' | 'console' | null;

export function resolveActiveDockMode(params: {
  restTimerActive: boolean;
  hasConsoleSet: boolean;
  isCompact: boolean;
}): ActiveDockMode {
  if (params.restTimerActive) return 'rest';
  if (params.hasConsoleSet && params.isCompact) return 'console';
  return null;
}

/**
 * Form guide sheet props from an exercise id, or null when the catalog has no
 * guide for that id. Keeps the Active page free of an open IIFE in JSX.
 */
export function resolveFormGuideSheet<TExercise extends { id: string; name: string }, TGuide>(params: {
  formGuideId: string | null;
  getExerciseById: (id: string) => TExercise | undefined;
  getFormGuideOrCues: (id: string, opts: { exercise: TExercise | undefined }) => TGuide | null;
}): { exerciseId: string; exerciseName: string; guide: TGuide } | null {
  if (!params.formGuideId) return null;
  const ex = params.getExerciseById(params.formGuideId);
  const guide = params.getFormGuideOrCues(params.formGuideId, { exercise: ex });
  if (!ex || !guide) return null;
  return { exerciseId: ex.id, exerciseName: ex.name, guide };
}

/**
 * After session check-in: offer volume trim only when the athlete completed the
 * strip and readiness landed under the soft threshold.
 */
export function shouldOfferVolumeTrim(params: {
  checkInCompleted: boolean;
  readinessAfter: number;
  threshold?: number;
}): boolean {
  const threshold = params.threshold ?? 40;
  return params.checkInCompleted && params.readinessAfter < threshold;
}

/** Readiness / strain / recovery deltas for Victory “what changed” chrome. */
export type BodyScoreTriple = {
  readiness: number;
  strain: number;
  recovery: number;
};

export function bodyScoreDeltas(
  before: BodyScoreTriple,
  after: BodyScoreTriple
): BodyScoreTriple {
  return {
    readiness: after.readiness - before.readiness,
    strain: after.strain - before.strain,
    recovery: after.recovery - before.recovery,
  };
}

/**
 * Swap sheet candidates only when this exercise owns the open swap UI —
 * keeps the Active map free of an inline empty-array ternary.
 */
export function resolveSwapCandidatesWhenOpen<
  T extends { id: string; name: string; muscleGroups: string[] },
>(params: {
  swapOpenIdx: number | null;
  exIdx: number;
  catalog: T[];
  current: T;
  compareNames: (a: string, b: string) => number;
}): T[] {
  if (params.swapOpenIdx !== params.exIdx) return [];
  return rankSwapCandidates(params.catalog, params.current, params.compareNames);
}

/** Bottom padding so the rest dock does not cover the last exercise card. */
export function activeSessionBottomClass(restTimerActive: boolean): string {
  return restTimerActive ? 'pb-36 md:pb-28' : 'pb-4';
}

/** Show the readiness delta strip only when both scores exist and differ. */
export function shouldShowReadinessDelta(
  before: number | null,
  after: number | null
): boolean {
  return before != null && after != null && after !== before;
}

/** Volume-trim CTA only when the check-in offered it and a coach plan exists. */
export function shouldShowVolumeTrimOffer(
  offerVolumeTrim: boolean,
  hasPlan: boolean
): boolean {
  return offerVolumeTrim && hasPlan;
}
