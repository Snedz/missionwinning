/**
 * Active dial — last-session / prev / dial / next-target / logged-line.
 * Pure. No React / store.
 */
import type { CompletedWorkoutLog } from '@/types';
import { lastLiveSessionForExercise } from '@/lib/workout/setRowAdjacency';
import { suggestNextSetTarget } from '@/lib/workout/nextSetTargets';
import { workingSets } from '@/lib/workout/setMath';
import { workingSetIndex } from '@/lib/workout/vsLastSet';
import { resolveLastSetGhost } from '@/lib/workout/lastSetGhost';
import { formatPrevPlusLoadLabel, formatSetLoadLine } from '@/lib/workout/bodyweightLoad';
import { formatSetRowPrev, setRowDurationHold } from '@/lib/workout/setRowType';
import { firstPlannedSetIdx } from '@/lib/workout/activeSessionView';

/** All sets from the most recent *live* session containing this exercise. */
export function getLastSessionSets(
  workoutHistory: CompletedWorkoutLog[],
  exerciseId: string
): CompletedWorkoutLog['exercises'][number]['sets'] | null {
  const log = lastLiveSessionForExercise(workoutHistory, exerciseId);
  if (!log) return null;
  const ex = log.exercises.find((e) => e.exerciseId === exerciseId);
  return ex && ex.sets.length > 0 ? ex.sets : null;
}

/**
 * Previous value for the matching *working* set (warmup excluded).
 * Warmup rows stay quiet. Falls back to the last working set when this
 * session plans more work than last time.
 */
export function getLastPerformanceForSet(
  workoutHistory: CompletedWorkoutLog[],
  exerciseId: string,
  setIdx: number,
  currentSets?: { kind?: string }[]
): { reps: number; weight: number; durationSeconds?: number } | null {
  if (currentSets?.[setIdx]?.kind === 'warmup') return null;
  const sets = getLastSessionSets(workoutHistory, exerciseId);
  if (!sets) return null;
  const lastWorking = workingSets(sets);
  if (lastWorking.length === 0) return null;
  const wi =
    currentSets && currentSets.length > 0
      ? workingSetIndex(currentSets, setIdx)
      : setIdx;
  if (wi === null) return null;
  const match = lastWorking[wi] ?? lastWorking[lastWorking.length - 1];
  const hold = Number(match.durationSeconds);
  return {
    reps: match.reps,
    weight: match.weight,
    ...(Number.isFinite(hold) && hold > 0 ? { durationSeconds: hold } : {}),
  };
}

/**
 * Dial prefill (F-013): last *working* set of this exercise.
 * Reuses the ghost reader so warmup / 0-rep / tombstone stay excluded.
 * Prev column uses `getLastPerformanceForSet` (working-set last-actuals).
 */
export function lastWorkingForDial(
  workoutHistory: CompletedWorkoutLog[],
  exerciseId: string
): { reps: number; weight: number } | null {
  const ghost = resolveLastSetGhost(workoutHistory, exerciseId);
  return ghost ? { reps: ghost.reps, weight: ghost.weight } : null;
}

/** Prev-column labels for the set table — one format, one home (.425). */
export function formatPrevSetLabels(
  workoutHistory: CompletedWorkoutLog[],
  exerciseId: string,
  setCount: number,
  opts?: {
    plusLoad?: boolean;
    bodyweightLabel?: string;
    currentSets?: { kind?: string }[];
    rowType?: import('@/types').SetRowType;
  }
): (string | null)[] {
  return Array.from({ length: setCount }, (_, setIdx) => {
    const last = getLastPerformanceForSet(
      workoutHistory,
      exerciseId,
      setIdx,
      opts?.currentSets
    );
    if (!last) return null;
    if (opts?.rowType) {
      return formatSetRowPrev({
        type: opts.rowType,
        reps: last.reps,
        weight: last.weight,
        durationSeconds: last.durationSeconds,
        bodyweightLabel: opts.bodyweightLabel,
      });
    }
    if (opts?.plusLoad) {
      return formatPrevPlusLoadLabel(last.reps, last.weight, opts.bodyweightLabel ?? 'BW');
    }
    return formatSetRowPrev({
      type: 'weight',
      reps: last.reps,
      weight: last.weight,
      bodyweightLabel: opts?.bodyweightLabel,
    });
  });
}

export function setInputKey(exIdx: number, setIdx: number): string {
  return `${exIdx}-${setIdx}`;
}
/**
 * Most recent completed set before `setIdx` in this exercise (same session).
 * set-table gym-speed: the next dial starts where you just left off — not a
 * second copy of last session's set 2 while set 1 of *today* is already logged.
 * Null when nothing earlier in this exercise is completed.
 */
