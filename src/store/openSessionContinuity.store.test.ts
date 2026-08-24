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

describe('open session store — desk → gym', () => {
  it('desk start + phone finish is one history log', async () => {
    const { useWorkoutStore } = await import('@/store/workoutStore');
    const { snapshotFromActive, decideOpenSession, activeFromSnapshot } = await import(
      '@/lib/workout/openSessionContinuity'
    );
    const { STORAGE_KEYS } = await import('@/lib/storage/keys');

    useWorkoutStore.setState({
      savedWorkouts: [],
      workoutHistory: [],
      activeWorkout: null,
      pendingRemoteOpenSession: null,
    });
    storageMap.delete(STORAGE_KEYS.outbox);

    useWorkoutStore.getState().startWorkout('Push', [
      { exerciseId: 'bench-press', sets: [{ reps: 5, weight: 60 }, { reps: 5, weight: 60 }] },
    ]);
    const deskId = useWorkoutStore.getState().activeWorkout?.clientId;
    assert.ok(deskId);
    useWorkoutStore.getState().logSet(0, 0, 5, 60);
    const deskSnap = snapshotFromActive(useWorkoutStore.getState().activeWorkout);
    assert.ok(deskSnap);
    assert.equal(deskSnap.clientId, deskId);
    assert.equal(decideOpenSession(null, deskSnap).action, 'adopt-remote');

    useWorkoutStore.setState({
      savedWorkouts: [],
      workoutHistory: [],
      activeWorkout: null,
      pendingRemoteOpenSession: null,
    });
    const adopted = activeFromSnapshot(deskSnap);
    assert.ok(adopted);
    useWorkoutStore.getState().restoreActiveWorkout(adopted);
    assert.equal(useWorkoutStore.getState().activeWorkout?.clientId, deskId);
    useWorkoutStore.getState().logSet(0, 1, 5, 65);
    assert.equal(useWorkoutStore.getState().activeWorkout?.clientId, deskId);

    const log = useWorkoutStore.getState().completeActiveWorkout();
    assert.ok(log);
    assert.equal(useWorkoutStore.getState().activeWorkout, null);
    assert.equal(log.exercises[0]?.sets.length, 2);
    assert.equal(useWorkoutStore.getState().workoutHistory.length, 1);
  });

  it('guest start stamps identity and does not wipe on empty remote', async () => {
    const { useWorkoutStore } = await import('@/store/workoutStore');
    const { snapshotFromActive, decideOpenSession } = await import(
      '@/lib/workout/openSessionContinuity'
    );

    useWorkoutStore.setState({
      savedWorkouts: [],
      workoutHistory: [],
      activeWorkout: null,
    });
    useWorkoutStore.getState().startEmptyWorkout();
    const guest = useWorkoutStore.getState().activeWorkout;
    assert.ok(guest?.clientId);
    useWorkoutStore.getState().addExerciseToActive('squat');
    useWorkoutStore.getState().logSet(0, 0, 5, 100);
    const local = snapshotFromActive(useWorkoutStore.getState().activeWorkout);
    assert.equal(decideOpenSession(local, null).action, 'push-local');
    assert.equal(useWorkoutStore.getState().activeWorkout?.exercises[0]?.sets[0]?.completed, true);
  });

  it('surface change does not wipe local logged work', async () => {
    const { useWorkoutStore } = await import('@/store/workoutStore');
    const { snapshotFromActive, decideOpenSession } = await import(
      '@/lib/workout/openSessionContinuity'
    );

    useWorkoutStore.setState({
      savedWorkouts: [],
      workoutHistory: [],
      activeWorkout: null,
      pendingRemoteOpenSession: null,
    });
    useWorkoutStore.getState().startWorkout('Phone', [
      { exerciseId: 'squat', sets: [{ reps: 5, weight: 100 }] },
    ]);
    useWorkoutStore.getState().logSet(0, 0, 5, 100);
    const before = useWorkoutStore.getState().activeWorkout;
    assert.ok(before?.clientId);
    assert.equal(before.exercises[0]?.sets[0]?.completed, true);

    const local = snapshotFromActive(before);
    const other = snapshotFromActive({
      workoutName: 'Desk',
      startedAt: before.startedAt,
      clientId: 'other-desk',
      revision: 4,
      updatedAt: 'later',
      exercises: [
        {
          exerciseId: 'bench-press',
          sets: [{ id: 's', reps: 5, weight: 60, completed: true, kind: 'normal' }],
        },
      ],
    });
    assert.equal(decideOpenSession(local, other).action, 'needs-confirm');
    useWorkoutStore.getState().setPendingRemoteOpenSession(other);
    const after = useWorkoutStore.getState().activeWorkout;
    assert.equal(after?.clientId, before.clientId);
    assert.equal(after?.exercises[0]?.sets[0]?.completed, true);
    assert.equal(after?.workoutName, 'Phone');
  });

  it('Finish tombstones the open session — does not enqueue a live snapshot', async () => {
    const { useWorkoutStore } = await import('@/store/workoutStore');
    const { STORAGE_KEYS } = await import('@/lib/storage/keys');
    const { parseOpenSession } = await import('@/lib/workout/openSessionContinuity');

    useWorkoutStore.setState({
      savedWorkouts: [],
      workoutHistory: [],
      activeWorkout: null,
      pendingRemoteOpenSession: null,
    });
    storageMap.delete(STORAGE_KEYS.outbox);
    useWorkoutStore.getState().startWorkout('Push', [
      { exerciseId: 'bench-press', sets: [{ reps: 5, weight: 60 }] },
    ]);
    const sessionId = useWorkoutStore.getState().activeWorkout?.clientId;
    useWorkoutStore.getState().logSet(0, 0, 5, 60);
    useWorkoutStore.getState().completeActiveWorkout();

    const ops = JSON.parse(storageMap.get(STORAGE_KEYS.outbox) as string) as {
      kind: string;
      payload: unknown;
    }[];
    const active = ops.filter((op) => op.kind === 'workout.active');
    assert.ok(active.length >= 1);
    const last = parseOpenSession(active[active.length - 1]?.payload);
    assert.ok(last?.deletedAt);
    assert.equal(last?.clientId, sessionId);
    assert.equal(last?.workout, null);
  });
});
