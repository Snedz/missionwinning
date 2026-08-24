import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { CompletedWorkoutLog } from '@/types';
import {
  formatAdjacencyCiteLine,
  formatAfterCompleteParts,
  formatSetRowAdjacency,
  lastLiveSessionForExercise,
  resolveAfterCompleteCite,
  resolveSetRowAdjacency,
} from '@/lib/workout/setRowAdjacency';

const src = readFileSync(path.join(import.meta.dirname, 'setRowAdjacency.ts'), 'utf8');
const root = path.join(import.meta.dirname, '..', '..', '..');

/** Previous occurrence of `jsDay` (0=Sun) at local noon — no fixture date literals. */
function isoOnPreviousJsWeekday(jsDay: number): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  let back = (d.getDay() - jsDay + 7) % 7;
  if (back === 0) back = 7;
  d.setDate(d.getDate() - back);
  return d.toISOString();
}

function historyWith(
  exerciseId: string,
  sets: { reps: number; weight: number; kind?: 'normal' | 'warmup' }[],
  completedAt: string,
  over: Partial<CompletedWorkoutLog> = {}
): CompletedWorkoutLog[] {
  return [
    {
      id: 'h1',
      workoutName: 'Past',
      startedAt: completedAt,
      completedAt,
      durationSeconds: 3600,
      totalVolume: 100,
      exercises: [
        {
          exerciseId,
          sets: sets.map((s) => ({ reps: s.reps, weight: s.weight, kind: s.kind ?? 'normal' })),
        },
      ],
      ...over,
    },
  ];
}

const planned = { reps: 8, weight: 60 };

