/**
 * A set can save with no place. GPS never gates the logger.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

const storageMap = new Map<string, string>();
(globalThis as { localStorage?: Storage }).localStorage = {
  getItem: (k: string) => storageMap.get(k) ?? null,
  setItem: (k: string, v: string) => void storageMap.set(k, v),
  removeItem: (k: string) => void storageMap.delete(k),
  clear: () => storageMap.clear(),
  key: (i: number) => [...storageMap.keys()][i] ?? null,
  get length() {
    return storageMap.size;
  },
} as unknown as Storage;

test('logSet and completeActiveWorkout succeed with no place', async () => {
  const { useWorkoutStore } = await import('@/store/workoutStore');
  useWorkoutStore.setState({
    savedWorkouts: [],
    workoutHistory: [],
    activeWorkout: null,
    restSecondsRemaining: 0,
    restTimerActive: false,
    restTimerInitialSeconds: 90,
    elapsedSeconds: 0,
  });

  useWorkoutStore.getState().startWorkout('Push', [
    { exerciseId: 'push-ups', sets: [{ reps: 10, weight: 0 }] },
  ]);
  useWorkoutStore.getState().logSet(0, 0, 10, 0);
  const log = useWorkoutStore.getState().completeActiveWorkout();
  assert.ok(log);
  assert.equal(log.exercises[0].sets[0].reps, 10);
  assert.equal('placeId' in log, false);
  assert.equal('lat' in log, false);
  assert.equal('lng' in log, false);
  assert.equal('place' in log, false);
});

test('logger source does not call geolocation or require a place', () => {
  const store = read('src/store/workoutStore.ts');
  assert.doesNotMatch(store, /getCurrentPosition|navigator\.geolocation/);

  const logSetIface = store.slice(store.indexOf('logSet:'), store.indexOf('logSetAndAdvance:'));
  assert.doesNotMatch(logSetIface, /place|lat|lng|geo/i);

  const completeIface = store.slice(
    store.indexOf('completeActiveWorkout:'),
    store.indexOf('addExerciseToActive:')
  );
  assert.doesNotMatch(completeIface, /place|lat|lng|geo/i);

  const active = read('src/page-components/ActiveWorkoutPage.tsx');
  assert.doesNotMatch(active, /getCurrentPosition|navigator\.geolocation/);
  assert.doesNotMatch(active, /\/explore/);
});
