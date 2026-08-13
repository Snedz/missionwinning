import test from 'node:test';
import assert from 'node:assert/strict';

/**
 * Optional tempo on a logged set (`.734`).
 *
 * Log set never requires it. Last tempo for the exercise prefills the next
 * logged set. completeActiveWorkout must copy it — unknown fields were dropped.
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

test('set tempo', async (t) => {
  const { useWorkoutStore } = await import('@/store/workoutStore');

  const template = (exerciseId = 'bench-press', setCount = 2) => [
    { exerciseId, sets: Array.from({ length: setCount }, () => ({ reps: 8, weight: 60 })) },
  ];

  function freshSession() {
    storageMap.clear();
    useWorkoutStore.setState({ activeWorkout: null, workoutHistory: [] });
    useWorkoutStore.getState().startWorkout('Push', template());
  }

  const firstSet = () => useWorkoutStore.getState().activeWorkout!.exercises[0].sets[0];
  const secondSet = () => useWorkoutStore.getState().activeWorkout!.exercises[0].sets[1];

  await t.test('a logged set has no tempo when none was remembered', () => {
    freshSession();
    useWorkoutStore.getState().logSetAndAdvance(0, 0, 8, 60);
    assert.equal(firstSet().completed, true);
    assert.equal(firstSet().tempo, undefined);
    assert.equal(firstSet().rpe, undefined, 'RPE stays unrated — tempo is a separate field');
  });

  await t.test('rateSetTempo persists and complete keeps it', () => {
    freshSession();
    useWorkoutStore.getState().logSetAndAdvance(0, 0, 8, 60);
    useWorkoutStore.getState().rateSetTempo(0, 0, { ecc: 3, pause: 1, con: 1 });
    assert.deepEqual(firstSet().tempo, { ecc: 3, pause: 1, con: 1 });

    const log = useWorkoutStore.getState().completeActiveWorkout();
    assert.ok(log, 'precondition: session completes');
    assert.deepEqual(log.exercises[0].sets[0].tempo, { ecc: 3, pause: 1, con: 1 });
  });

  await t.test('complete omits tempo when it was never set', () => {
    freshSession();
    useWorkoutStore.getState().logSetAndAdvance(0, 0, 8, 60);
    const log = useWorkoutStore.getState().completeActiveWorkout();
    assert.ok(log);
    assert.equal('tempo' in log.exercises[0].sets[0], false);
  });

  await t.test('last tempo prefills the next set of that exercise', () => {
    freshSession();
    useWorkoutStore.getState().logSetAndAdvance(0, 0, 8, 60);
    useWorkoutStore.getState().rateSetTempo(0, 0, { ecc: 3, pause: 1, con: 1 });
    useWorkoutStore.getState().logSetAndAdvance(0, 1, 8, 62.5);
    assert.deepEqual(secondSet().tempo, { ecc: 3, pause: 1, con: 1 });
  });

  await t.test('clearing tempo on a set does not block the next prefill', () => {
    freshSession();
    useWorkoutStore.getState().logSetAndAdvance(0, 0, 8, 60);
    useWorkoutStore.getState().rateSetTempo(0, 0, { ecc: 4, pause: 2, con: 1 });
    useWorkoutStore.getState().rateSetTempo(0, 0, undefined);
    assert.equal(firstSet().tempo, undefined);
    useWorkoutStore.getState().logSetAndAdvance(0, 1, 8, 60);
    assert.deepEqual(secondSet().tempo, { ecc: 4, pause: 2, con: 1 });
  });

  await t.test('empty log still refuses to finish', () => {
    freshSession();
    const log = useWorkoutStore.getState().completeActiveWorkout();
    assert.equal(log, null);
    assert.ok(useWorkoutStore.getState().activeWorkout, 'empty Finish is a no-op');
  });
});
