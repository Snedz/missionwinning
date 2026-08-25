import test from 'node:test';
import assert from 'node:assert/strict';

/**
 * Optional 1–10 RPE on a logged set (`.967`). Mirrors `setRir.test.ts`:
 * drive the real store so persist / complete / empty-log cannot be fiction.
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

test('optional RPE 1–10 persist', async (t) => {
  const { useWorkoutStore } = await import('@/store/workoutStore');

  const template = (exerciseId = 'bench-press', setCount = 2) => [
    { exerciseId, sets: Array.from({ length: setCount }, () => ({ reps: 8, weight: 60 })) },
  ];

  function freshSession() {
    useWorkoutStore.setState({ activeWorkout: null, workoutHistory: [] });
    useWorkoutStore.getState().startWorkout('Push', template());
  }

  const firstSet = () => useWorkoutStore.getState().activeWorkout!.exercises[0].sets[0];

  await t.test('a logged set arrives without rpe10 — empty is fine', () => {
    freshSession();
    useWorkoutStore.getState().logSetAndAdvance(0, 0, 8, 60);
    const set = firstSet();
    assert.equal(set.completed, true, 'precondition: the set must actually be logged');
    assert.equal(set.rpe10, undefined, 'Log set must not require or stamp rpe10');
    assert.equal(set.rpe, undefined, 'categorical RPE path must stay unstamped');
    assert.equal(set.rir, undefined, 'RIR path must stay unstamped');
  });

  await t.test('rateSetRpe10 persists 1–10 and can clear', () => {
    freshSession();
    useWorkoutStore.getState().logSetAndAdvance(0, 0, 8, 60);
    useWorkoutStore.getState().rateSetRpe10(0, 0, 9);
    assert.equal(firstSet().rpe10, 9);
    useWorkoutStore.getState().rateSetRpe10(0, 0, 1);
    assert.equal(firstSet().rpe10, 1, '1 is a real rating, not empty');
    useWorkoutStore.getState().rateSetRpe10(0, 0, undefined);
    assert.equal(firstSet().rpe10, undefined, 'clearing must drop the field');
  });

  await t.test('out-of-range rpe10 is dropped, not clamped', () => {
    freshSession();
    useWorkoutStore.getState().logSetAndAdvance(0, 0, 8, 60);
    useWorkoutStore.getState().rateSetRpe10(0, 0, 11);
    assert.equal(firstSet().rpe10, undefined);
    useWorkoutStore.getState().rateSetRpe10(0, 0, 0);
    assert.equal(firstSet().rpe10, undefined);
  });

  await t.test('does not invent categorical rpe from rpe10', () => {
    freshSession();
    useWorkoutStore.getState().logSetAndAdvance(0, 0, 8, 60);
    useWorkoutStore.getState().rateSetRpe10(0, 0, 9);
    assert.equal(firstSet().rpe, undefined, 'mapping 9 → hard would invent a coach signal');
  });

  await t.test('complete keeps rpe10 when set and omits when empty', () => {
    freshSession();
    useWorkoutStore.getState().logSetAndAdvance(0, 0, 8, 60);
    useWorkoutStore.getState().rateSetRpe10(0, 0, 8);
    useWorkoutStore.getState().logSetAndAdvance(0, 1, 8, 60);
    const log = useWorkoutStore.getState().completeActiveWorkout();
    assert.ok(log, 'precondition: session must complete');
    assert.equal(log!.exercises[0].sets[0].rpe10, 8);
    assert.equal(
      Object.prototype.hasOwnProperty.call(log!.exercises[0].sets[1], 'rpe10'),
      false,
      'empty rpe10 must be omitted, not stored as undefined, so jsonb stays sparse'
    );
  });

  await t.test('empty rpe10 does not block complete after a logged set', () => {
    freshSession();
    useWorkoutStore.getState().logSetAndAdvance(0, 0, 8, 60);
    const log = useWorkoutStore.getState().completeActiveWorkout();
    assert.ok(log, 'Log set without rpe10 must still finish');
    assert.equal(log!.exercises[0].sets[0].rpe10, undefined);
  });
});
