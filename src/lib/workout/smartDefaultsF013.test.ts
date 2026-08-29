/**
 * F-013 / `.946` — last working load/reps prefilled on the next set.
 *
 * Gym speed: the dial starts from the last same-exercise working set.
 * Empty history is empty — no fake 10, no program bump. Cite / ghost / Prev
 * stay their own lanes; this file must not remount TARGET-above-PREVIOUS.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { CompletedWorkoutLog } from '@/types';
import {
  lastWorkingForDial,
  resolveActiveSetDial,
  resolveSetInput,
} from './activeWorkoutHelpers.ts';
import { resolveLastSetGhost } from './lastSetGhost.ts';
import { consoleMatchesTarget } from './loggerSpeed.ts';

const root = join(import.meta.dirname, '..', '..', '..');
const read = (...parts: string[]) => readFileSync(join(root, ...parts), 'utf8');

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

function logWith(
  exerciseId: string,
  sets: { reps: number; weight: number; kind?: string }[],
  over: Partial<CompletedWorkoutLog> = {}
): CompletedWorkoutLog {
  return {
    id: over.id ?? 'h1',
    workoutName: over.workoutName ?? 'Past',
    startedAt: over.startedAt ?? isoDaysAgo(2),
    completedAt: over.completedAt ?? isoDaysAgo(2),
    durationSeconds: 3600,
    totalVolume: 100,
    deletedAt: over.deletedAt,
    exercises: [
      {
        exerciseId,
        sets: sets.map((s) => ({
          id: `${s.kind ?? 'n'}-${s.weight}-${s.reps}`,
          reps: s.reps,
          weight: s.weight,
          completed: true,
          kind: (s.kind ?? 'normal') as 'normal' | 'warmup' | 'failure' | 'drop',
        })),
      },
    ],
  } as CompletedWorkoutLog;
}

test('empty history does not invent a default', () => {
  const empty = resolveActiveSetDial({
    prescribed: false,
    defaultReps: 10,
    defaultWeight: 0,
    sets: [{ completed: false, reps: 10, weight: 0 }],
    setIdx: 0,
    lastSets: null,
    units: 'metric',
    repMin: 8,
    repMax: 12,
    lastPerformance: lastWorkingForDial([], 'bench-press'),
  });
  assert.deepEqual(empty, { reps: 0, weight: 0 });
  assert.equal(lastWorkingForDial([], 'bench-press'), null);
  assert.equal(resolveLastSetGhost([], 'bench-press'), null);

  const invented = resolveSetInput({
    defaultReps: 10,
    defaultWeight: 0,
    prescribed: false,
    suggestion: { reps: 9, weight: 80 },
  });
  assert.deepEqual(invented, { reps: 0, weight: 0 });
});

test('warmup-only history is first-ever (empty dial, no ghost)', () => {
  const history = [logWith('bench-press', [{ reps: 10, weight: 40, kind: 'warmup' }])];
  const last = lastWorkingForDial(history, 'bench-press');
  assert.equal(last, null);
  const out = resolveActiveSetDial({
    prescribed: false,
    defaultReps: 10,
    defaultWeight: 0,
    sets: [{ completed: false, reps: 10, weight: 0, kind: 'normal' }],
    setIdx: 0,
    lastSets: [{ reps: 10, weight: 40 }],
    units: 'metric',
    repMin: 8,
    repMax: 12,
    lastPerformance: last,
  });
  assert.deepEqual(out, { reps: 0, weight: 0 });
});

test('one prior working set prefills and stays editable', () => {
  const history = [
    logWith('bench-press', [
      { reps: 10, weight: 40, kind: 'warmup' },
      { reps: 5, weight: 80, kind: 'normal' },
    ]),
  ];
  const last = lastWorkingForDial(history, 'bench-press');
  assert.deepEqual(last, { reps: 5, weight: 80 });

  const prefill = resolveActiveSetDial({
    prescribed: false,
    defaultReps: 10,
    defaultWeight: 0,
    sets: [{ completed: false, reps: 10, weight: 0 }],
    setIdx: 0,
    lastSets: [
      { reps: 10, weight: 40 },
      { reps: 5, weight: 80 },
    ],
    units: 'metric',
    repMin: 8,
    repMax: 12,
    lastPerformance: last,
  });
  assert.deepEqual(prefill, { reps: 5, weight: 80 });
  assert.equal(consoleMatchesTarget(prefill.reps, prefill.weight, last), true);

  const edited = resolveActiveSetDial({
    manual: { reps: 3, weight: 90 },
    prescribed: false,
    defaultReps: 10,
    defaultWeight: 0,
    sets: [{ completed: false, reps: 10, weight: 0 }],
    setIdx: 0,
    lastSets: [{ reps: 5, weight: 80 }],
    units: 'metric',
    repMin: 8,
    repMax: 12,
    lastPerformance: last,
  });
  assert.deepEqual(edited, { reps: 3, weight: 90 });
});

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

test('LogConsole: one house leftover Log set ≥44px; reps/weight expose prefill values', () => {
  const src = read('src/components/workout/LogConsole.tsx');
  const primaries = src.match(/primary-action/g) || [];
  assert.equal(primaries.length, 1, 'exactly one confirm (Log set)');
  assert.match(src, /log-console-log-set/);
  assert.match(src, /min-h-\[52px\]/);
  assert.match(src, /testId="log-console-reps"/);
  assert.match(src, /log-console-weight/);
  assert.match(src, /data-testid=\{testId\}/);
  const logSet = src.slice(
    src.indexOf('data-testid="log-console-log-set"'),
    src.indexOf('data-testid="log-console-log-set"') + 400
  );
  assert.match(logSet, /house-btn house-btn-primary house-set-log/);
  assert.doesNotMatch(logSet, /accent-poster/);
});

test('cite / ghost / Prev are not remounted as a second Prev', () => {
  const table = read('src/components/workout/SetLogTable.tsx');
  const helpers = read('src/lib/workout/activeWorkoutHelpers.ts');
  const page = read('src/page-components/ActiveWorkoutPage.tsx');
  assert.doesNotMatch(table, /SetLogAdjacencyStack/);
  assert.match(table, /LastSetGhostButton/);
  assert.match(helpers, /formatPrevSetLabels/);
  assert.match(helpers, /lastWorkingForDial/);
  assert.match(page, /lastWorkingForDial\(/);
  assert.doesNotMatch(helpers, /from ['"]@\/lib\/workout\/sessionE1rm/);
  assert.doesNotMatch(helpers, /from ['"]@\/lib\/workout\/victoryReceipt/);
  assert.doesNotMatch(page, /from ['"]@\/page-components\/HomePage/);
});

test('resolveSetInput does not apply a program bump on the dial', () => {
  const src = read('src/lib/workout/activeWorkoutHelpers.ts');
  const fn = src.slice(src.indexOf('export function resolveSetInput'));
  const body = fn.slice(0, fn.indexOf('\nexport function formatLoggedSetLine'));
  assert.doesNotMatch(body, /if \(suggestion\)/);
  assert.match(body, /return \{ reps: 0, weight: 0 \}/);
});
