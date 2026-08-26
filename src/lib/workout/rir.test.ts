import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { parseOptionalRir, RIR_MAX, RIR_MIN, RIR_VALUES } from '@/lib/workout/rir';
import { sessionLoad } from '@/lib/coach/load';
import type { CompletedWorkoutLog } from '@/types';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');
const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');

test('parseOptionalRir accepts integer 0–5 and treats empty as unset', () => {
  assert.equal(parseOptionalRir(undefined), undefined);
  assert.equal(parseOptionalRir(null), undefined);
  assert.equal(parseOptionalRir(''), undefined);
  assert.equal(parseOptionalRir('  '), undefined);
  for (const n of RIR_VALUES) {
    assert.equal(parseOptionalRir(n), n, `${n} must survive`);
    assert.equal(parseOptionalRir(String(n)), n, `"${n}" must survive`);
  }
  assert.equal(RIR_MIN, 0);
  assert.equal(RIR_MAX, 5);
});

test('parseOptionalRir rejects out-of-range, non-integers, and NaN', () => {
  assert.equal(parseOptionalRir(6), undefined);
  assert.equal(parseOptionalRir(-1), undefined);
  assert.equal(parseOptionalRir(2.5), undefined);
  assert.equal(parseOptionalRir(NaN), undefined);
  assert.equal(parseOptionalRir('foo'), undefined);
  assert.equal(parseOptionalRir(true), undefined);
  assert.equal(parseOptionalRir({}), undefined);
});

test('session load is unchanged when RIR is present — no scoreboard from reserve', () => {
  const base = {
    id: 'w-rir',
    workoutName: 'Push',
    startedAt: '2026-08-13T10:00:00Z',
    completedAt: '2026-08-13T11:00:00Z',
    durationSeconds: 3600,
    deletedAt: null,
    totalVolume: 500,
  };
  const none: CompletedWorkoutLog = {
    ...base,
    exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 100, rpe: 'hard' }] }],
  };
  const zero: CompletedWorkoutLog = {
    ...base,
    exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 100, rpe: 'hard', rir: 0 }] }],
  };
  const five: CompletedWorkoutLog = {
    ...base,
    exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 100, rpe: 'hard', rir: 5 }] }],
  };
  assert.deepEqual(sessionLoad(zero), sessionLoad(none));
  assert.deepEqual(sessionLoad(five), sessionLoad(none));
});

test('completed set rows expose optional RIR; Log set does not require it', () => {
  const row = stripComments(read('src/components/workout/SetLogRow.tsx'));
  const table = stripComments(read('src/components/workout/SetLogTable.tsx'));
  const consoleSrc = stripComments(read('src/components/workout/LogConsole.tsx'));
  const store = stripComments(read('src/store/workoutStore.ts'));

  assert.match(row, /SetRirSelect/, 'compact completed row must offer RIR beside RPE');
  assert.match(table, /SetRirSelect/, 'desktop completed row must offer RIR beside RPE');
  assert.doesNotMatch(
    consoleSrc,
    /\brir\b/i,
    'first paint stays load/reps — LogConsole must not collect RIR'
  );
  assert.match(
    store,
    /get\(\)\.logSet\(exerciseIndex, setIndex, reps, weight, undefined, isPr(?:, durationSeconds)?\)/,
    'log path must still leave ratings unstamped'
  );
  const implStart = store.indexOf(
    'logSetAndAdvance: (exerciseIndex, setIndex, reps, weight, isPr, durationSeconds) =>'
  );
  assert.ok(implStart > 0, 'could not find logSetAndAdvance implementation');
  const impl = store.slice(implStart, implStart + 280);
  assert.doesNotMatch(impl, /rateSetRir|\brir\b/, 'RIR must not be auto-stamped on log');
});
