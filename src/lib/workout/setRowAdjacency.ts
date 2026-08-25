/**
 * E-Adjacency — next-set target + log cite after a completed working set.
 *
 * Free forever. Prev is official last-actuals beside the row; it does not
 * fill the next number. This module cites the next set from logs (or Coach
 * plan). It is not a last-actuals ghost — `lastSetGhost` already copies last.
 * Tombstones (`deletedAt`) are not history. Freshness may later veto dose —
 * it never picks the lift, so this module must not import readiness /
 * freshness / Recovery %.
 */

import type { CompletedWorkoutLog } from '@/types';
import type { UnitsPref } from '@/lib/units';
import { localDateKeyFromIso } from '@/lib/time/localDate';
import { suggestNextSetTarget } from '@/lib/workout/nextSetTargets';
import { appendIntensityCite, lastWorkSetIntensity } from '@/lib/workout/workSetIntensity';
import { appendKnownMaxPctCite, loadPctOfKnownMax } from '@/lib/workout/setRowPercent';

/** Monday=0 … Sunday=6 — same order as coach `weekdayLabel`. */
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export type SetRowLogCite = {
  kind: 'logs';
  weekdayMondayOffset: number;
  weekdayShort: (typeof WEEKDAYS)[number];
  /** 1-based original set numbers from the last session (warmup excluded). */
  setFrom: number;
  setTo: number;
  /** Last work set RPE/RIR when present — never invented (`.967`). */
  intensity?: string;
};

export type SetRowCoachCite = {
  kind: 'coach';
  /** Last work set RPE/RIR when present — never invented (`.967`). */
  intensity?: string;
};

/** First-ever this session — no invented weekday for an unfinished workout. */
export type SetRowSessionCite = {
  kind: 'session';
  setFrom: number;
  setTo: number;
  /** Last work set RPE/RIR when present — never invented (`.967`). */
  intensity?: string;
};

export type SetRowLastRestCite = { kind: 'last-rest' };

export type SetRowCite = SetRowLogCite | SetRowCoachCite;

export type AfterCompleteProvenance = SetRowCite | SetRowSessionCite | SetRowLastRestCite;

export type AfterCompleteSuggestion =
  | { kind: 'load'; reps: number; weight: number }
  | { kind: 'rest'; seconds: number };

/** Visible next-set cite after a completed working set. Always skippable in UI. */
export type AfterCompleteCite = {
  suggestion: AfterCompleteSuggestion;
  cite: AfterCompleteProvenance;
};

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

