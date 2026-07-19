import type { CompletedWorkoutLog } from '@/types';
import type { UnitsPref } from '@/lib/units';
import { weightStep } from '@/lib/units';
import { EXERCISES } from '@/data/exercises';
import type { Rpe } from '@/lib/coach/types';
import {
  resolveStartingLoadPct,
  weightFromLoadPct,
  workingMaxFromHistory,
  type LoadPctExperience,
} from '@/lib/workout/percentLoad';

export interface ProgressionTargets {
  sets: number;
  reps: number;
  weight: number;
  whyKey: string;
  /** Percent of working max when weight was materialized from e1RM. */
  loadPct?: number;
}

interface SessionSnapshot {
  completedAt: string;
  sets: { reps: number; weight: number; kind?: string; rpe?: Rpe }[];
}

function repRangeForGoal(goalId: string): { min: number; max: number } {
  if (goalId === 'strength' || goalId === 'pft') return { min: 4, max: 6 };
  if (goalId === 'endurance' || goalId === 'fat_loss') return { min: 12, max: 15 };
  if (goalId === 'conditioning') return { min: 10, max: 15 };
  return { min: 8, max: 12 };
}

function workingSets(sets: SessionSnapshot['sets']) {
  return sets.filter((s) => s.kind !== 'warmup');
}

function isBodyweightExercise(exerciseId: string): boolean {
  const ex = EXERCISES.find((e) => e.id === exerciseId);
  if (!ex?.equipment) return true;
  const eq = ex.equipment.toLowerCase();
  return eq === 'bodyweight' || eq.startsWith('bodyweight');
}

function roundToStep(value: number, step: number): number {
  if (step <= 0) return value;
  return Math.round(value / step) * step;
}

function findRecentSessions(
  exerciseId: string,
  history: CompletedWorkoutLog[],
  limit = 3
): SessionSnapshot[] {
  const out: SessionSnapshot[] = [];
  for (const log of history) {
    const hit = log.exercises.find((e) => e.exerciseId === exerciseId);
    if (hit) {
      out.push({ completedAt: log.completedAt, sets: hit.sets });
      if (out.length >= limit) break;
    }
  }
  return out;
}

function lastPerformance(sessions: SessionSnapshot[]) {
  if (!sessions.length) return null;
  const ws = workingSets(sessions[0].sets);
  if (!ws.length) return null;
  const reps = Math.round(ws.reduce((s, x) => s + x.reps, 0) / ws.length);
  const weight = ws[0].weight;
  const setCount = ws.length;
  return { reps, weight, setCount, sets: ws };
}

function allEasy(sets: { rpe?: Rpe }[]): boolean {
  const ws = workingSets(sets as SessionSnapshot['sets']);
  return ws.length > 0 && ws.every((s) => s.rpe === 'easy');
}

function anyHardOnTwoPlus(sets: { rpe?: Rpe }[]): boolean {
  const ws = workingSets(sets as SessionSnapshot['sets']);
  return ws.filter((s) => s.rpe === 'hard').length >= 2;
}

function allHard(sets: { rpe?: Rpe }[]): boolean {
  const ws = workingSets(sets as SessionSnapshot['sets']);
  return ws.length > 0 && ws.every((s) => s.rpe === 'hard');
}

function hasMixedOrMed(sets: { rpe?: Rpe }[]): boolean {
  const ws = workingSets(sets as SessionSnapshot['sets']);
  return ws.some((s) => s.rpe === 'med' || !s.rpe);
}

function stalled(sessions: SessionSnapshot[]): boolean {
  if (sessions.length < 3) return false;
  const perf = sessions.slice(0, 3).map((s) => {
    const ws = workingSets(s.sets);
    if (!ws.length) return null;
    return { reps: ws[0].reps, weight: ws[0].weight };
  });
  if (perf.some((p) => !p)) return false;
  const [a, b, c] = perf as { reps: number; weight: number }[];
  return a.reps === b.reps && b.reps === c.reps && a.weight === b.weight && a.weight === c.weight;
}

function seedTargets(
  exerciseId: string,
  goalId: string,
  experience: string
): ProgressionTargets {
  const range = repRangeForGoal(goalId);
  const mid = Math.round((range.min + range.max) / 2);
  const sets = experience === 'beginner' ? 3 : experience === 'advanced' ? 4 : 3;
  const bodyweight = isBodyweightExercise(exerciseId);

  if (bodyweight) {
    return {
      sets,
      reps: mid,
      weight: 0,
      whyKey: 'coachWhyBodyweightReps',
    };
  }

  return {
    sets,
    reps: mid,
    weight: 0,
    whyKey: 'coachFindWorkingWeight',
  };
}

function withLoadPct(
  target: ProgressionTargets,
  loadPct: number | undefined
): ProgressionTargets {
  if (loadPct == null || loadPct <= 0 || target.weight <= 0) return target;
  return { ...target, loadPct: Math.round(loadPct) };
}

/**
 * Weighted compounds with a known max: prescribe via loadPct (TrainHeroic-style).
 * Bodyweight / no max: absolute last-session progression (unchanged).
 */
