/**
 * Pure helpers for the active workout logger (no React / store).
 * Consumers: ActiveWorkoutPage, unit tests.
 */
import type { CompletedWorkoutLog, SetSide } from '@/types';
import { repRangeForGoal } from '@/lib/coach/progression';
import { lastLiveSessionForExercise } from '@/lib/workout/setRowAdjacency';
import { suggestNextSetTarget } from '@/lib/workout/nextSetTargets';
import { workingSets } from '@/lib/workout/setMath';
import { workingSetIndex } from '@/lib/workout/vsLastSet';
import { resolveLastSetGhost, type LastSetGhost } from '@/lib/workout/lastSetGhost';
import {
  buildOverloadCue,
  formatOverloadSetLine,
  overloadReasonDefault,
  overloadReasonKey,
} from '@/lib/workout/progressiveOverloadCue';
import { isUnilateralExercise, parseSetSide } from '@/lib/workout/unilateral';
import { formatPrevPlusLoadLabel, formatSetLoadLine } from '@/lib/workout/bodyweightLoad';
import { formatSetRowPrev } from '@/lib/workout/setRowType';

/** First incomplete set across the active session, or null when all done. */
export function findNextSet(
  exercises: { sets: { completed: boolean }[]; skippedThisSession?: boolean }[]
): {
  exIdx: number;
  setIdx: number;
} | null {
  for (let exIdx = 0; exIdx < exercises.length; exIdx++) {
    if (exercises[exIdx].skippedThisSession) continue;
    const setIdx = exercises[exIdx].sets.findIndex((s) => !s.completed);
    if (setIdx >= 0) return { exIdx, setIdx };
  }
  return null;
}

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
    return `${last.reps} × ${last.weight}`;
  });
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
  side?: SetSide;
  unilateral: boolean;
  plusLoad: boolean;
  /** True when the catalog equipment loads plates on a bar. */
  barLoaded: boolean;
  input: { reps: number; weight: number };
  /** Last working set (not warmup). Null on first-ever. */
  lastSetGhost: LastSetGhost | null;
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
      side?: SetSide;
    }[];
  }[];
  nextSet: { exIdx: number; setIdx: number } | null;
  workoutHistory: CompletedWorkoutLog[];
  units: 'metric' | 'imperial';
  goalId: string;
  unitLabel: string;
  bodyweightLabel: string;
  resolveExerciseName: (exerciseId: string) => string;
  resolvePlusLoad?: (exerciseId: string) => boolean;
  resolveBarLoaded?: (exerciseId: string) => boolean;
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
    nextSet.setIdx,
    exLog.sets
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
  const plusLoad = params.resolvePlusLoad?.(exLog.exerciseId) === true;

  return {
    exIdx: nextSet.exIdx,
    setIdx: nextSet.setIdx,
    exerciseName: params.resolveExerciseName(exLog.exerciseId),
    totalSets: exLog.sets.length,
    kind: set.kind ?? 'normal',
    side: parseSetSide(set.side),
    unilateral: isUnilateralExercise({
      id: exLog.exerciseId,
      name: params.resolveExerciseName(exLog.exerciseId),
    }),
    plusLoad,
    barLoaded: params.resolveBarLoaded?.(exLog.exerciseId) ?? false,
    input: params.resolveInput(nextSet.exIdx, nextSet.setIdx, set.reps, set.weight),
    lastSetGhost: resolveLastSetGhost(params.workoutHistory, exLog.exerciseId),
    overloadCue: {
      lastLine: cue.last
        ? formatOverloadSetLine(
            cue.last.reps,
            cue.last.weight,
            params.unitLabel,
            params.bodyweightLabel,
            plusLoad
          )
        : null,
      nextLine: cue.next
        ? formatOverloadSetLine(
            cue.next.reps,
            cue.next.weight,
            params.unitLabel,
            params.bodyweightLabel,
            plusLoad
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

/**
 * Active bottom dock: rest takes the dock. Set entry is the table on every
 * surface — never a second console under the rows.
 */
export type ActiveDockMode = 'rest' | 'console' | null;

export function resolveActiveDockMode(params: {
  restTimerActive: boolean;
  hasConsoleSet: boolean;
  isCompact: boolean;
}): ActiveDockMode {
  if (params.restTimerActive) return 'rest';
  void params.hasConsoleSet;
  void params.isCompact;
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

/**
 * Active logger goal id — same resolution as coach/contextBuilder so suggestions
 * and plan prescriptions share one goal.
 */
export function resolveActiveGoalId(params: {
  primaryGoal: string | null;
  goals: string | null;
  parseGoalPresetId: (raw: string) => string | null;
  fallback?: string;
}): string {
  const fallback = params.fallback ?? 'general';
  return (
    params.parseGoalPresetId(params.primaryGoal ?? params.goals ?? 'goal:general') ??
    fallback
  );
}

/** True when the active session has at least one exercise to log. */
export function activeSessionHasExercises(exercises: { length: number } | null | undefined): boolean {
  return (exercises?.length ?? 0) > 0;
}

/** Where Victory / discard send the athlete after the session. */
export type ActivePostSessionPath = '/log' | '/history';

export function activePostSessionPath(kind: 'today' | 'history'): ActivePostSessionPath {
  return kind === 'history' ? '/history' : '/log';
}

/** Percent complete for the Active session sets meter (0–100). */
export function sessionSetsProgressPct(completedSets: number, totalSets: number): number {
  if (totalSets <= 0) return 0;
  return Math.round((completedSets / totalSets) * 100);
}

/**
 * Active session coach tip band — hard sets stacking above the threshold get
 * the high-effort note; otherwise the default rate-your-set cue.
 */
export type ActiveCoachTipKind = 'high' | 'default';

export function activeCoachTipKind(
  hardCount: number,
  threshold = 2
): ActiveCoachTipKind {
  return hardCount > threshold ? 'high' : 'default';
}

/**
 * Accordion-style open index: open `idx` when closed / another row open;
 * close when `idx` is already open.
 */
export function toggleOpenIdx(
  current: number | null,
  idx: number
): number | null {
  return current === idx ? null : idx;
}

/** True when accordion/sheet open-index matches this row. */
export function isOpenIdx(current: number | null, idx: number): boolean {
  return current === idx;
}

/** True when any set on this exercise has been logged this session. */
export function exerciseHasCompletedSet(
  sets: { completed: boolean }[]
): boolean {
  return sets.some((s) => s.completed);
}

/**
 * H-15: later lifts stay off the board until the first set of this session
 * is logged. Current + earlier cards stay. After any completed set, all lifts
 * are visible again.
 */
export function laterLiftVisible(
  exercises: { sets: { completed: boolean }[]; skippedThisSession?: boolean }[],
  exIdx: number
): boolean {
  if (exercises[exIdx]?.skippedThisSession) return true;
  if (exercises.some((ex) => exerciseHasCompletedSet(ex.sets))) return true;
  const current = findNextSet(exercises)?.exIdx ?? 0;
  return exIdx <= current;
}

/** True when any set on this exercise is still open to log. */
export function exerciseHasPlannedSet(
  sets: { completed: boolean }[]
): boolean {
  return sets.some((s) => !s.completed);
}

/** Index of the first incomplete set, or -1 when all done. */
export function firstPlannedSetIdx(
  sets: { completed: boolean }[]
): number {
  return sets.findIndex((s) => !s.completed);
}

/** True when this exercise owns the session's next open set. */
export function holdsActiveExercise(
  nextSet: { exIdx: number } | null | undefined,
  exIdx: number
): boolean {
  return nextSet?.exIdx === exIdx;
}

/** True when this set cell is the session's next open set. */
export function isActiveSetCell(
  nextSet: { exIdx: number; setIdx: number } | null | undefined,
  exIdx: number,
  setIdx: number
): boolean {
  return nextSet?.exIdx === exIdx && nextSet?.setIdx === setIdx;
}

/** Active set index for this exercise, or -1 when another exercise is next. */
export function activeSetIdxForExercise(
  nextSet: { exIdx: number; setIdx: number } | null | undefined,
  exIdx: number
): number {
  return nextSet?.exIdx === exIdx ? nextSet.setIdx : -1;
}

/**
 * Whether the Set options footer control should render — Apply targets and/or
 * Remove set only make sense with history or more than one planned set.
 */
export function shouldShowSetOptionsFooter(params: {
  hasLastSets: boolean;
  hasPlanned: boolean;
  plannedSetCount: number;
}): boolean {
  return (
    (params.hasLastSets && params.hasPlanned) ||
    (params.hasPlanned && params.plannedSetCount > 1)
  );
}

/** Apply targets menuitem — needs last-session sets and open planned work. */
export function shouldShowApplyTargetsMenuitem(
  hasLastSets: boolean,
  hasPlanned: boolean
): boolean {
  return hasLastSets && hasPlanned;
}

/** Remove set menuitem — only when more than one planned set remains. */
export function shouldShowRemoveSetMenuitem(
  hasPlanned: boolean,
  plannedSetCount: number
): boolean {
  return hasPlanned && plannedSetCount > 1;
}

/** True when any set on this exercise carries a logged weight (> 0). */
export function exerciseHasWeightedSet(
  sets: { weight: number }[]
): boolean {
  return sets.some((s) => s.weight > 0);
}

/** First positive weight on this exercise, or 0 when none. */
export function firstWeightedLoad(sets: { weight: number }[]): number {
  return sets.find((s) => s.weight > 0)?.weight ?? 0;
}

/**
 * Whether the %1RM chip belongs on the exercise header.
 * Needs a positive loadPct and at least one weighted set (BW work hides it).
 */
export function shouldShowLoadPctChip(
  loadPct: number | null | undefined,
  sets: { weight: number }[]
): boolean {
  return loadPct != null && loadPct > 0 && exerciseHasWeightedSet(sets);
}

/** Superset-with-next when the next lift exists and is not already in this group. */
export function shouldShowSupersetLinkMenuitem(
  hasNextExercise: boolean,
  nextAlreadyInThisGroup = false
): boolean {
  return hasNextExercise && !nextAlreadyInThisGroup;
}

/** Swap this session — another movement, not only a garage stand-in (`.959`). */
export function shouldShowExerciseSwapMenuitem(
  hasCompletedSet: boolean,
  _optionCount = 0,
  skippedThisSession = false
): boolean {
  return !hasCompletedSet && !skippedThisSession;
}

/** Skip this exercise once, this session — not a fail and not a discard. */
export function shouldShowSessionSkip(params: {
  skippedThisSession?: boolean;
}): boolean {
  return !params.skippedThisSession;
}

export type ExerciseNextTarget = { reps: number; weight: number };

/**
 * The "Next: N × W" line for an exercise card.
 *
 * Prescribed sessions echo the coach's own numbers. Freestyle uses last-session
 * progression. A hint that contradicts a prescription is worse than no hint —
 * so prescribed never runs `suggestNextSetTarget`.
 */
export function resolveExerciseNextTarget(params: {
  sets: { reps: number; weight: number; completed: boolean }[];
  prescribed: boolean | undefined;
  lastSets: { reps: number; weight: number }[] | null;
  units: Parameters<typeof suggestNextSetTarget>[2];
  goalRange?: { min: number; max: number };
  suggest?: typeof suggestNextSetTarget;
}): ExerciseNextTarget | null {
  const nextPlannedIdx = firstPlannedSetIdx(params.sets);
  if (nextPlannedIdx < 0) return null;
  if (params.prescribed) {
    const set = params.sets[nextPlannedIdx];
    return { reps: set.reps, weight: set.weight };
  }
  if (!params.lastSets) return null;
  const suggest = params.suggest ?? suggestNextSetTarget;
  return suggest(params.lastSets, nextPlannedIdx, params.units, {
    repMin: params.goalRange?.min,
    repMax: params.goalRange?.max,
  });
}
