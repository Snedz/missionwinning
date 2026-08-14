import test from 'node:test';
import assert from 'node:assert/strict';

/**
 * Optional RIR beside RPE (`.725`). Mirrors `setRating.test.ts`: drive the real
 * store so persist / complete / empty-log cannot be fiction.
 */

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

test('optional RIR persist', async (t) => {
  const { useWorkoutStore } = await import('@/store/workoutStore');

  const template = (exerciseId = 'bench-press', setCount = 2) => [
    { exerciseId, sets: Array.from({ length: setCount }, () => ({ reps: 8, weight: 60 })) },
  ];

  function freshSession() {
    useWorkoutStore.setState({ activeWorkout: null, workoutHistory: [] });
    useWorkoutStore.getState().startWorkout('Push', template());
  }

  const firstSet = () => useWorkoutStore.getState().activeWorkout!.exercises[0].sets[0];

  await t.test('a logged set arrives without RIR — empty is fine', () => {
    freshSession();
    useWorkoutStore.getState().logSetAndAdvance(0, 0, 8, 60);
    const set = firstSet();
    assert.equal(set.completed, true, 'precondition: the set must actually be logged');
    assert.equal(set.rir, undefined, 'Log set must not require or stamp RIR');
    assert.equal(set.rpe, undefined, 'RPE path must stay unstamped');
  });

  await t.test('rateSetRir persists 0–5 and can clear', () => {
    freshSession();
    useWorkoutStore.getState().logSetAndAdvance(0, 0, 8, 60);
    useWorkoutStore.getState().rateSetRir(0, 0, 2);
    assert.equal(firstSet().rir, 2);
    useWorkoutStore.getState().rateSetRir(0, 0, 0);
    assert.equal(firstSet().rir, 0, '0 is a real rating (failure), not empty');
    useWorkoutStore.getState().rateSetRir(0, 0, undefined);
    assert.equal(firstSet().rir, undefined, 'clearing must drop the field');
  });

  await t.test('out-of-range RIR is dropped, not clamped', () => {
    freshSession();
    useWorkoutStore.getState().logSetAndAdvance(0, 0, 8, 60);
    useWorkoutStore.getState().rateSetRir(0, 0, 6);
    assert.equal(firstSet().rir, undefined);
  });

  await t.test('complete keeps RIR when set and omits when empty', () => {
    freshSession();
    useWorkoutStore.getState().logSetAndAdvance(0, 0, 8, 60);
    useWorkoutStore.getState().rateSetRir(0, 0, 3);
    useWorkoutStore.getState().logSetAndAdvance(0, 1, 8, 60);
    const log = useWorkoutStore.getState().completeActiveWorkout();
    assert.ok(log, 'precondition: session must complete');
    assert.equal(log!.exercises[0].sets[0].rir, 3);
    assert.equal(
      Object.prototype.hasOwnProperty.call(log!.exercises[0].sets[1], 'rir'),
      false,
      'empty RIR must be omitted, not stored as undefined, so jsonb stays sparse'
    );
  });

  await t.test('empty RIR does not block complete after a logged set', () => {
    freshSession();
    useWorkoutStore.getState().logSetAndAdvance(0, 0, 8, 60);
    const log = useWorkoutStore.getState().completeActiveWorkout();
    assert.ok(log, 'Log set without RIR must still finish');
    assert.equal(log!.exercises[0].sets[0].rir, undefined);
  });
});