export function nextTargets(
  exerciseId: string,
  history: CompletedWorkoutLog[],
  units: UnitsPref,
  goalId: string,
  experience: string
): ProgressionTargets {
  const sessions = findRecentSessions(exerciseId, history);
  const step = weightStep(units);
  const range = repRangeForGoal(goalId);
  const bodyweight = isBodyweightExercise(exerciseId);
  const exp = experience as LoadPctExperience;

  if (!sessions.length) {
    return seedTargets(exerciseId, goalId, experience);
  }

  const perf = lastPerformance(sessions);
  if (!perf) return seedTargets(exerciseId, goalId, experience);

  let { reps, weight } = perf;
  const { setCount } = perf;
  let whyKey = 'coachWhyHold';

  const workingMax = !bodyweight ? workingMaxFromHistory(exerciseId, history) : null;
  const usePct = workingMax != null && workingMax > 0 && weight > 0;

  if (usePct && workingMax) {
    let loadPct = resolveStartingLoadPct({
      workingMax,
      lastWeight: weight,
      experience: exp,
      goalId,
    });

    if (stalled(sessions)) {
      loadPct *= 0.9;
      whyKey = 'coachWhyDeload';
      weight = weightFromLoadPct(workingMax, loadPct, units);
      return withLoadPct({ sets: setCount, reps, weight, whyKey }, loadPct);
    }

    const latestSets = sessions[0].sets;

    if (allHard(latestSets)) {
      loadPct *= 0.9;
      weight = weightFromLoadPct(workingMax, loadPct, units);
      return withLoadPct(
        { sets: setCount, reps, weight, whyKey: 'coachWhyDeload' },
        loadPct
      );
    }

    if (anyHardOnTwoPlus(latestSets)) {
      weight = weightFromLoadPct(workingMax, loadPct, units);
      return withLoadPct(
        { sets: setCount, reps, weight, whyKey: 'coachWhyHoldHard' },
        loadPct
      );
    }

    if (allEasy(latestSets)) {
      loadPct = Math.min(95, loadPct + 2.5);
      weight = weightFromLoadPct(workingMax, loadPct, units);
      return withLoadPct(
        { sets: setCount, reps, weight, whyKey: 'coachWhyLoadUp' },
        loadPct
      );
    }

    if (hasMixedOrMed(latestSets)) {
      if (reps < range.max) {
        reps += 1;
        whyKey = 'coachWhyRepProgress';
      }
      weight = weightFromLoadPct(workingMax, loadPct, units);
      return withLoadPct({ sets: setCount, reps, weight, whyKey }, loadPct);
    }

    // No RPE rated — rep-completion heuristic
    if (reps >= range.max) {
      loadPct = Math.min(95, loadPct + 2.5);
      reps = range.min;
      whyKey = 'coachWhyLoadUp';
    }
    weight = weightFromLoadPct(workingMax, loadPct, units);
    return withLoadPct({ sets: setCount, reps, weight, whyKey }, loadPct);
  }

  if (stalled(sessions)) {
    if (bodyweight) {
      reps = Math.max(range.min, Math.round(reps * 0.9));
      whyKey = 'coachWhyDeload';
    } else {
      weight = roundToStep(Math.max(0, weight * 0.9), step);
      whyKey = 'coachWhyDeload';
    }
    return { sets: setCount, reps, weight, whyKey };
  }

  const latestSets = sessions[0].sets;

  if (allHard(latestSets)) {
    if (bodyweight) {
      reps = Math.max(range.min, Math.round(reps * 0.9));
    } else {
      weight = roundToStep(Math.max(0, weight * 0.9), step);
    }
    return { sets: setCount, reps, weight, whyKey: 'coachWhyDeload' };
  }

  if (anyHardOnTwoPlus(latestSets)) {
    return { sets: setCount, reps, weight, whyKey: 'coachWhyHoldHard' };
  }

  if (allEasy(latestSets)) {
    if (bodyweight) {
      reps = Math.min(range.max, reps + (reps >= range.max ? 0 : 2));
      whyKey = reps > perf.reps ? 'coachWhyRepProgress' : 'coachWhyHold';
    } else {
      weight = roundToStep(weight + step, step);
      whyKey = 'coachWhyLoadUp';
    }
    return { sets: setCount, reps, weight, whyKey };
  }

  if (hasMixedOrMed(latestSets)) {
    if (reps < range.max) {
      reps += 1;
      whyKey = 'coachWhyRepProgress';
    }
    return { sets: setCount, reps, weight, whyKey };
  }

  // No RPE rated — rep-completion heuristic
  if (reps >= range.max) {
    if (bodyweight) {
      reps = Math.min(range.max + 2, reps + 1);
      whyKey = 'coachWhyRepProgress';
    } else {
      weight = roundToStep(weight + step, step);
      reps = range.min;
      whyKey = 'coachWhyLoadUp';
    }
  }

  return { sets: setCount, reps, weight, whyKey };
}
