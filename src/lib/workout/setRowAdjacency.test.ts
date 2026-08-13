import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { CompletedWorkoutLog } from '@/types';
import {
  formatAdjacencyCiteLine,
  formatSetRowAdjacency,
  lastLiveSessionForExercise,
  resolveSetRowAdjacency,
} from '@/lib/workout/setRowAdjacency';

const src = readFileSync(path.join(import.meta.dirname, 'setRowAdjacency.ts'), 'utf8');

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
});
