/**
 * E-Adjacency — next-set target + log cite for the set row (above PREVIOUS).
 *
 * Free forever. The number is double-progression (or the coach prescription).
 * The cite is the last *live* session that produced it (weekday + working set
 * numbers). Tombstones (`deletedAt`) are not history. Freshness may later veto
 * dose — it never picks the lift, so this module must not import readiness /
 * freshness / Recovery %.
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
  /**
   * Honest empty: no live prior logs. Show TARGET eyebrow + empty copy.
   * Never an invented number. Warmup / unusable match stay quiet (`false`).
   */
  empty: boolean;
};

const QUIET: SetRowAdjacency = { targetLabel: null, cite: null, empty: false };
const HONEST_EMPTY: SetRowAdjacency = { targetLabel: null, cite: null, empty: true };

function hasUsableWorkingSet(
  sets: CompletedWorkoutLog['exercises'][number]['sets']
): boolean {
  return sets.some((s) => s.kind !== 'warmup' && s.reps > 0);
}

/**
 * Newest live session that actually logged this lift.
 * One home for Train last-session lookup — tombstones and 0-rep junk are not evidence.
 */
export function lastLiveSessionForExercise(
  history: CompletedWorkoutLog[],
  exerciseId: string
): CompletedWorkoutLog | null {
  for (const log of history) {
    if (log.deletedAt) continue;
    const ex = log.exercises.find((e) => e.exerciseId === exerciseId);
    if (!ex || !hasUsableWorkingSet(ex.sets)) continue;
    return log;
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

/** i18n `t` — weekday keys stay literal (coverage forbids computed keys). */
export type AdjacencyCiteT = (key: string, opts?: Record<string, unknown>) => string;

export function formatAdjacencyCiteLine(
  cite: SetRowCite | null,
  t: AdjacencyCiteT
): string | null {
  if (!cite) return null;
  if (cite.kind === 'coach') {
    return t('activeTargetCiteCoach', { defaultValue: 'Coach plan' });
  }
  const day = weekdayWord(cite.weekdayMondayOffset, t);
  const sets =
    cite.setFrom === cite.setTo
      ? t('activeTargetCiteSet', { n: cite.setFrom, defaultValue: `set ${cite.setFrom}` })
      : t('activeTargetCiteSets', {
          from: cite.setFrom,
          to: cite.setTo,
          defaultValue: `sets ${cite.setFrom}–${cite.setTo}`,
        });
  return t('activeTargetCiteFromLast', {
    day,
    sets,
    defaultValue: `From last ${day} · ${sets}`,
  });
}

function weekdayWord(offset: number, t: AdjacencyCiteT): string {
  switch (offset) {
    case 0:
      return t('activeWeekdayMon', { defaultValue: 'Mon' });
    case 1:
      return t('activeWeekdayTue', { defaultValue: 'Tue' });
    case 2:
      return t('activeWeekdayWed', { defaultValue: 'Wed' });
    case 3:
      return t('activeWeekdayThu', { defaultValue: 'Thu' });
    case 4:
      return t('activeWeekdayFri', { defaultValue: 'Fri' });
    case 5:
      return t('activeWeekdaySat', { defaultValue: 'Sat' });
    default:
      return t('activeWeekdaySun', { defaultValue: 'Sun' });
  }
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
  if (params.planned.kind === 'warmup') return QUIET;

  if (params.prescribed) {
    return {
      targetLabel: formatTargetLabel(params.planned.reps, params.planned.weight),
      cite: { kind: 'coach' },
      empty: false,
    };
  }

  const lastLog = lastLiveSessionForExercise(params.workoutHistory, params.exerciseId);
  if (!lastLog) return HONEST_EMPTY;

  const lastEx = lastLog.exercises.find((e) => e.exerciseId === params.exerciseId);
  if (!lastEx) return HONEST_EMPTY;

  const suggestion = suggestNextSetTarget(lastEx.sets, params.setIdx, params.units, {
    repMin: params.goalRange?.min,
    repMax: params.goalRange?.max,
  });
  if (!suggestion) return QUIET;

  const workingNums = originalWorkingNumbers(lastEx.sets);
  const citedNums = suggestion.evidenceWorkingIdx
    .map((i) => workingNums[i])
    .filter((n): n is number => typeof n === 'number');
  const setFrom = citedNums.length ? Math.min(...citedNums) : (workingNums[0] ?? 1);
  const setTo = citedNums.length ? Math.max(...citedNums) : setFrom;

  const day = weekdayFromIso(lastLog.completedAt) ?? weekdayFromIso(lastLog.startedAt);

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
    empty: false,
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
