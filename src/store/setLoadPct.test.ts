import test from 'node:test';
import assert from 'node:assert/strict';

/**
 * Optional % of a known 1-rep max on the set (`.981`).
 * Drive the real store so persist / complete / empty-log cannot be fiction.
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

test('optional set-row loadPct persist', async (t) => {
  const { useWorkoutStore } = await import('@/store/workoutStore');

  const template = (exerciseId = 'bench-press', setCount = 2) => [
    { exerciseId, sets: Array.from({ length: setCount }, () => ({ reps: 8, weight: 60 })) },
  ];

  function freshSession() {
    useWorkoutStore.setState({ activeWorkout: null, workoutHistory: [] });
    useWorkoutStore.getState().startWorkout('Push', template());
  }

  const firstSet = () => useWorkoutStore.getState().activeWorkout!.exercises[0].sets[0];

  await t.test('a logged set arrives without loadPct — empty is fine', () => {
    freshSession();
    useWorkoutStore.getState().logSetAndAdvance(0, 0, 8, 60);
    const set = firstSet();
    assert.equal(set.completed, true, 'precondition: the set must actually be logged');
    assert.equal(set.loadPct, undefined, 'Log set must not require or stamp loadPct');
  });

  await t.test('setSetLoadPct persists and can clear; out of range drops', () => {
    freshSession();
    useWorkoutStore.getState().setSetLoadPct(0, 0, 80);
    assert.equal(firstSet().loadPct, 80);
    useWorkoutStore.getState().setSetLoadPct(0, 0, 76.5);
    assert.equal(firstSet().loadPct, 76.5);
    useWorkoutStore.getState().setSetLoadPct(0, 0, 101);
    assert.equal(firstSet().loadPct, undefined);
    useWorkoutStore.getState().setSetLoadPct(0, 0, 80);
    useWorkoutStore.getState().setSetLoadPct(0, 0, undefined);
    assert.equal(firstSet().loadPct, undefined);
  });

  await t.test('notebook loadPct prefills; empty notebook invents none', () => {
    useWorkoutStore.setState({ activeWorkout: null, workoutHistory: [] });
    useWorkoutStore.getState().startWorkout('Wave', [
      { exerciseId: 'bench-press', sets: [{ reps: 5, weight: 0, loadPct: 80 }] },
    ]);
    assert.equal(firstSet().loadPct, 80);
    useWorkoutStore.setState({ activeWorkout: null, workoutHistory: [] });
    useWorkoutStore.getState().startWorkout('Blank', template());
    assert.equal(firstSet().loadPct, undefined);
  });

  await t.test('complete keeps loadPct when set and omits when empty', () => {
    freshSession();
    useWorkoutStore.getState().setSetLoadPct(0, 0, 80);
    useWorkoutStore.getState().logSetAndAdvance(0, 0, 8, 80);
    useWorkoutStore.getState().logSetAndAdvance(0, 1, 8, 60);
    const log = useWorkoutStore.getState().completeActiveWorkout();
    assert.ok(log, 'precondition: session must complete');
    assert.equal(log!.exercises[0].sets[0].loadPct, 80);
    assert.equal(log!.exercises[0].sets[1].loadPct, undefined);
  });
});
