/**
 * Live jot → completed log; receipt edit stays local (`.982`).
 */
import test from 'node:test';
import assert from 'node:assert/strict';

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

test('private session notes persist with the session', async (t) => {
  const { useWorkoutStore } = await import('@/store/workoutStore');

  function freshSession() {
    useWorkoutStore.setState({ activeWorkout: null, workoutHistory: [] });
    useWorkoutStore.getState().startWorkout('Push', [
      { exerciseId: 'bench-press', sets: [{ reps: 5, weight: 60 }, { reps: 5, weight: 60 }] },
    ]);
  }

  await t.test('finish copies a live jot onto the log', () => {
    freshSession();
    useWorkoutStore.getState().setSessionNote('  knee twinge set 3  ');
    useWorkoutStore.getState().logSetAndAdvance(0, 0, 5, 60);
    const log = useWorkoutStore.getState().completeActiveWorkout();
    assert.ok(log, 'precondition: session must complete');
    assert.equal(log!.sessionNote, 'knee twinge set 3');
  });

  await t.test('finish with no jot leaves sessionNote absent', () => {
    freshSession();
    useWorkoutStore.getState().logSetAndAdvance(0, 0, 5, 60);
    const log = useWorkoutStore.getState().completeActiveWorkout();
    assert.ok(log, 'empty jot must still finish');
    assert.equal('sessionNote' in log!, false);
  });

  await t.test('receipt edit writes the log locally; empty clears', () => {
    freshSession();
    useWorkoutStore.getState().logSetAndAdvance(0, 0, 5, 60);
    const log = useWorkoutStore.getState().completeActiveWorkout();
    assert.ok(log);
    useWorkoutStore.getState().setHistorySessionNote(log!.id, 'belt on 3');
    const kept = useWorkoutStore.getState().workoutHistory.find((row) => row.id === log!.id);
    assert.equal(kept?.sessionNote, 'belt on 3');
    useWorkoutStore.getState().setHistorySessionNote(log!.id, '   ');
    const cleared = useWorkoutStore.getState().workoutHistory.find((row) => row.id === log!.id);
    assert.equal('sessionNote' in (cleared ?? {}), false);
  });

  await t.test('whitespace jot invents nothing on finish', () => {
    freshSession();
    useWorkoutStore.getState().setSessionNote('\n  \t');
    useWorkoutStore.getState().logSetAndAdvance(0, 0, 5, 60);
    const log = useWorkoutStore.getState().completeActiveWorkout();
    assert.ok(log);
    assert.equal(log!.sessionNote, undefined);
    assert.notEqual(log!.sessionNote, '');
  });
});