describe('resolveSetRowAdjacency', () => {
  it('cites last Tuesday working sets 2–4 when all hit the top of range', () => {
    const completedAt = isoOnPreviousJsWeekday(2);
    const hist = historyWith(
      'bench-press',
      [
        { reps: 8, weight: 40, kind: 'warmup' },
        { reps: 12, weight: 60 },
        { reps: 12, weight: 60 },
        { reps: 12, weight: 60 },
      ],
      completedAt
    );
    const out = resolveSetRowAdjacency({
      workoutHistory: hist,
      exerciseId: 'bench-press',
      setIdx: 0,
      planned,
      units: 'metric',
    });
    assert.equal(out.targetLabel, '8 × 62.5');
    assert.equal(out.empty, false);
    assert.ok(out.cite && out.cite.kind === 'logs');
    if (out.cite.kind !== 'logs') return;
    assert.equal(out.cite.weekdayMondayOffset, 1);
    assert.equal(out.cite.weekdayShort, 'Tue');
    assert.equal(out.cite.setFrom, 2);
    assert.equal(out.cite.setTo, 4);
  });

  it('cites the matching working set when adding a rep', () => {
    const hist = historyWith(
      'squat',
      [
        { reps: 10, weight: 80 },
        { reps: 9, weight: 80 },
        { reps: 8, weight: 80 },
      ],
      isoOnPreviousJsWeekday(1)
    );
    const out = resolveSetRowAdjacency({
      workoutHistory: hist,
      exerciseId: 'squat',
      setIdx: 1,
      planned: { reps: 8, weight: 80 },
      units: 'metric',
    });
    assert.equal(out.targetLabel, '10 × 80');
    assert.ok(out.cite && out.cite.kind === 'logs');
    if (out.cite.kind !== 'logs') return;
    assert.equal(out.cite.weekdayShort, 'Mon');
    assert.equal(out.cite.setFrom, 2);
    assert.equal(out.cite.setTo, 2);
  });

  it('returns honest empty when there is no last session — never invents a number', () => {
    const out = resolveSetRowAdjacency({
      workoutHistory: [],
      exerciseId: 'bench-press',
      setIdx: 0,
      planned,
      units: 'metric',
    });
    assert.deepEqual(out, { targetLabel: null, cite: null, empty: true });
  });

  it('skips a deleted session and cites the live one behind it', () => {
    const liveAt = isoOnPreviousJsWeekday(1);
    const deadAt = isoOnPreviousJsWeekday(2);
    const dead = historyWith(
      'bench-press',
      [{ reps: 12, weight: 100 }],
      deadAt,
      { id: 'dead', deletedAt: new Date().toISOString() }
    );
    const live = historyWith('bench-press', [{ reps: 8, weight: 60 }], liveAt, { id: 'live' });
    const out = resolveSetRowAdjacency({
      workoutHistory: [...dead, ...live],
      exerciseId: 'bench-press',
      setIdx: 0,
      planned,
      units: 'metric',
    });
    assert.equal(out.targetLabel, '9 × 60');
    assert.ok(out.cite && out.cite.kind === 'logs');
    if (out.cite.kind !== 'logs') return;
    assert.equal(out.cite.weekdayShort, 'Mon');
    assert.equal(out.empty, false);
  });

  it('does not invent a log cite for a prescribed set', () => {
    const hist = historyWith(
      'bench-press',
      [{ reps: 8, weight: 60 }],
      isoOnPreviousJsWeekday(2)
    );
    const out = resolveSetRowAdjacency({
      workoutHistory: hist,
      exerciseId: 'bench-press',
      setIdx: 0,
      planned: { reps: 5, weight: 100 },
      prescribed: true,
      units: 'metric',
    });
    assert.equal(out.targetLabel, '5 × 100');
    assert.deepEqual(out.cite, { kind: 'coach' });
    assert.equal(out.empty, false);
  });

  it('stays quiet on warmup rows', () => {
    const hist = historyWith(
      'bench-press',
      [{ reps: 8, weight: 60 }],
      isoOnPreviousJsWeekday(3)
    );
    const out = resolveSetRowAdjacency({
      workoutHistory: hist,
      exerciseId: 'bench-press',
      setIdx: 0,
      planned: { reps: 8, weight: 40, kind: 'warmup' },
      units: 'metric',
    });
    assert.deepEqual(out, { targetLabel: null, cite: null, empty: false });
  });

  it('stays quiet (not honest-empty) when the matched working set has 0 reps', () => {
    const hist = historyWith(
      'bench-press',
      [
        { reps: 8, weight: 60 },
        { reps: 0, weight: 60 },
      ],
      isoOnPreviousJsWeekday(4)
    );
    const out = resolveSetRowAdjacency({
      workoutHistory: hist,
      exerciseId: 'bench-press',
      setIdx: 1,
      planned,
      units: 'metric',
    });
    assert.deepEqual(out, { targetLabel: null, cite: null, empty: false });
  });

  it('formatSetRowAdjacency returns one row per planned set', () => {
    const hist = historyWith(
      'row',
      [
        { reps: 8, weight: 50 },
        { reps: 8, weight: 50 },
      ],
      isoOnPreviousJsWeekday(4)
    );
    const rows = formatSetRowAdjacency({
      workoutHistory: hist,
      exerciseId: 'row',
      sets: [
        { reps: 8, weight: 50 },
        { reps: 8, weight: 50 },
        { reps: 8, weight: 50 },
      ],
      units: 'metric',
    });
    assert.equal(rows.length, 3);
    assert.ok(rows[0]?.targetLabel);
    assert.equal(rows[0]?.empty, false);
    assert.ok(rows[2]?.cite && rows[2].cite.kind === 'logs');
  });
});

describe('lastLiveSessionForExercise', () => {
  it('skips warmup-only and 0-rep sessions as non-evidence', () => {
    const junkAt = isoOnPreviousJsWeekday(3);
    const liveAt = isoOnPreviousJsWeekday(1);
    const warmupOnly = historyWith(
      'bench-press',
      [{ reps: 8, weight: 40, kind: 'warmup' }],
      junkAt,
      { id: 'wu' }
    );
    const zeroRep = historyWith(
      'bench-press',
      [{ reps: 0, weight: 80 }],
      junkAt,
      { id: 'zero' }
    );
    const live = historyWith('bench-press', [{ reps: 8, weight: 60 }], liveAt, { id: 'live' });
    const found = lastLiveSessionForExercise([...warmupOnly, ...zeroRep, ...live], 'bench-press');
    assert.equal(found?.id, 'live');
  });
});

