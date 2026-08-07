import type { CompletedWorkoutLog } from '@/types';
import type { UnitsPref } from '@/lib/units';
import { weightStep, weightUnitLabel } from '@/lib/units';
import { suggestNextSetTarget } from '@/lib/workout/nextSetTargets';
import { sessionIsCoachPrescribed } from '@/lib/workout/activeWorkoutHelpers';
import { week1SecondSessionCue } from '@/lib/activation/week1SecondSession';
import { getExerciseById } from '@/data/exercises';

export type VictoryBodyDelta = {
  readiness: number;
  strain: number;
  recovery: number;
};

export type VictoryNextAction = {
  href: string;
  labelKey: string;
  /** English fallback for labelKey */
  defaultLabel: string;
  reasonKey: string;
  defaultReason: string;
};

/**
 * Next-session progression cue after Victory (pure — UI maps reason → i18n).
 * `.290`: structured (not a hard-coded English sentence); includes bodyweight.
 */
export type ProgressionInsight = {
  reason: 'add_weight' | 'add_reps' | 'hold';
  exerciseName: string;
  unit: string;
  /** Stored weight is 0 — BW progress is rep-based. */
  bodyweight: boolean;
  step: number;
  reps: number;
  weight: number;
};

export interface WorkoutVictorySummary {
  workoutName: string;
  totalVolume: number;
  durationSeconds: number;
  setCount: number;
  exerciseCount: number;
  streak: number;
  /** IntervalCoach-style “what changed” from computeBodyScores before/after. */
  bodyDelta?: VictoryBodyDelta;
  /** Forge-style next-session progression (structured for i18n). */
  progressionInsight?: ProgressionInsight;
  /** Single post-workout ritual CTA (S-Tier: one next action). */
  nextAction?: VictoryNextAction;
}

/** Rank working sets: load×reps when loaded; reps alone when bodyweight. */
function workingSetScore(reps: number, weight: number): number {
  return weight > 0 ? weight * reps : reps;
}

/**
 * Build next-session progression from the strongest working set in this log.
 * Pure payload — call `formatProgressionInsight` or UI i18n keys for display.
 *
 * Freestyle sessions use double progression (add reps, then weight). A Coach-
 * prescribed session must not get that language — the plan owns next loads
 * (deload, strength 3×5, etc.), and Victory already points the athlete at
 * Mission Coach. Freestyle "hit top of range" after a coached 5 is a lie.
 *
 * Uses `sessionIsCoachPrescribed` (`.280`) — one definition for Active chrome
 * and Victory. Requires the completed log to still carry `prescribed` (`.410`).
 * Returns undefined for coached sessions (no freestyle next-load cue).
 */
export function buildProgressionInsight(
  log: CompletedWorkoutLog,
  units: UnitsPref,
  /** The athlete's goal range; omitted falls back to the generic 8-12. */
  repRange?: { min: number; max: number }
): ProgressionInsight | undefined {
  if (sessionIsCoachPrescribed(log.exercises)) {
    return undefined;
  }

  let best: { exerciseId: string; reps: number; weight: number } | null = null;
  for (const ex of log.exercises) {
    for (const set of ex.sets) {
      if (set.kind === 'warmup') continue;
      if (!Number.isFinite(set.reps) || set.reps <= 0) continue;
      const weight = Number.isFinite(set.weight) ? set.weight : 0;
      if (
        !best ||
        workingSetScore(set.reps, weight) > workingSetScore(best.reps, best.weight)
      ) {
        best = { exerciseId: ex.exerciseId, reps: set.reps, weight };
      }
    }
  }
  if (!best) return undefined;

  const target = suggestNextSetTarget(
    [{ reps: best.reps, weight: best.weight }],
    0,
    units,
    { repMin: repRange?.min, repMax: repRange?.max }
  );
  if (!target) return undefined;

  const name = getExerciseById(best.exerciseId)?.name ?? 'Next lift';
  const unit = weightUnitLabel(units);
  const step = weightStep(units);
  const bodyweight = best.weight <= 0;
  const reason =
    target.reason === 'add_weight'
      ? ('add_weight' as const)
      : target.reason === 'add_reps'
        ? ('add_reps' as const)
        : ('hold' as const);

  return {
    reason,
    exerciseName: name,
    unit,
    bodyweight,
    step,
    reps: target.reps,
    weight: target.weight,
  };
}

/** English defaults for tests + share paths — UI prefers i18n keys. */
export function formatProgressionInsight(insight: ProgressionInsight): string {
  const { reason, exerciseName: name, unit, bodyweight, step, reps, weight } = insight;
  if (reason === 'add_weight' && !bodyweight) {
    return `Next: +${step} ${unit} on ${name} (hit top of range)`;
  }
  if (bodyweight) {
    if (reason === 'add_reps') return `Next: ${reps} reps on ${name}`;
    return `Next: hold ${reps} on ${name}`;
  }
  if (reason === 'add_reps') {
    return `Next: ${reps} × ${weight} ${unit} on ${name}`;
  }
  return `Next: hold ${reps} × ${weight} ${unit} on ${name}`;
}

