import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { CompletedWorkoutLog } from '@/types';
import {
  appendKnownMaxPctCite,
  formatKnownMaxPct,
  knownMaxFromHistory,
  loadPctOfKnownMax,
  parseOptionalLoadPct,
  weightFromKnownMaxPct,
} from '@/lib/workout/setRowPercent';
import { formatAfterCompleteParts } from '@/lib/workout/setRowAdjacency';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');
const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');

function log(
  exerciseId: string,
  sets: { reps: number; weight: number; kind?: 'warmup' | 'normal' | 'drop' | 'failure' }[],
  over: Partial<CompletedWorkoutLog> = {}
): CompletedWorkoutLog {
  return {
    id: 'l1',
    workoutName: 'T',
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    durationSeconds: 600,
    totalVolume: 100,
    exercises: [{ exerciseId, sets }],
    ...over,
  };
}

describe('parseOptionalLoadPct', () => {
  it('accepts 1–100 and notebook one-decimal waves', () => {
    assert.equal(parseOptionalLoadPct(undefined), undefined);
    assert.equal(parseOptionalLoadPct(null), undefined);
    assert.equal(parseOptionalLoadPct(''), undefined);
    assert.equal(parseOptionalLoadPct('  '), undefined);
    assert.equal(parseOptionalLoadPct(80), 80);
    assert.equal(parseOptionalLoadPct('80'), 80);
    assert.equal(parseOptionalLoadPct('80%'), 80);
    assert.equal(parseOptionalLoadPct(76.5), 76.5);
    assert.equal(parseOptionalLoadPct('76.5'), 76.5);
    assert.equal(parseOptionalLoadPct(1), 1);
    assert.equal(parseOptionalLoadPct(100), 100);
  });

  it('drops empty, zero, out of range, and extra decimals — never clamps', () => {
    assert.equal(parseOptionalLoadPct(0), undefined);
    assert.equal(parseOptionalLoadPct(101), undefined);
    assert.equal(parseOptionalLoadPct(-1), undefined);
    assert.equal(parseOptionalLoadPct(76.55), undefined);
    assert.equal(parseOptionalLoadPct(NaN), undefined);
    assert.equal(parseOptionalLoadPct('foo'), undefined);
    assert.equal(parseOptionalLoadPct(true), undefined);
    assert.equal(parseOptionalLoadPct({}), undefined);
  });
});

describe('knownMaxFromHistory', () => {
  it('returns the logged 1-rep working set', () => {
    assert.equal(
      knownMaxFromHistory('bench-press', [
        log('bench-press', [{ reps: 1, weight: 100 }]),
      ]),
      100
    );
  });

  it('one multi-rep set invents nothing', () => {
    assert.equal(
      knownMaxFromHistory('bench-press', [
        log('bench-press', [{ reps: 5, weight: 80 }]),
      ]),
      null
    );
  });

  it('warmup / failure / tombstone / empty invent nothing', () => {
    const tomb = log('bench-press', [{ reps: 1, weight: 140 }]);
    tomb.deletedAt = new Date().toISOString();
    assert.equal(
      knownMaxFromHistory('bench-press', [
        log('bench-press', [{ reps: 1, weight: 100, kind: 'warmup' }]),
      ]),
      null
    );
    assert.equal(
      knownMaxFromHistory('bench-press', [
        log('bench-press', [{ reps: 1, weight: 100, kind: 'failure' }]),
      ]),
      null
    );
    assert.equal(knownMaxFromHistory('bench-press', [tomb]), null);
    assert.equal(knownMaxFromHistory('bench-press', []), null);
    assert.equal(knownMaxFromHistory('', [log('bench-press', [{ reps: 1, weight: 100 }])]), null);
  });

  it('keeps the heaviest live single', () => {
    assert.equal(
      knownMaxFromHistory('squat', [
        log('squat', [{ reps: 1, weight: 140 }]),
        log('squat', [{ reps: 1, weight: 160 }]),
      ]),
      160
    );
  });

  it('does not import estimated max helpers', () => {
    const src = stripComments(read('src/lib/workout/setRowPercent.ts'));
    assert.doesNotMatch(src, /workingMaxFromHistory|estimate1rm|epley1rm/);
  });
});