/** Working set with reps — warmup / 0-rep are not diary evidence. */
export function hasUsableWorkingSet(
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

function formatSetSpan(setFrom: number, setTo: number, t: AdjacencyCiteT): string {
  return setFrom === setTo
    ? t('activeTargetCiteSet', { n: setFrom, defaultValue: `set ${setFrom}` })
    : t('activeTargetCiteSets', {
        from: setFrom,
        to: setTo,
        defaultValue: `sets ${setFrom}–${setTo}`,
      });
}

export function formatAdjacencyCiteLine(
  cite: AfterCompleteProvenance | SetRowCite | null,
  t: AdjacencyCiteT
): string | null {
  if (!cite) return null;
  if (cite.kind === 'coach') {
    return appendIntensityCite(
      t('activeTargetCiteCoach', { defaultValue: 'Coach plan' }),
      cite.intensity
    );
  }
  if (cite.kind === 'last-rest') {
    return t('activeNextCiteLastRest', { defaultValue: 'Last rest' });
  }
  if (cite.kind === 'session') {
    return appendIntensityCite(
      t('activeNextCiteFromSession', {
        sets: formatSetSpan(cite.setFrom, cite.setTo, t),
        defaultValue: `From this session · ${formatSetSpan(cite.setFrom, cite.setTo, t)}`,
      }),
      cite.intensity
    );
  }
  const day = weekdayWord(cite.weekdayMondayOffset, t);
  const sets = formatSetSpan(cite.setFrom, cite.setTo, t);
  return appendIntensityCite(
    t('activeTargetCiteFromLast', {
      day,
      sets,
      defaultValue: `From last ${day} · ${sets}`,
    }),
    cite.intensity
  );
}

/** Target + provenance for the after-complete strip. Rest clock is preformatted. */
export function formatAfterCompleteParts(
  row: AfterCompleteCite,
  t: AdjacencyCiteT,
  restClock?: string,
  knownMax?: number | null
): { target: string; provenance: string; line: string } {
  let target =
    row.suggestion.kind === 'load'
      ? formatTargetLabel(row.suggestion.reps, row.suggestion.weight)
      : t('activeNextCiteRest', {
          clock: restClock ?? `${row.suggestion.seconds}s`,
          defaultValue: `Rest ${restClock ?? `${row.suggestion.seconds}s`}`,
        });
  if (row.suggestion.kind === 'load') {
    target =
      appendKnownMaxPctCite(
        target,
        loadPctOfKnownMax(knownMax, row.suggestion.weight)
      ) ?? target;
  }
  const provenance = formatAdjacencyCiteLine(row.cite, t) ?? '';
  const line = provenance ? `${target} · ${provenance}` : target;
  return { target, provenance, line };
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
  const intensity = lastWorkSetIntensity(lastEx.sets) ?? undefined;

  return {
    targetLabel: formatTargetLabel(suggestion.reps, suggestion.weight),
    cite: day
      ? {
          kind: 'logs',
          weekdayMondayOffset: day.offset,
          weekdayShort: day.short,
          setFrom,
          setTo,
          ...(intensity ? { intensity } : {}),
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

function nextIncompleteIdx(
  sets: { completed?: boolean }[],
  afterIdx: number
): number {
  for (let i = afterIdx + 1; i < sets.length; i++) {
    if (!sets[i]?.completed) return i;
  }
  return -1;
}

function sessionCompletedWorking(sets: {
  completed?: boolean;
  reps: number;
  weight: number;
  kind?: string;
}[]): { set: { reps: number; weight: number; kind?: string }; original: number }[] {
  const out: { set: { reps: number; weight: number; kind?: string }; original: number }[] = [];
  for (let i = 0; i < sets.length; i++) {
    const s = sets[i];
    if (!s?.completed || s.kind === 'warmup' || s.reps < 1) continue;
    out.push({ set: s, original: i + 1 });
  }
  return out;
}

/**
 * After a working set saves: the next load/reps the logs earn, or last rest
 * when this exercise has no next set. Empty evidence stays quiet — never invent.
 * Skip lives in the UI.
 */
export function resolveAfterCompleteCite(params: {
  workoutHistory: CompletedWorkoutLog[];
  exerciseId: string;
  sessionSets: Array<{
    completed?: boolean;
    reps: number;
    weight: number;
    kind?: string;
    rpe10?: number;
    rir?: number;
  }>;
  completedSetIdx: number;
  prescribed?: boolean;
  units: UnitsPref;
  goalRange?: { min: number; max: number };
  /** Stored last rest for this exercise — null means do not invent rest. */
  lastRestSeconds: number | null;
  /** Peer in this group still owes this set index — A2 is not a new exercise. */
  midRoundPeer?: boolean;
}): AfterCompleteCite | null {
  const done = params.sessionSets[params.completedSetIdx];
  if (!done?.completed || done.kind === 'warmup') return null;
  if (params.midRoundPeer) return null;

  const nextIdx = nextIncompleteIdx(params.sessionSets, params.completedSetIdx);
  if (nextIdx >= 0) {
    const next = params.sessionSets[nextIdx]!;
    if (next.kind === 'warmup') return null;

    if (params.prescribed) {
      const intensity = lastWorkSetIntensity([done]) ?? undefined;
      return {
        suggestion: { kind: 'load', reps: next.reps, weight: next.weight },
        cite: { kind: 'coach', ...(intensity ? { intensity } : {}) },
      };
    }

    const lastLog = lastLiveSessionForExercise(params.workoutHistory, params.exerciseId);
    const lastEx = lastLog?.exercises.find((e) => e.exerciseId === params.exerciseId);
    if (lastEx) {
      const suggestion = suggestNextSetTarget(lastEx.sets, nextIdx, params.units, {
        repMin: params.goalRange?.min,
        repMax: params.goalRange?.max,
      });
      const lastAdj = resolveSetRowAdjacency({
        workoutHistory: params.workoutHistory,
        exerciseId: params.exerciseId,
        setIdx: nextIdx,
        planned: { reps: next.reps, weight: next.weight, kind: next.kind },
        units: params.units,
        goalRange: params.goalRange,
      });
      if (suggestion && lastAdj.cite && !lastAdj.empty) {
        return {
          suggestion: { kind: 'load', reps: suggestion.reps, weight: suggestion.weight },
          cite: lastAdj.cite,
        };
      }
    }

    const sessionWork = sessionCompletedWorking(params.sessionSets);
    if (!sessionWork.length) return null;
    const suggestion = suggestNextSetTarget(
      sessionWork.map((w) => w.set),
      Math.max(0, sessionWork.length - 1),
      params.units,
      { repMin: params.goalRange?.min, repMax: params.goalRange?.max }
    );
    if (!suggestion) return null;
    const cited = suggestion.evidenceWorkingIdx
      .map((i) => sessionWork[i]?.original)
      .filter((n): n is number => typeof n === 'number');
    const setFrom = cited.length ? Math.min(...cited) : (sessionWork[0]?.original ?? 1);
    const setTo = cited.length ? Math.max(...cited) : setFrom;
    const intensity = lastWorkSetIntensity([done]) ?? undefined;
    return {
      suggestion: { kind: 'load', reps: suggestion.reps, weight: suggestion.weight },
      cite: { kind: 'session', setFrom, setTo, ...(intensity ? { intensity } : {}) },
    };
  }

  if (params.lastRestSeconds != null && params.lastRestSeconds > 0) {
    return {
      suggestion: { kind: 'rest', seconds: params.lastRestSeconds },
      cite: { kind: 'last-rest' },
    };
  }
  return null;
}
