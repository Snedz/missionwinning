import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { parseOptionalRpe10, RPE10_MAX, RPE10_MIN, RPE10_VALUES } from '@/lib/workout/rpe10';
import { sessionLoad } from '@/lib/coach/load';
import type { CompletedWorkoutLog } from '@/types';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');
const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');

test('parseOptionalRpe10 accepts integer 1–10 and treats empty as unset', () => {
  assert.equal(parseOptionalRpe10(undefined), undefined);
  assert.equal(parseOptionalRpe10(null), undefined);
  assert.equal(parseOptionalRpe10(''), undefined);
  assert.equal(parseOptionalRpe10('  '), undefined);
  for (const n of RPE10_VALUES) {
    assert.equal(parseOptionalRpe10(n), n, `${n} must survive`);
    assert.equal(parseOptionalRpe10(String(n)), n, `"${n}" must survive`);
  }
  assert.equal(RPE10_MIN, 1);
  assert.equal(RPE10_MAX, 10);
  assert.equal(parseOptionalRpe10(1), 1, '1 is a real rating, not empty');
});

test('parseOptionalRpe10 rejects out-of-range, non-integers, and NaN', () => {
  assert.equal(parseOptionalRpe10(0), undefined);
  assert.equal(parseOptionalRpe10(11), undefined);
  assert.equal(parseOptionalRpe10(8.5), undefined);
  assert.equal(parseOptionalRpe10(-1), undefined);
  assert.equal(parseOptionalRpe10(NaN), undefined);
  assert.equal(parseOptionalRpe10('foo'), undefined);
  assert.equal(parseOptionalRpe10(true), undefined);
  assert.equal(parseOptionalRpe10({}), undefined);
});

test('session load is unchanged when rpe10 is present — no scoreboard from 1–10', () => {
  const base = {
    id: 'w-rpe10',
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
  const nine: CompletedWorkoutLog = {
    ...base,
    exercises: [
      { exerciseId: 'bench-press', sets: [{ reps: 5, weight: 100, rpe: 'hard', rpe10: 9 }] },
    ],
  };
  const one: CompletedWorkoutLog = {
    ...base,
    exercises: [
      { exerciseId: 'bench-press', sets: [{ reps: 5, weight: 100, rpe: 'hard', rpe10: 1 }] },
    ],
  };
  assert.deepEqual(sessionLoad(nine), sessionLoad(none));
  assert.deepEqual(sessionLoad(one), sessionLoad(none));
});

test('completed set rows expose optional RPE 1–10; Log set does not require it', () => {
  const row = stripComments(read('src/components/workout/SetLogRow.tsx'));
  const table = stripComments(read('src/components/workout/SetLogTable.tsx'));
  const consoleSrc = stripComments(read('src/components/workout/LogConsole.tsx'));
  const store = stripComments(read('src/store/workoutStore.ts'));

  assert.match(row, /SetRpe10Select/, 'compact completed row must offer RPE 1–10');
  assert.match(table, /SetRpe10Select/, 'live completed row must offer RPE 1–10');
  assert.doesNotMatch(
    consoleSrc,
    /rpe10|SetRpe10Select/i,
    'first paint stays load/reps — LogConsole must not collect rpe10'
  );
  assert.match(
    store,
    /get\(\)\.logSet\(exerciseIndex, setIndex, reps, weight, undefined, isPr\)/,
    'log path must still leave ratings unstamped'
  );
  const implStart = store.indexOf(
    'logSetAndAdvance: (exerciseIndex, setIndex, reps, weight, isPr) =>'
  );
  assert.ok(implStart > 0, 'could not find logSetAndAdvance implementation');
  const impl = store.slice(implStart, implStart + 280);
  assert.doesNotMatch(impl, /rateSetRpe10|rpe10/, 'rpe10 must not be auto-stamped on log');
});