describe('weightFromKnownMaxPct / loadPctOfKnownMax', () => {
  it('types 80% against a known max and gets a load', () => {
    assert.equal(weightFromKnownMaxPct(100, 80, 'metric'), 80);
    assert.equal(loadPctOfKnownMax(100, 80), 80);
  });

  it('no max invents no load', () => {
    assert.equal(weightFromKnownMaxPct(null, 80, 'metric'), undefined);
    assert.equal(weightFromKnownMaxPct(0, 80, 'metric'), undefined);
    assert.equal(weightFromKnownMaxPct(100, undefined, 'metric'), undefined);
    assert.equal(loadPctOfKnownMax(null, 80), null);
    assert.equal(loadPctOfKnownMax(100, 0), null);
  });
});

describe('cite tokens', () => {
  it('formats and appends only when a percent exists', () => {
    assert.equal(formatKnownMaxPct(80), '80%');
    assert.equal(formatKnownMaxPct(76.5), '76.5%');
    assert.equal(formatKnownMaxPct(undefined), null);
    assert.equal(appendKnownMaxPctCite('5 × 80', 80), '5 × 80 · 80%');
    assert.equal(appendKnownMaxPctCite('5 × 80', null), '5 × 80');
    assert.equal(appendKnownMaxPctCite('', 80), '80%');
  });

  it('after-complete load cite appends % of known max; rest stays rest', () => {
    const load = formatAfterCompleteParts(
      {
        suggestion: { kind: 'load', reps: 5, weight: 80 },
        cite: { kind: 'session', setFrom: 1, setTo: 1 },
      },
      (_key, opts) => String(opts?.defaultValue ?? _key),
      undefined,
      100
    );
    assert.match(load.target, /5 × 80/);
    assert.match(load.target, /80%/);
    const noMax = formatAfterCompleteParts(
      {
        suggestion: { kind: 'load', reps: 5, weight: 80 },
        cite: { kind: 'session', setFrom: 1, setTo: 1 },
      },
      (_key, opts) => String(opts?.defaultValue ?? _key)
    );
    assert.equal(noMax.target, '5 × 80');
    assert.doesNotMatch(noMax.target, /%/);
    const rest = formatAfterCompleteParts(
      {
        suggestion: { kind: 'rest', seconds: 90 },
        cite: { kind: 'last-rest' },
      },
      (_key, opts) => String(opts?.defaultValue ?? _key),
      '1:30',
      100
    );
    assert.match(rest.target, /Rest/);
    assert.doesNotMatch(rest.target, /%/);
  });
});

describe('surfaces and log path', () => {
  it('live table offers an optional % field; Log set does not require it', () => {
    const table = stripComments(read('src/components/workout/SetLogTable.tsx'));
    const store = stripComments(read('src/store/workoutStore.ts'));
    assert.match(table, /set-table-load-pct|activeSetPct/);
    assert.match(
      store,
      /get\(\)\.logSet\(exerciseIndex, setIndex, reps, weight, undefined, isPr/,
      'log path must still leave percent unstamped'
    );
    const implStart = store.indexOf(
      'logSetAndAdvance: (exerciseIndex, setIndex, reps, weight, isPr'
    );
    assert.ok(implStart > 0, 'could not find logSetAndAdvance implementation');
    const impl = store.slice(implStart, implStart + 280);
    assert.doesNotMatch(impl, /setSetLoadPct|loadPct/, 'must not invent percent on log');
  });

  it('helper and row stay free of premium / social / rewards', () => {
    const helper = stripComments(read('src/lib/workout/setRowPercent.ts'));
    const table = stripComments(read('src/components/workout/SetLogTable.tsx'));
    for (const src of [helper, table]) {
      assert.doesNotMatch(src, /from\s+['"]@\/lib\/rewards/);
      assert.doesNotMatch(src, /from\s+['"]@\/lib\/social/);
      assert.doesNotMatch(src, /usePremium|trial|leaderboard|Force Sync|Session Expired/);
    }
  });

  it('Today / door / Fuel do not import set-row percent', () => {
    const surfaces = [
      'src/page-components/HomePage.tsx',
      'src/page-components/HomeTodayLean.tsx',
      'src/page-components/HomeTodayDashboard.tsx',
      'src/page-components/NutritionPage.tsx',
      'app/private/PrivateTeaserClient.tsx',
    ];
    for (const rel of surfaces) {
      const src = read(rel);
      assert.doesNotMatch(src, /from\s+['"]@\/lib\/workout\/setRowPercent['"]/, rel);
      assert.doesNotMatch(src, /knownMaxFromHistory|set-table-load-pct/, rel);
      assert.doesNotMatch(src, /primary-action[\s\S]*primary-action[\s\S]*primary-action/, rel);
    }
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.match(lean, /dock="start"/);
    assert.doesNotMatch(lean, /from\s+['"]@\/lib\/workout\/superset['"]/);
  });
});
