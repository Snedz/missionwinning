/**
 * F-013 / MatrAIx — last load/reps prefilled on the next set.
 *
 * Gym speed: after set 1 is logged, set 2's dial already holds those numbers
 * so Log set is one ≥44px confirm. Composes with E-Adjacency (target above
 * PREVIOUS + cite) — this file must not rewrite SetLogTable.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  resolveActiveSetDial,
  resolveSetInput,
} from './activeWorkoutHelpers.ts';
import { consoleMatchesTarget } from './loggerSpeed.ts';

const root = join(import.meta.dirname, '..', '..', '..');
const read = (...parts: string[]) => readFileSync(join(root, ...parts), 'utf8');

test('second set dial equals last logged load/reps (freestyle + prescribed)', () => {
  const logged = { reps: 8, weight: 62.5 };
  const freestyle = resolveActiveSetDial({
    prescribed: false,
    defaultReps: 10,
    defaultWeight: 0,
    sets: [
      { completed: true, ...logged },
      { completed: false, reps: 10, weight: 0 },
    ],
    setIdx: 1,
    lastSets: [{ reps: 6, weight: 55 }],
    units: 'metric',
    repMin: 8,
    repMax: 12,
    lastPerformance: { reps: 6, weight: 55 },
  });
  const prescribed = resolveActiveSetDial({
    prescribed: true,
    defaultReps: 5,
    defaultWeight: 100,
    sets: [
      { completed: true, ...logged },
      { completed: false, reps: 5, weight: 100 },
    ],
    setIdx: 1,
    lastSets: [{ reps: 5, weight: 100 }],
    units: 'metric',
    repMin: 5,
    repMax: 5,
    lastPerformance: { reps: 5, weight: 100 },
  });
  assert.deepEqual(freestyle, logged);
  assert.deepEqual(prescribed, { reps: 5, weight: 100 });
  assert.equal(consoleMatchesTarget(freestyle.reps, freestyle.weight, logged), true);
});

test('set 1 of a prescribed exercise still prefills the plan, not last week', () => {
  const out = resolveSetInput({
    prescribed: true,
    defaultReps: 5,
    defaultWeight: 100,
    sessionCarry: null,
    suggestion: { reps: 6, weight: 102.5 },
    lastPerformance: { reps: 5, weight: 97.5 },
  });
  assert.deepEqual(out, { reps: 5, weight: 100 });
});

test('manual edit still beats session carry', () => {
  const out = resolveSetInput({
    manual: { reps: 3, weight: 120 },
    prescribed: true,
    defaultReps: 5,
    defaultWeight: 100,
    sessionCarry: { reps: 8, weight: 62.5 },
  });
  assert.deepEqual(out, { reps: 3, weight: 120 });
});

test('LogConsole: one poster-red Log set ≥44px; reps/weight expose prefill values', () => {
  const src = read('src/components/workout/LogConsole.tsx');
  const primaries = src.match(/primary-action/g) || [];
  assert.equal(primaries.length, 1, 'exactly one confirm (Log set)');
  assert.match(src, /log-console-log-set/);
  assert.match(src, /min-h-\[52px\]/);
  assert.match(src, /testId="log-console-reps"/);
  assert.match(src, /log-console-weight/);
  assert.match(src, /data-testid=\{testId\}/);
  assert.match(src, /accent-poster/);
});

test('resolveSetInput checks session carry before prescription (F-013 order)', () => {
  const src = read('src/lib/workout/activeWorkoutHelpers.ts');
  const fn = src.slice(src.indexOf('export function resolveSetInput'));
  const body = fn.slice(0, fn.indexOf('\nexport function formatLoggedSetLine'));
  const carry = body.indexOf('if (sessionCarry)');
  const prescribed = body.indexOf('if (prescribed)');
  assert.ok(carry >= 0, 'sessionCarry branch missing');
  assert.ok(prescribed >= 0, 'prescribed branch missing');
  assert.ok(
    prescribed < carry,
    'prescribed sessions echo the plan template; session carry is freestyle-only'
  );
});