describe('formatAdjacencyCiteLine', () => {
  function t(key: string, opts?: Record<string, unknown>): string {
    return String(opts?.defaultValue ?? key);
  }

  it('formats a log cite as From last {day} · sets {range}', () => {
    const line = formatAdjacencyCiteLine(
      {
        kind: 'logs',
        weekdayMondayOffset: 1,
        weekdayShort: 'Tue',
        setFrom: 2,
        setTo: 4,
      },
      t
    );
    assert.equal(line, 'From last Tue · sets 2–4');
  });

  it('formats a single-set cite', () => {
    const line = formatAdjacencyCiteLine(
      {
        kind: 'logs',
        weekdayMondayOffset: 0,
        weekdayShort: 'Mon',
        setFrom: 2,
        setTo: 2,
      },
      t
    );
    assert.equal(line, 'From last Mon · set 2');
  });

  it('does not invent a Tuesday for a coach cite', () => {
    assert.equal(formatAdjacencyCiteLine({ kind: 'coach' }, t), 'Coach plan');
  });
});

describe('setRowAdjacency honesty', () => {
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

  it('derives the weekday from localDateKeyFromIso, never toISOString for a calendar date', () => {
    assert.match(code, /localDateKeyFromIso/);
    assert.doesNotMatch(code, /toISOString\(/);
  });

  it('drops tombstones — deletedAt is not a last session', () => {
    assert.match(code, /deletedAt/);
    assert.match(code, /lastLiveSessionForExercise/);
  });

  it('does not import freshness, readiness, or Recovery % — freshness never picks the lift', () => {
    assert.doesNotMatch(code, /from ['"]@\/lib\/readiness/);
    assert.doesNotMatch(code, /from ['"]@\/lib\/coach\/load/);
    assert.doesNotMatch(code, /readinessIndex/);
    assert.doesNotMatch(code, /Recovery %/);
  });

  it('never claims AI-suggested or optimized-for-you', () => {
    assert.doesNotMatch(code, /AI suggested|optimized for you/i);
  });

  it('does not steal Coach why-line or readiness', () => {
    assert.doesNotMatch(src, /sessionRationale/);
    assert.doesNotMatch(src, /PlanSessionCard/);
    assert.doesNotMatch(src, /from ['"]@\/lib\/readiness/);
    assert.doesNotMatch(src, /from ['"]@\/lib\/premium/);
  });

  it('does not print E-Adjacency on the door', () => {
    const gate = readFileSync(path.join(root, 'src/i18n/gateEn.ts'), 'utf8');
    assert.doesNotMatch(gate, /E-Adjacency/);
  });

  it('supersedes #487 surface — Train does not remount TARGET-above-PREVIOUS', () => {
    const table = readFileSync(
      path.join(root, 'src/components/workout/SetLogTable.tsx'),
      'utf8'
    );
    const card = readFileSync(
      path.join(root, 'src/components/workout/ActiveExerciseCard.tsx'),
      'utf8'
    );
    assert.doesNotMatch(table, /SetLogAdjacencyStack/);
    assert.doesNotMatch(card, /formatSetRowAdjacency/);
    assert.match(card, /resolveAfterCompleteCite/);
  });
});

describe('resolveAfterCompleteCite', () => {
  const plannedNext = [
    { reps: 8, weight: 60, completed: true, kind: 'normal' as const },
    { reps: 8, weight: 60, completed: false, kind: 'normal' as const },
  ];

  it('empty history does not invent a next set', () => {
    const out = resolveAfterCompleteCite({
      workoutHistory: [],
      exerciseId: 'bench-press',
      sessionSets: [
        { reps: 8, weight: 60, completed: false, kind: 'normal' },
        { reps: 8, weight: 60, completed: false, kind: 'normal' },
      ],
      completedSetIdx: 0,
      units: 'metric',
      lastRestSeconds: null,
    });
    assert.equal(out, null);
  });

  it('one logged set produces a skippable load cite from this session', () => {
    const out = resolveAfterCompleteCite({
      workoutHistory: [],
      exerciseId: 'bench-press',
      sessionSets: plannedNext,
      completedSetIdx: 0,
      units: 'metric',
      lastRestSeconds: null,
    });
    assert.ok(out);
    assert.equal(out?.suggestion.kind, 'load');
    if (out?.suggestion.kind !== 'load') return;
    assert.equal(out.suggestion.reps, 9);
    assert.equal(out.suggestion.weight, 60);
    assert.equal(out.cite.kind, 'session');
    if (out.cite.kind !== 'session') return;
    assert.equal(out.cite.setFrom, 1);
    assert.equal(out.cite.setTo, 1);
    const parts = formatAfterCompleteParts(out, (key, opts) =>
      String(opts?.defaultValue ?? key)
    );
    assert.equal(parts.target, '9 × 60');
    assert.match(parts.provenance, /this session/);
    assert.match(parts.line, /9 × 60/);
  });

  it('cites last session when history exists — not an invented weekday for today', () => {
    const hist = historyWith(
      'squat',
      [{ reps: 10, weight: 80 }],
      isoOnPreviousJsWeekday(1)
    );
    const out = resolveAfterCompleteCite({
      workoutHistory: hist,
      exerciseId: 'squat',
      sessionSets: [
        { reps: 10, weight: 80, completed: true, kind: 'normal' },
        { reps: 8, weight: 80, completed: false, kind: 'normal' },
      ],
      completedSetIdx: 0,
      units: 'metric',
      lastRestSeconds: null,
    });
    assert.ok(out);
    assert.equal(out?.suggestion.kind, 'load');
    if (out?.suggestion.kind !== 'load') return;
    assert.equal(out.suggestion.reps, 11);
    assert.equal(out.suggestion.weight, 80);
    assert.equal(out.cite.kind, 'logs');
    if (out.cite.kind !== 'logs') return;
    assert.equal(out.cite.weekdayShort, 'Mon');
  });

  it('stays quiet on a warmup complete', () => {
    const out = resolveAfterCompleteCite({
      workoutHistory: [],
      exerciseId: 'bench-press',
      sessionSets: [
        { reps: 8, weight: 40, completed: true, kind: 'warmup' },
        { reps: 8, weight: 60, completed: false, kind: 'normal' },
      ],
      completedSetIdx: 0,
      units: 'metric',
      lastRestSeconds: 90,
    });
    assert.equal(out, null);
  });

  it('cites last rest when this exercise has no next set', () => {
    const out = resolveAfterCompleteCite({
      workoutHistory: [],
      exerciseId: 'bench-press',
      sessionSets: [{ reps: 8, weight: 60, completed: true, kind: 'normal' }],
      completedSetIdx: 0,
      units: 'metric',
      lastRestSeconds: 150,
    });
    assert.deepEqual(out, {
      suggestion: { kind: 'rest', seconds: 150 },
      cite: { kind: 'last-rest' },
    });
    const parts = formatAfterCompleteParts(
      out!,
      (key, opts) => String(opts?.defaultValue ?? key),
      '2:30'
    );
    assert.equal(parts.target, 'Rest 2:30');
    assert.equal(parts.provenance, 'Last rest');
  });

  it('does not invent rest from a missing last-rest', () => {
    const out = resolveAfterCompleteCite({
      workoutHistory: [],
      exerciseId: 'bench-press',
      sessionSets: [{ reps: 8, weight: 60, completed: true, kind: 'normal' }],
      completedSetIdx: 0,
      units: 'metric',
      lastRestSeconds: null,
    });
    assert.equal(out, null);
  });

  it('prescribed next row cites Coach plan, not a fake Tuesday', () => {
    const hist = historyWith(
      'bench-press',
      [{ reps: 8, weight: 60 }],
      isoOnPreviousJsWeekday(2)
    );
    const out = resolveAfterCompleteCite({
      workoutHistory: hist,
      exerciseId: 'bench-press',
      sessionSets: [
        { reps: 5, weight: 100, completed: true, kind: 'normal' },
        { reps: 5, weight: 100, completed: false, kind: 'normal' },
      ],
      completedSetIdx: 0,
      prescribed: true,
      units: 'metric',
      lastRestSeconds: null,
    });
    assert.deepEqual(out, {
      suggestion: { kind: 'load', reps: 5, weight: 100 },
      cite: { kind: 'coach' },
    });
  });
});
