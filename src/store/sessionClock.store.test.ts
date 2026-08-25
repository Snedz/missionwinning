/**
 * Store door for session elapsed pause (.1001).
 * Finish duration is elapsed-while-running. Rest / EMOM stay independent.
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

const T0 = '2026-08-25T10:00:00.000Z';

describe('session clock store', () => {
  it('pause freezes elapsed; finish writes that total, not wall time', async () => {
    const { useWorkoutStore } = await import('@/store/workoutStore');

    useWorkoutStore.setState({
      savedWorkouts: [],
      workoutHistory: [],
      activeWorkout: null,
      elapsedSeconds: 0,
    });
    useWorkoutStore.getState().startWorkout('Push', [
      {
        exerciseId: 'bench-press',
        sets: [{ reps: 5, weight: 60 }],
      },
    ]);
    const open = useWorkoutStore.getState().activeWorkout;
    assert.ok(open);
    assert.ok(open.sessionClock?.runningSince);
    assert.equal(open.sessionClock?.accumulatedSeconds, 0);

    useWorkoutStore.setState({
      activeWorkout: {
        ...open,
        startedAt: T0,
        sessionClock: { accumulatedSeconds: 40, runningSince: null },
      },
    });
    useWorkoutStore.getState().tickElapsed();
    assert.equal(useWorkoutStore.getState().elapsedSeconds, 40);

    useWorkoutStore.getState().logSet(0, 0, 5, 60);
    const log = useWorkoutStore.getState().completeActiveWorkout();
    assert.ok(log);
    assert.equal(log.durationSeconds, 40);
  });

  it('resume clock button keeps the paused total', async () => {
    const { useWorkoutStore } = await import('@/store/workoutStore');
    useWorkoutStore.setState({
      savedWorkouts: [],
      workoutHistory: [],
      activeWorkout: null,
      elapsedSeconds: 0,
    });
    useWorkoutStore.getState().startEmptyWorkout();
    const open = useWorkoutStore.getState().activeWorkout;
    assert.ok(open);
    useWorkoutStore.setState({
      activeWorkout: {
        ...open,
        startedAt: T0,
        sessionClock: { accumulatedSeconds: 12, runningSince: null },
      },
      elapsedSeconds: 12,
    });
    useWorkoutStore.getState().toggleSessionClock();
    const next = useWorkoutStore.getState().activeWorkout?.sessionClock;
    assert.ok(next?.runningSince);
    assert.equal(next.accumulatedSeconds, 12);
    assert.equal(useWorkoutStore.getState().elapsedSeconds, 12);
  });

  it('pause does not stop rest or EMOM', async () => {
    const { useWorkoutStore } = await import('@/store/workoutStore');
    useWorkoutStore.setState({
      savedWorkouts: [],
      workoutHistory: [],
      activeWorkout: null,
    });
    useWorkoutStore.getState().startEmptyWorkout();
    useWorkoutStore.getState().startRestTimer(90);
    assert.equal(useWorkoutStore.getState().restTimerActive, true);
    useWorkoutStore.getState().toggleSessionClock();
    assert.equal(useWorkoutStore.getState().activeWorkout?.sessionClock?.runningSince, null);
    assert.equal(useWorkoutStore.getState().restTimerActive, true);

    useWorkoutStore.getState().toggleSessionClock();
    useWorkoutStore.getState().startWorkClock('interval');
    assert.equal(useWorkoutStore.getState().workClockActive, true);
    useWorkoutStore.getState().toggleSessionClock();
    assert.equal(useWorkoutStore.getState().workClockActive, true);
    assert.equal(useWorkoutStore.getState().workClockKind, 'interval');
    assert.equal(useWorkoutStore.getState().activeWorkout?.sessionClock?.runningSince, null);
  });

  it('Today Start keep does not auto-pause the clock', async () => {
    const { useWorkoutStore } = await import('@/store/workoutStore');
    const { protectLiveStart } = await import('@/lib/workout/sessionResume');

    useWorkoutStore.setState({
      savedWorkouts: [],
      workoutHistory: [],
      activeWorkout: null,
    });
    useWorkoutStore.getState().startWorkout('Push', [
      { exerciseId: 'bench-press', sets: [{ reps: 5, weight: 60 }] },
    ]);
    const runningSince = useWorkoutStore.getState().activeWorkout?.sessionClock?.runningSince;
    assert.ok(runningSince);
    assert.equal(protectLiveStart(useWorkoutStore.getState().activeWorkout), 'keep');
    useWorkoutStore.getState().startWorkout('Just Go', [
      { exerciseId: 'squat', sets: [{ reps: 10, weight: 100 }] },
    ]);
    const back = useWorkoutStore.getState().activeWorkout;
    assert.equal(back?.workoutName, 'Push');
    assert.equal(back?.sessionClock?.runningSince, runningSince);
  });

  it('empty Finish invents no duration and keeps a paused clock', async () => {
    const { useWorkoutStore } = await import('@/store/workoutStore');
    useWorkoutStore.setState({
      savedWorkouts: [],
      workoutHistory: [],
      activeWorkout: null,
    });
    useWorkoutStore.getState().startEmptyWorkout();
    useWorkoutStore.getState().toggleSessionClock();
    const paused = useWorkoutStore.getState().activeWorkout?.sessionClock;
    assert.equal(paused?.runningSince, null);
    const log = useWorkoutStore.getState().completeActiveWorkout();
    assert.equal(log, null);
    assert.ok(useWorkoutStore.getState().activeWorkout);
    assert.equal(useWorkoutStore.getState().activeWorkout?.sessionClock?.runningSince, null);
  });
});