/** i18n key for a structured progression insight. */
export function progressionInsightKey(insight: ProgressionInsight): string {
  if (insight.reason === 'add_weight' && !insight.bodyweight) {
    return 'victoryProgressAddWeight';
  }
  if (insight.bodyweight) {
    return insight.reason === 'add_reps'
      ? 'victoryProgressAddRepsBw'
      : 'victoryProgressHoldBw';
  }
  return insight.reason === 'add_reps'
    ? 'victoryProgressAddReps'
    : 'victoryProgressHold';
}

/** Prefer Mission Coach on victory for the first N completed workouts (wedge habit). */
export const COACH_VICTORY_EARLY_WORKOUTS = 3;

export type PickVictoryNextActionOpts = {
  proteinLoggedToday?: boolean;
  strainDelta?: number;
  /** Workouts completed including the session just finished. */
  completedWorkouts?: number;
  /** True when a Mission Coach plan is loaded for the user. */
  hasCoachPlan?: boolean;
};

/**
 * One boss next step after a session.
 * Prefer Mission Coach / next train — stay in the Train+Coach wedge (Horizon W).
 *
 * **Week-1 session 2 wins** over the early-Coach CTA (`.412` / T1.3). After exactly
 * one log, Today and First Steps already name "Start session 2" at `/active`
 * (`.291` / `.404`). Victory used to send that athlete to Coach instead — two
 * next bosses for the same habit loop. One definition: `week1SecondSessionCue`.
 */
export function pickVictoryNextAction(opts?: PickVictoryNextActionOpts): VictoryNextAction {
  const completed =
    typeof opts?.completedWorkouts === 'number' ? opts.completedWorkouts : undefined;

  // Exactly one finished session → second session is the boss habit, not Coach.
  if (completed === 1) {
    const cue = week1SecondSessionCue({ completedSessions: 1 });
    if (cue) {
      return {
        href: cue.href,
        labelKey: cue.labelKey,
        defaultLabel: cue.defaultLabel,
        reasonKey: cue.reasonKey,
        defaultReason: cue.defaultReason,
      };
    }
  }

  const early =
    typeof completed === 'number' &&
    completed > 0 &&
    completed <= COACH_VICTORY_EARLY_WORKOUTS;
  // Explicit plan presence (true or false) → Coach. Early workouts (2–3) → Coach.
  const wantsCoach = early || opts?.hasCoachPlan === true || opts?.hasCoachPlan === false;

  if (wantsCoach) {
    return {
      href: '/coach',
      labelKey: 'victoryNextCoachLabel',
      defaultLabel: 'See Mission Coach',
      reasonKey: 'victoryNextCoachReason',
      defaultReason: 'Coach adapts your week from this log — no wearable needed.',
    };
  }

  // High strain: recovery mind with collection deep-link (not Mind tourism generic).
  if ((opts?.strainDelta ?? 0) >= 5) {
    return {
      href: '/mind?collection=post-train',
      labelKey: 'victoryNextRecoverMindLabel',
      defaultLabel: 'Post-train downshift',
      reasonKey: 'victoryNextRecoverMindReason',
      defaultReason: 'Strain is up — a short downshift before the next load.',
    };
  }

  return {
    href: '/active',
    labelKey: 'victoryNextTrainLabel',
    defaultLabel: 'Train again',
    reasonKey: 'victoryNextTrainReason',
    defaultReason: 'Keep the path alive — Just Go when you’re ready.',
  };
}

/**
 * Signed body-delta chip text — one format for readiness / strain / recovery (.429).
 */
export function formatVictorySignedDelta(n: number): string {
  return n > 0 ? `+${n}` : `${n}`;
}

/**
 * Secondary "Back to Today" only when the primary next is Coach / Train / session-2 —
 * not when the primary is already Today (rest path). One boss CTA stays primary;
 * Today is a quiet escape, never a second outline button (`.422`).
 */
export function shouldShowVictoryBackTodaySecondary(
  nextHref: string | undefined | null
): boolean {
  return typeof nextHref === 'string' && nextHref.length > 0 && !nextHref.includes('/log');
}

export function summarizeWorkoutVictory(
  log: CompletedWorkoutLog,
  streak: number,
  bodyDelta?: VictoryBodyDelta,
  progressionInsight?: ProgressionInsight,
  nextAction?: VictoryNextAction,
  pickOpts?: PickVictoryNextActionOpts
): WorkoutVictorySummary {
  const setCount = log.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  return {
    workoutName: log.workoutName,
    totalVolume: log.totalVolume,
    durationSeconds: log.durationSeconds,
    setCount,
    exerciseCount: log.exercises.length,
    streak,
    bodyDelta,
    progressionInsight,
    nextAction:
      nextAction ??
      pickVictoryNextAction({
        strainDelta: bodyDelta?.strain,
        ...pickOpts,
      }),
  };
}
