/**
 * E-Adjacency — next-set target + log cite for the set row (above PREVIOUS).
 *
 * Free forever. The number is double-progression (or the coach prescription).
 * The cite is the last session that produced it (weekday + working set numbers).
 * Freshness may later veto dose — it never picks the lift, so this module must
 * not import readiness / freshness / Recovery %.
 */

import type { CompletedWorkoutLog } from '@/types';
import type { UnitsPref } from '@/lib/units';
import { localDateKeyFromIso } from '@/lib/time/localDate';
import { suggestNextSetTarget } from '@/lib/workout/nextSetTargets';

/** Monday=0 … Sunday=6 — same order as coach `weekdayLabel`. */
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export type SetRowLogCite = {
  kind: 'logs';
  weekdayMondayOffset: number;
  weekdayShort: (typeof WEEKDAYS)[number];
  /** 1-based original set numbers from the last session (warmup excluded). */
  setFrom: number;
  setTo: number;
};

export type SetRowCoachCite = { kind: 'coach' };

export type SetRowCite = SetRowLogCite | SetRowCoachCite;

export type SetRowAdjacency = {
  targetLabel: string | null;
  cite: SetRowCite | null;
};

function lastSessionForExercise(
  history: CompletedWorkoutLog[],
  exerciseId: string
): {
  completedAt: string;
  startedAt: string;
  sets: CompletedWorkoutLog['exercises'][number]['sets'];
} | null {
  for (const log of history) {
    const ex = log.exercises.find((e) => e.exerciseId === exerciseId);
    if (ex && ex.sets.length > 0) {
      return { completedAt: log.completedAt, startedAt: log.startedAt, sets: ex.sets };
    }
  }
  return null;
}

/** Local calendar weekday of an ISO instant — never `toISOString()` for the date. */
function weekdayFromIso(
  iso: string
): { offset: number; short: (typeof WEEKDAYS)[number] } | null {
  const key = localDateKeyFromIso(iso);
  if (!key) return null;
  const [y, m, d] = key.split('-').map(Number);
  if (!y || !m || !d) return null;
  const local = new Date(y, m - 1, d);
  const offset = (local.getDay() + 6) % 7;
  return { offset, short: WEEKDAYS[offset]! };
}

function originalWorkingNumbers(sets: { kind?: string }[]): number[] {
  const nums: number[] = [];
  for (let i = 0; i < sets.length; i++) {
    if (sets[i]?.kind !== 'warmup') nums.push(i + 1);
  }
  return nums;
}

function formatTargetLabel(reps: number, weight: number): string {
  return `${reps} × ${weight}`;
}

export function resolveSetRowAdjacency(params: {
  workoutHistory: CompletedWorkoutLog[];
  exerciseId: string;
  setIdx: number;
  planned: { reps: number; weight: number; kind?: string };
  prescribed?: boolean;
  units: UnitsPref;
  goalRange?: { min: number; max: number };
}): SetRowAdjacency {
  if (params.planned.kind === 'warmup') {
    return { targetLabel: null, cite: null };
  }

  if (params.prescribed) {
    return {
      targetLabel: formatTargetLabel(params.planned.reps, params.planned.weight),
      cite: { kind: 'coach' },
    };
  }

  const last = lastSessionForExercise(params.workoutHistory, params.exerciseId);
  if (!last) return { targetLabel: null, cite: null };

  const suggestion = suggestNextSetTarget(last.sets, params.setIdx, params.units, {
    repMin: params.goalRange?.min,
    repMax: params.goalRange?.max,
  });
  if (!suggestion) return { targetLabel: null, cite: null };

  const workingNums = originalWorkingNumbers(last.sets);
  const citedNums = suggestion.evidenceWorkingIdx
    .map((i) => workingNums[i])
    .filter((n): n is number => typeof n === 'number');
  const setFrom = citedNums.length ? Math.min(...citedNums) : (workingNums[0] ?? 1);
  const setTo = citedNums.length ? Math.max(...citedNums) : setFrom;

  const day = weekdayFromIso(last.completedAt) ?? weekdayFromIso(last.startedAt);

  return {
    targetLabel: formatTargetLabel(suggestion.reps, suggestion.weight),
    cite: day
      ? {
          kind: 'logs',
          weekdayMondayOffset: day.offset,
          weekdayShort: day.short,
          setFrom,
          setTo,
        }
      : null,
  };
}

/** Per-set adjacency for an exercise's planned rows — one pass, one home. */
export function formatSetRowAdjacency(params: {
  workoutHistory: CompletedWorkoutLog[];
  exerciseId: string;
  sets: { reps: number; weight: number; kind?: string }[];
  prescribed?: boolean;
  units: UnitsPref;
  goalRange?: { min: number; max: number };
}): SetRowAdjacency[] {
  return params.sets.map((planned, setIdx) =>
    resolveSetRowAdjacency({
      workoutHistory: params.workoutHistory,
      exerciseId: params.exerciseId,
      setIdx,
      planned,
      prescribed: params.prescribed,
      units: params.units,
      goalRange: params.goalRange,
    })
  );
}
