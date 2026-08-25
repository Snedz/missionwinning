/**
 * Store door for this-device resume + Finish-partial (`.963`).
 */
import { describe, it } from 'node:test';
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

describe('session resume store', () => {
  it('leave Train → Today Start → back keeps the same session', async () => {
    const { useWorkoutStore } = await import('@/store/workoutStore');
    const { decideThisDeviceResume, protectLiveStart } = await import(
      '@/lib/workout/sessionResume'
    );

    useWorkoutStore.setState({
      savedWorkouts: [],
      workoutHistory: [],
      activeWorkout: null,
    });
    useWorkoutStore.getState().startWorkout('Push', [
      {
        exerciseId: 'bench-press',
        sets: [
          { reps: 5, weight: 60 },
          { reps: 5, weight: 60 },
          { reps: 5, weight: 60 },
        ],
      },
    ]);
    useWorkoutStore.getState().logSet(0, 0, 5, 60);
    const open = useWorkoutStore.getState().activeWorkout;
    assert.ok(open);
    const before = decideThisDeviceResume(open);
    assert.equal(before.action, 'resume');
    if (before.action !== 'resume') return;
    assert.ok(before.clientId);
    assert.deepEqual(before.nextSet, { exIdx: 0, setIdx: 1 });

    // Today / week strip Start — pulse-false race must not wipe.
    assert.equal(protectLiveStart(useWorkoutStore.getState().activeWorkout), 'keep');
    useWorkoutStore.getState().startWorkout('Just Go', [
      { exerciseId: 'squat', sets: [{ reps: 10, weight: 100 }] },
    ]);
    const back = useWorkoutStore.getState().activeWorkout;
    assert.equal(back?.clientId, before.clientId);
    assert.equal(back?.workoutName, 'Push');
    assert.equal(back?.exercises[0]?.sets[0]?.completed, true);
    assert.equal(back?.exercises[0]?.sets[0]?.reps, 5);
    assert.deepEqual(decideThisDeviceResume(back), before);
  });

  it('Finish-partial keeps logged sets; leftover empties invent no volume', async () => {
    const { useWorkoutStore } = await import('@/store/workoutStore');
    useWorkoutStore.setState({
      savedWorkouts: [],
      workoutHistory: [],
      activeWorkout: null,
    });
    useWorkoutStore.getState().startWorkout('Push', [
      {
        exerciseId: 'bench-press',
        sets: [
          { reps: 10, weight: 50 },
          { reps: 10, weight: 50 },
          { reps: 10, weight: 50 },
        ],
      },
    ]);
    useWorkoutStore.getState().logSet(0, 0, 10, 50);
    const log = useWorkoutStore.getState().completeActiveWorkout();
    assert.ok(log);
    assert.equal(log.exercises[0]?.sets.length, 1);
    assert.equal(log.totalVolume, 500);
    assert.equal(useWorkoutStore.getState().activeWorkout, null);
  });

  it('empty Finish invents nothing', async () => {
    const { useWorkoutStore } = await import('@/store/workoutStore');
    useWorkoutStore.setState({
      savedWorkouts: [],
      workoutHistory: [],
      activeWorkout: null,
    });
    useWorkoutStore.getState().startWorkout('Push', [
      { exerciseId: 'bench-press', sets: [{ reps: 5, weight: 60 }] },
    ]);
    const open = useWorkoutStore.getState().activeWorkout;
    const log = useWorkoutStore.getState().completeActiveWorkout();
    assert.equal(log, null);
    assert.equal(useWorkoutStore.getState().activeWorkout?.clientId, open?.clientId);
    assert.equal(useWorkoutStore.getState().workoutHistory.length, 0);
  });
});
