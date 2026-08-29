/**
 * /active first paint Log set does not wait on persist.
 * nextSet comes from the painted compose, not from a hydrated store.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { ActiveWorkout } from '@/types';
import { composeNextSet } from './writeTodayComposeSession.ts';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

function sliceFromTestId(src: string, testId: string, chars = 360): string {
  const needle = `data-testid="${testId}"`;
  const start = src.indexOf(needle);
  assert.ok(start >= 0, `missing ${needle}`);
  return src.slice(start, start + chars);
}

test('/active nextSet is composeNextSet — persist does not own first paint', () => {
  const page = read('src/page-components/ActiveWorkoutPage.tsx');
  assert.match(page, /composeNextSet\(activeWorkout\)/);
  assert.doesNotMatch(
    page,
    /activeWorkout \? findNextSet\(activeWorkout\.exercises\) : null/,
    'nextSet must not wait for a hydrated store'
  );
});

test('composeNextSet(null) is the first painted set — no persist', () => {
  const next = composeNextSet(null);
  assert.deepEqual(next, { exIdx: 0, setIdx: 0 });
  assert.deepEqual(composeNextSet(undefined), { exIdx: 0, setIdx: 0 });
});

test('composeNextSet uses the live session when it already has lifts', () => {
  const live: ActiveWorkout = {
    workoutName: 'Live',
    startedAt: '2026-01-01T00:00:00.000Z',
    exercises: [
      {
        exerciseId: 'bench-press',
        sets: [
          { reps: 5, weight: 80, completed: true },
          { reps: 5, weight: 80, completed: false },
        ],
      },
    ],
  };
  assert.deepEqual(composeNextSet(live), { exIdx: 0, setIdx: 1 });
});

test('DESIGN names Log set first paint does not wait on persist', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /Log set first paint does not wait on persist/);
});

test('Finish / Skip / Swap / Form guide / Repeat last never house-btn-primary', () => {
  const finish = sliceFromTestId(
    read('src/components/workout/ActiveSessionChrome.tsx'),
    'active-finish'
  );
  assert.doesNotMatch(finish, /house-btn-primary/);

  const header = read('src/components/workout/ActiveExerciseHeader.tsx');
  for (const id of [
    'active-skip-exercise',
    'active-swap-exercise',
    'active-form-guide',
    'active-repeat-last',
  ] as const) {
    const slice = sliceFromTestId(header, id);
    assert.doesNotMatch(slice, /house-btn-primary/, id);
  }
});