export function priorCompletedInExercise(
  sets: { completed: boolean; reps: number; weight: number; kind?: string }[],
  setIdx: number
): { reps: number; weight: number } | null {
  for (let i = setIdx - 1; i >= 0; i--) {
    const s = sets[i];
    // Warmups are not the load to carry onto the next work set (compose with F-013).
    if (s?.completed && s.kind !== 'warmup') return { reps: s.reps, weight: s.weight };
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
 * Order (F-013 / `.946`):
 *  1. What the athlete typed. Always wins.
 *  2. The coach's prescription, when this exercise came from a plan.
 *  3. Same-session carry — prior completed *working* set of this exercise (`.289`).
 *  4. Last working set of this exercise (ghost numbers). Not a warmup. Not a bump.
 *  5. Empty `{ 0, 0 }` — no fake 10, no `suggestNextSetTarget` on the dial.
 *
 * `suggestion` stays on the signature so Apply targets / cite callers do not
 * break. The starting dial must not apply a program bump.
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
  void suggestion;
  if (manual) return manual;
  if (prescribed) return { reps: defaultReps, weight: defaultWeight };
  if (sessionCarry) return { reps: sessionCarry.reps, weight: sessionCarry.weight };
  if (lastPerformance) return { reps: lastPerformance.reps, weight: lastPerformance.weight };
  return { reps: 0, weight: 0 };
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
  bodyweightLabel = 'BW',
  plusLoad = false
): string {
  return formatSetLoadLine({
    reps,
    weight,
    unitLabel: weightLabel,
    bodyweightLabel,
    plusLoad,
  });
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
  prevManual?: { reps: number; weight: number; durationSeconds?: number };
  /** What the row currently displays, resolved with the set's own reps/weight. */
  resolved: { reps: number; weight: number; durationSeconds?: number };
  field: 'reps' | 'weight' | 'duration';
  value: number;
}): { reps: number; weight: number; durationSeconds?: number } {
  const { prevManual, resolved, field, value } = params;
  const base = prevManual ?? resolved;
  if (field === 'duration') {
    return {
      reps: base.reps,
      weight: base.weight,
      ...(value > 0 ? { durationSeconds: value } : {}),
    };
  }
  return {
    reps: field === 'reps' ? value : base.reps,
    weight: field === 'weight' ? value : base.weight,
    ...(base.durationSeconds && base.durationSeconds > 0
      ? { durationSeconds: base.durationSeconds }
      : {}),
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
  sets: { completed: boolean; reps: number; weight: number; kind?: string }[];
  setIdx: number;
  lastSets: { reps: number; weight: number }[] | null;
  units: 'metric' | 'imperial';
  repMin: number;
  repMax: number;
  lastPerformance: { reps: number; weight: number } | null;
}): { reps: number; weight: number } {
  void params.lastSets;
  void params.units;
  void params.repMin;
  void params.repMax;
  const currentKind = params.sets[params.setIdx]?.kind;
  if (currentKind === 'warmup') {
    // Ramp weights are on the set itself — last-working / empty-dial must not
    // replace a 40 kg warmup with last week's work set or 0 × 0.
    if (params.manual) return params.manual;
    return { reps: params.defaultReps, weight: params.defaultWeight };
  }
  const sessionCarry = params.prescribed
    ? null
    : priorCompletedInExercise(params.sets, params.setIdx);
  return resolveSetInput({
    manual: params.manual,
    prescribed: params.prescribed,
    defaultReps: params.defaultReps,
    defaultWeight: params.defaultWeight,
    sessionCarry,
    suggestion: null,
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
export type ExerciseNextTarget = {
  reps: number;
  weight: number;
  durationSeconds?: number;
};

/**
 * The "Next: N × W" line for an exercise card.
 *
 * Prescribed sessions echo the coach's own numbers. Freestyle uses last-session
 * progression. A hint that contradicts a prescription is worse than no hint —
 * so prescribed never runs `suggestNextSetTarget`.
 */
export function resolveExerciseNextTarget(params: {
  sets: { reps: number; weight: number; durationSeconds?: number; completed: boolean }[];
  prescribed: boolean | undefined;
  lastSets: { reps: number; weight: number; durationSeconds?: number }[] | null;
  units: Parameters<typeof suggestNextSetTarget>[2];
  goalRange?: { min: number; max: number };
  suggest?: typeof suggestNextSetTarget;
}): ExerciseNextTarget | null {
  const nextPlannedIdx = firstPlannedSetIdx(params.sets);
  if (nextPlannedIdx < 0) return null;
  if (params.prescribed) {
    const set = params.sets[nextPlannedIdx];
    const hold = setRowDurationHold(set);
    return {
      reps: set.reps,
      weight: set.weight,
      ...(hold != null ? { durationSeconds: hold } : {}),
    };
  }
  if (!params.lastSets) return null;
  const lastWork = workingSets(params.lastSets);
  const lastMatch = lastWork[nextPlannedIdx] ?? lastWork[lastWork.length - 1];
  const hold = setRowDurationHold(lastMatch);
  if (hold != null) {
    return {
      reps: lastMatch?.reps ?? 0,
      weight: lastMatch?.weight ?? 0,
      durationSeconds: hold,
    };
  }
  const suggest = params.suggest ?? suggestNextSetTarget;
  return suggest(params.lastSets, nextPlannedIdx, params.units, {
    repMin: params.goalRange?.min,
    repMax: params.goalRange?.max,
  });
}
