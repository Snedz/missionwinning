import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';
import type { CompletedWorkoutLog, SavedWorkout, WorkoutExerciseTemplate } from '@/types';
import { resolveTodayComposeTemplate } from './writeTodayComposeSession.ts';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

function sets(
  exerciseId: string,
  rows: { reps: number; weight: number }[]
): WorkoutExerciseTemplate {
  return { exerciseId, sets: rows };
}

function log(
  over: Partial<CompletedWorkoutLog> & Pick<CompletedWorkoutLog, 'id' | 'workoutName'>
): CompletedWorkoutLog {
  const now = Date.now();
  return {
    startedAt: new Date(now - 3_600_000).toISOString(),
    completedAt: new Date(now - 1_800_000).toISOString(),
    durationSeconds: 1800,
    totalVolume: 1000,
    exercises: [
      {
        exerciseId: 'barbell-squat',
        sets: [{ reps: 5, weight: 100, completed: true }],
      },
    ],
    ...over,
  };
}

describe('resolveTodayComposeTemplate', () => {
  it('honors a saved routine before Just Go', () => {
    const saved: SavedWorkout[] = [
      {
        id: 's-push',
        name: 'Push',
        createdAt: new Date().toISOString(),
        exercises: [sets('bench-press', [{ reps: 5, weight: 80 }])],
      },
    ];
    const next = resolveTodayComposeTemplate({
      history: [],
      saved,
      equipment: 'full-gym',
    });
    assert.equal(next.source, 'saved');
    assert.equal(next.name, 'Push');
    assert.equal(next.exercises[0]?.exerciseId, 'bench-press');
  });

  it('Just Go carries last loads from history', () => {
    const history = [
      log({
        id: 'h1',
        workoutName: 'Legs',
        exercises: [
          {
            exerciseId: 'barbell-squat',
            sets: [{ reps: 5, weight: 120, completed: true }],
          },
        ],
      }),
    ];
    const next = resolveTodayComposeTemplate({
      history,
      saved: [],
      equipment: 'full-gym',
    });
    assert.ok(next.exercises.length > 0, 'Just Go must have lifts');
    const squat = next.exercises.find((ex) => ex.exerciseId === 'barbell-squat');
    if (squat) {
      assert.ok(
        squat.sets.some((row) => row.weight === 120 || row.weight > 0),
        'last squat load must ride the set row'
      );
    }
  });

  it('cold history still returns exercises — never an empty restore', () => {
    const next = resolveTodayComposeTemplate({
      history: [],
      saved: [],
      equipment: 'full-gym',
    });
    assert.ok(next.exercises.length > 0);
    assert.ok(next.exercises[0]?.sets.length);
  });
});

describe('writeTodayComposeSession wiring', () => {
  it('Start writes the session before opening Train', () => {
    const desk = read('src/page-components/TodayDesk.tsx');
    const handle = desk.slice(desk.indexOf('const handleStart'), desk.indexOf('const sessionTitle'));
    assert.match(handle, /writeTodayComposeSession\(\)/);
    assert.ok(
      handle.indexOf('writeTodayComposeSession') < handle.indexOf("router.push('/active')"),
      'write must happen before navigate'
    );
    assert.match(desk, /runTodayPrimaryAction\(/);
  });

  it('second-bar Start writes before /active', () => {
    const second = read('src/components/house/HouseSecondRail.tsx');
    assert.match(second, /writeTodayComposeSession\(\)/);
    assert.match(second, /preventDefault/);
    assert.match(second, /row\.id === 'start'/);
  });

  it('/active seeds in useLayoutEffect — hydrate does not own the canvas', () => {
    const active = read('src/page-components/ActiveWorkoutPage.tsx');
    assert.match(active, /useLayoutEffect/);
    assert.match(active, /writeTodayComposeSession\(\)/);
    assert.match(active, /paintTodayComposeWorkout/);
    const layoutStart = active.indexOf('useLayoutEffect(() =>');
    const hydrateStart = active.indexOf('useEffect(() => {\n    if (!hasHydrated) return;');
    assert.ok(layoutStart > 0 && hydrateStart > layoutStart, 'layout seed is before hydrate reconcile');
    const layout = active.slice(layoutStart, hydrateStart);
    assert.doesNotMatch(layout, /hasHydrated/);
    assert.doesNotMatch(layout, /await reconcileOpenSession/);
  });

  it('reconcile after hydrate re-seeds an empty canvas, even with a pending remote', () => {
    const active = read('src/page-components/ActiveWorkoutPage.tsx');
    const hydrate = active.slice(
      active.indexOf('useEffect(() => {\n    if (!hasHydrated) return;'),
      active.indexOf('const seoExerciseConsumed')
    );
    assert.match(hydrate, /await reconcileOpenSession/);
    assert.match(hydrate, /hasLoggedWork\(store\.activeWorkout\)/);
    assert.match(hydrate, /hasComposeExercises\(store\.activeWorkout\)/);
    assert.match(hydrate, /writeTodayComposeSession\(\)/);
    assert.doesNotMatch(hydrate, /pendingRemoteOpenSession\) return/);
  });

  it('writeTodayComposeSession replaces a no-lift session', () => {
    const src = read('src/lib/workout/writeTodayComposeSession.ts');
    assert.match(src, /hasLoggedWork\(live\) \|\| hasComposeExercises\(live\)/);
    assert.doesNotMatch(
      src,
      /if \(store\.activeWorkout\) return true/,
      'an empty activeWorkout must not block Just Go'
    );
  });
});

