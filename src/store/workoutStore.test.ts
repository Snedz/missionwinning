import test from 'node:test';
import assert from 'node:assert/strict';

/**
 * First tests for the most important module in the repo: everything a user has
 * ever logged passes through here, and until now none of it was covered.
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

const UUID_SHAPE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

test('workoutStore', async (t) => {
  // Imported dynamically so the localStorage stub above is in place first —
  // zustand's persist middleware reads storage while the module initialises.
  const { useWorkoutStore } = await import('@/store/workoutStore');
  const outbox = await import('@/lib/sync/outbox');
  const { STORAGE_KEYS } = await import('@/lib/storage/keys');
  const { mergeWorkoutHistoriesDetailed: mergeDetailed } = await import('@/lib/workout/workoutMerge');

  function reset() {
    useWorkoutStore.setState({
      savedWorkouts: [],
      workoutHistory: [],
      activeWorkout: null,
      restSecondsRemaining: 0,
      restTimerActive: false,
      restTimerInitialSeconds: 90,
      restExerciseId: null,
      elapsedSeconds: 0,
      // hasHydrated is deliberately not reset — faking it here would mask the
      // hydration regression the first assertion below guards.
    });
    storageMap.delete(STORAGE_KEYS.outbox);
  }

  function template(exerciseId = 'push-ups', setCount = 2) {
    return [
      {
        exerciseId,
        sets: Array.from({ length: setCount }, () => ({ reps: 10, weight: 50 })),
      },
    ] as Parameters<ReturnType<typeof useWorkoutStore.getState>['startWorkout']>[1];
  }

  // Regression: `onRehydrateStorage` used to set this flag, but zustand runs that
  // callback synchronously inside create() — before the store binding exists — so
  // the TDZ error was swallowed and the flag stayed false. /active gates
  // "Start Workout" on it, which left the free logger permanently disabled.
  await t.test('hydration completes so the logger is never stuck disabled', () => {
    assert.equal(
      useWorkoutStore.getState().hasHydrated,
      true,
      'hasHydrated must resolve on every storage path — Start depends on it'
    );
  });

  t.beforeEach(reset);

  await t.test('starting a workout plans the template sets', () => {
    useWorkoutStore.getState().startWorkout('Push', template());
    const active = useWorkoutStore.getState().activeWorkout;
    assert.ok(active);
    assert.equal(active?.workoutName, 'Push');
    assert.equal(active?.exercises.length, 1);
    assert.equal(active?.exercises[0].sets.length, 2);
    assert.equal(active?.exercises[0].sets.every((s) => !s.completed), true);
  });

  await t.test('logging a set records reps, weight and completion', () => {
    const store = useWorkoutStore.getState();
    store.startWorkout('Push', template());
    store.logSet(0, 0, 8, 40, 'hard');

    const set = useWorkoutStore.getState().activeWorkout?.exercises[0].sets[0];
    assert.equal(set?.completed, true);
    assert.equal(set?.reps, 8);
    assert.equal(set?.weight, 40);
    assert.equal(set?.rpe, 'hard');
  });

  await t.test('a completed workout gets a sync identity', () => {
    const store = useWorkoutStore.getState();
    store.startWorkout('Push', template());
    store.logSet(0, 0, 10, 50);

    const log = useWorkoutStore.getState().completeActiveWorkout();
    assert.ok(log, 'completing with a logged set must produce a log');
    assert.match(log!.clientId ?? '', UUID_SHAPE, 'sync v2 needs a stable client id');
    assert.equal(log!.revision, 1);
    assert.equal(log!.updatedAt, log!.completedAt);
    assert.equal(log!.totalVolume, 500);
    assert.equal(useWorkoutStore.getState().activeWorkout, null);
    assert.equal(useWorkoutStore.getState().workoutHistory.length, 1);
  });

  await t.test('only completed sets are kept in history', () => {
    const store = useWorkoutStore.getState();
    store.startWorkout('Push', template('push-ups', 3));
    store.logSet(0, 0, 10, 0);
    // Sets 1 and 2 were planned but never done.
    const log = useWorkoutStore.getState().completeActiveWorkout();
    assert.equal(log?.exercises[0].sets.length, 1);
  });

  await t.test('prescribed stamp survives complete for Victory honesty (.410)', () => {
    const store = useWorkoutStore.getState();
    store.startWorkout('Coach Push', [
      {
        exerciseId: 'bench-press',
        prescribed: true,
        sets: [{ reps: 5, weight: 100 }],
      },
    ] as Parameters<ReturnType<typeof useWorkoutStore.getState>['startWorkout']>[1]);
    store.logSet(0, 0, 5, 100);
    const log = useWorkoutStore.getState().completeActiveWorkout();
    assert.equal(log?.exercises[0]?.prescribed, true);
  });

  await t.test('finishing with nothing logged keeps the session (no empty Victory)', () => {
    const store = useWorkoutStore.getState();
    store.startWorkout('Push', template());
    const log = useWorkoutStore.getState().completeActiveWorkout();
    assert.equal(log, null);
    assert.ok(useWorkoutStore.getState().activeWorkout, 'empty Finish must not discard the session');
    assert.equal(useWorkoutStore.getState().workoutHistory.length, 0);
  });

  await t.test('a completed workout is queued for the cloud exactly once', () => {
    const store = useWorkoutStore.getState();
    store.startWorkout('Push', template());
    store.logSet(0, 0, 10, 50);
    useWorkoutStore.getState().completeActiveWorkout();

    const upserts = JSON.parse(storageMap.get(STORAGE_KEYS.outbox) as string).filter(
      (op: { kind: string }) => op.kind === 'workout.upsert'
    );
    assert.equal(upserts.length, 1, 'the history write must outlive this tab');
  });

  await t.test('two sessions queue two ops — they must not collapse', () => {
    const store = useWorkoutStore.getState();

    store.startWorkout('Push', template());
    useWorkoutStore.getState().logSet(0, 0, 10, 50);
    useWorkoutStore.getState().completeActiveWorkout();

    useWorkoutStore.getState().startWorkout('Pull', template('pull-ups'));
    useWorkoutStore.getState().logSet(0, 0, 8, 0);
    useWorkoutStore.getState().completeActiveWorkout();

    const upserts = JSON.parse(storageMap.get(STORAGE_KEYS.outbox) as string).filter(
      (op: { kind: string }) => op.kind === 'workout.upsert'
    );
    assert.equal(upserts.length, 2, 'two completed logs must not collapse');
  });

  // Note: zustand's persist writes via `window.localStorage`, which does not exist
  // in this runner. Real persistence is asserted in tests/e2e/offline.spec.ts,
  // where a browser is available. Here we assert the queued payload is complete.
  await t.test('the queued cloud write carries the whole session, not a summary', () => {
    const store = useWorkoutStore.getState();
    store.startWorkout('Push', template());
    useWorkoutStore.getState().logSet(0, 0, 10, 50);
    useWorkoutStore.getState().logSet(0, 1, 8, 55);
    const log = useWorkoutStore.getState().completeActiveWorkout();

    const queued = JSON.parse(storageMap.get(STORAGE_KEYS.outbox) as string).filter(
      (op: { kind: string }) => op.kind === 'workout.upsert'
    );
    assert.equal(queued.length, 1);
    assert.equal(queued[0].kind, 'workout.upsert');
    assert.equal(queued[0].dedupeKey, log?.clientId, 'keyed on clientId — a retry cannot duplicate');
    assert.match(queued[0].payload.clientId, UUID_SHAPE);
    assert.equal(queued[0].payload.revision, 1);
    assert.equal(queued[0].payload.setCount, 2);
    assert.equal(queued[0].payload.exercises[0].sets.length, 2);
    assert.equal(queued[0].payload.totalVolume, log?.totalVolume);
  });

  // The cursor is why cross-device edits work at all: a completed_at-ordered read
  // cannot surface a row whose session date is old but whose contents changed, so
  // before this the second device never saw an edit or a tombstone.
  await t.test('an edited cloud log replaces the local copy instead of duplicating', () => {
    const store = useWorkoutStore.getState();
    store.startWorkout('Push', template());
    useWorkoutStore.getState().logSet(0, 0, 10, 50);
    const local = useWorkoutStore.getState().completeActiveWorkout();
    assert.ok(local?.clientId);

    // Same session, edited on another device: higher revision, newer updatedAt.
    const edited = {
      ...local!,
      id: `cloud-abc`,
      revision: 2,
      updatedAt: new Date(Date.now() + 60_000).toISOString(),
      workoutName: 'Push (edited elsewhere)',
    };
    const { logs } = mergeDetailed(useWorkoutStore.getState().workoutHistory, [edited]);
    assert.equal(logs.length, 1, 'an edit must not create a second row');
    assert.equal(logs[0].workoutName, 'Push (edited elsewhere)');
  });

  await t.test('a tombstone from another device removes the session locally', () => {
    const store = useWorkoutStore.getState();
    store.startWorkout('Push', template());
    useWorkoutStore.getState().logSet(0, 0, 10, 50);
    const local = useWorkoutStore.getState().completeActiveWorkout();

    const deleted = {
      ...local!,
      id: 'cloud-abc',
      revision: 2,
      deletedAt: new Date().toISOString(),
    };
    const { logs } = mergeDetailed(useWorkoutStore.getState().workoutHistory, [deleted]);
    assert.equal(logs.length, 0);
  });

  await t.test('cancelling clears the session and the timers', () => {
    const store = useWorkoutStore.getState();
    store.startWorkout('Push', template());
    useWorkoutStore.getState().startRestTimer(60);
    useWorkoutStore.getState().cancelActiveWorkout();

    const s = useWorkoutStore.getState();
    assert.equal(s.activeWorkout, null);
    assert.equal(s.restTimerActive, false);
    assert.equal(s.restSecondsRemaining, 0);
    assert.equal(s.workoutHistory.length, 0);
  });

  await t.test('rest timer counts down and stops at zero', () => {
    const store = useWorkoutStore.getState();
    store.startRestTimer(2);
    assert.equal(useWorkoutStore.getState().restTimerActive, true);

    useWorkoutStore.getState().tickRestTimer();
    assert.equal(useWorkoutStore.getState().restSecondsRemaining, 1);

    useWorkoutStore.getState().tickRestTimer();
    assert.equal(useWorkoutStore.getState().restSecondsRemaining, 0);
    assert.equal(useWorkoutStore.getState().restTimerActive, false);

    // Ticking an inactive timer must not go negative.
    useWorkoutStore.getState().tickRestTimer();
    assert.equal(useWorkoutStore.getState().restSecondsRemaining, 0);
  });

  await t.test('adjusting rest never goes below zero', () => {
    const store = useWorkoutStore.getState();
    store.startRestTimer(30);
    useWorkoutStore.getState().adjustRestTimer(-100);
    assert.equal(useWorkoutStore.getState().restSecondsRemaining, 0);
    assert.equal(useWorkoutStore.getState().restTimerActive, false);
  });

  await t.test('startRestTimer with exerciseId remembers last rest; skip does not overwrite', async () => {
    reset();
    const { recallLastRest } = await import('@/lib/workout/restTimer');
    useWorkoutStore.getState().startRestTimer(120, 'squats');
    assert.equal(useWorkoutStore.getState().restExerciseId, 'squats');
    assert.equal(recallLastRest('squats'), 120);

    useWorkoutStore.getState().tickRestTimer();
    useWorkoutStore.getState().tickRestTimer();
    useWorkoutStore.getState().stopRestTimer();
    assert.equal(useWorkoutStore.getState().restTimerActive, false);
    assert.equal(useWorkoutStore.getState().restExerciseId, null);
    // Skip leftover (118s) must not replace the chosen 120.
    assert.equal(recallLastRest('squats'), 120);
  });

  await t.test('+15s that grows the initial remembers the new duration', async () => {
    reset();
    const { recallLastRest } = await import('@/lib/workout/restTimer');
    useWorkoutStore.getState().startRestTimer(90, 'curl');
    useWorkoutStore.getState().adjustRestTimer(15);
    assert.equal(useWorkoutStore.getState().restTimerInitialSeconds, 105);
    assert.equal(recallLastRest('curl'), 105);
  });

  await t.test('stopRestTimer source never writes last rest', async () => {
    const { readFileSync } = await import('node:fs');
    const { join } = await import('node:path');
    const src = readFileSync(join(import.meta.dirname, 'workoutStore.ts'), 'utf8');
    const stop = src.match(/stopRestTimer:\s*\(\)\s*=>\s*\{[\s\S]*?\n\s*\},/);
    assert.ok(stop, 'stopRestTimer missing');
    assert.doesNotMatch(
      stop![0],
      /rememberLastRest/,
      'skip/stop must not persist leftover rest — mutant that writes here must fail'
    );
  });

  await t.test('startRestTimer without seconds uses the shared fallback (≥60s), not 30', () => {
    useWorkoutStore.getState().startRestTimer();
    const remaining = useWorkoutStore.getState().restSecondsRemaining;
    assert.ok(
      remaining >= 60,
      `expected smart default rest, got ${remaining}s (old bug was bare 30)`
    );
    assert.equal(useWorkoutStore.getState().restTimerInitialSeconds, remaining);
    assert.equal(useWorkoutStore.getState().restTimerActive, true);
  });

  await t.test('adding a set copies the last set as the target', () => {
    const store = useWorkoutStore.getState();
    store.startWorkout('Push', template());
    useWorkoutStore.getState().logSet(0, 0, 12, 60);
    useWorkoutStore.getState().addSetToExercise(0);

    const sets = useWorkoutStore.getState().activeWorkout?.exercises[0].sets ?? [];
    assert.equal(sets.length, 3);
    assert.equal(sets[2].completed, false);
  });

  await t.test('inserting a warmup ramp prepends warmup sets before work', () => {
    const store = useWorkoutStore.getState();
    store.startWorkout('Push', template('bench-press', 2));
    useWorkoutStore.getState().insertWarmupRampOnExercise(0, [
      { reps: 8, weight: 40 },
      { reps: 5, weight: 60 },
    ]);
    const sets = useWorkoutStore.getState().activeWorkout?.exercises[0].sets ?? [];
    assert.equal(sets.length, 4);
    assert.equal(sets[0].kind, 'warmup');
    assert.equal(sets[0].weight, 40);
    assert.equal(sets[1].kind, 'warmup');
    assert.equal(sets[2].kind, 'normal');
    useWorkoutStore.getState().insertWarmupRampOnExercise(0, [
      { reps: 8, weight: 40 },
      { reps: 5, weight: 60 },
    ]);
    assert.equal(useWorkoutStore.getState().activeWorkout?.exercises[0].sets.length, 4);
  });

  await t.test('removing a planned set never removes completed work', () => {
    const store = useWorkoutStore.getState();
    store.startWorkout('Push', template('push-ups', 2));
    useWorkoutStore.getState().logSet(0, 0, 10, 0);

    useWorkoutStore.getState().removeLastPlannedSet(0);
    let sets = useWorkoutStore.getState().activeWorkout?.exercises[0].sets ?? [];
    assert.equal(sets.length, 1);
    assert.equal(sets[0].completed, true);

    // Nothing planned left — the completed set must survive.
    useWorkoutStore.getState().removeLastPlannedSet(0);
    sets = useWorkoutStore.getState().activeWorkout?.exercises[0].sets ?? [];
    assert.equal(sets.length, 1);
    assert.equal(sets[0].completed, true);
  });

  await t.test('drop kind survives logSet (existing SetKind — no second persist)', () => {
    const store = useWorkoutStore.getState();
    store.startWorkout('Push', template('bench-press', 2));
    store.logSet(0, 0, 8, 100);
    store.setSetKind(0, 1, 'drop');
    store.logSet(0, 1, 8, 80);
    const sets = useWorkoutStore.getState().activeWorkout?.exercises[0].sets ?? [];
    assert.equal(sets[1].kind, 'drop');
    assert.equal(sets[1].completed, true);
    assert.equal(sets[1].weight, 80);
  });

  await t.test('swapping an exercise is refused once a set is logged', () => {
    const store = useWorkoutStore.getState();
    store.startWorkout('Push', template());
    useWorkoutStore.getState().replaceExerciseInActive(0, 'dips');
    assert.equal(useWorkoutStore.getState().activeWorkout?.exercises[0].exerciseId, 'dips');

    useWorkoutStore.getState().logSet(0, 0, 10, 0);
    useWorkoutStore.getState().replaceExerciseInActive(0, 'bench-press');
    assert.equal(
      useWorkoutStore.getState().activeWorkout?.exercises[0].exerciseId,
      'dips',
      'a swap after logging would silently reassign real work'
    );
  });

  await t.test('exercise note persists on the completed log (.718)', () => {
    const store = useWorkoutStore.getState();
    store.startWorkout('Push', template());
    store.setExerciseNote(0, 'belt on 3');
    store.logSet(0, 0, 10, 50);
    const saved = useWorkoutStore.getState().completeActiveWorkout();
    assert.equal(saved?.exercises[0].note, 'belt on 3');
    assert.equal(useWorkoutStore.getState().workoutHistory[0].exercises[0].note, 'belt on 3');
  });

  await t.test('a blank exercise note is omitted from history (.718)', () => {
    const store = useWorkoutStore.getState();
    store.startWorkout('Push', template());
    store.setExerciseNote(0, '   ');
    store.logSet(0, 0, 10, 50);
    const saved = useWorkoutStore.getState().completeActiveWorkout();
    assert.equal('note' in (saved?.exercises[0] ?? {}), false);
  });

  await t.test('start prefills the last note for that exercise (.718)', () => {
    const store = useWorkoutStore.getState();
    store.startWorkout('Push', template());
    store.setExerciseNote(0, 'belt on 3');
    store.logSet(0, 0, 10, 50);
    useWorkoutStore.getState().completeActiveWorkout();

    useWorkoutStore.getState().startWorkout('Push', template());
    assert.equal(useWorkoutStore.getState().activeWorkout?.exercises[0].note, 'belt on 3');
  });

  await t.test('clearing a prefilled note is sticky this session (.718)', () => {
    const store = useWorkoutStore.getState();
    store.startWorkout('Push', template());
    store.setExerciseNote(0, 'belt on 3');
    store.logSet(0, 0, 10, 50);
    useWorkoutStore.getState().completeActiveWorkout();

    useWorkoutStore.getState().startWorkout('Push', template());
    useWorkoutStore.getState().setExerciseNote(0, '');
    assert.equal(useWorkoutStore.getState().activeWorkout?.exercises[0].note, '');

    useWorkoutStore.getState().logSet(0, 0, 10, 50);
    const saved = useWorkoutStore.getState().completeActiveWorkout();
    assert.equal('note' in (saved?.exercises[0] ?? {}), false);
  });

  await t.test('add and swap seed the new exercise, not the old cue (.718)', () => {
    const store = useWorkoutStore.getState();
    store.startWorkout('Push', template('bench-press'));
    store.setExerciseNote(0, 'tuck elbows');
    store.logSet(0, 0, 8, 60);
    useWorkoutStore.getState().completeActiveWorkout();

    useWorkoutStore.getState().startWorkout('Legs', template('squat'));
    useWorkoutStore.getState().setExerciseNote(0, 'belt on 3');
    useWorkoutStore.getState().logSet(0, 0, 5, 100);
    useWorkoutStore.getState().completeActiveWorkout();

    useWorkoutStore.getState().startEmptyWorkout();
    useWorkoutStore.getState().addExerciseToActive('bench-press');
    assert.equal(useWorkoutStore.getState().activeWorkout?.exercises[0].note, 'tuck elbows');

    useWorkoutStore.getState().replaceExerciseInActive(0, 'squat');
    const swapped = useWorkoutStore.getState().activeWorkout?.exercises[0];
    assert.equal(swapped?.exerciseId, 'squat');
    assert.equal(swapped?.note, 'belt on 3');
  });

  await t.test('pairing two consecutive exercises persists a shared group (.719)', () => {
    useWorkoutStore.getState().startWorkout('Push', [
      ...template('bench-press', 2),
      ...template('bent-over-row', 2),
    ]);
    useWorkoutStore.getState().toggleSupersetWithNext(0);
    const exercises = useWorkoutStore.getState().activeWorkout?.exercises ?? [];
    assert.ok(exercises[0].supersetGroup);
    assert.equal(exercises[0].supersetGroup, exercises[1].supersetGroup);

    const round = JSON.parse(JSON.stringify(exercises)) as typeof exercises;
    assert.equal(round[0].supersetGroup, exercises[0].supersetGroup);
    assert.equal(round[1].supersetGroup, exercises[1].supersetGroup);
  });

  await t.test('unlink clears both peers of a pair (.719)', () => {
    useWorkoutStore.getState().startWorkout('Push', [
      ...template('bench-press', 2),
      ...template('bent-over-row', 2),
    ]);
    useWorkoutStore.getState().toggleSupersetWithNext(0);
    useWorkoutStore.getState().unlinkSuperset(1);
    const exercises = useWorkoutStore.getState().activeWorkout?.exercises ?? [];
    assert.equal(exercises[0].supersetGroup, undefined);
    assert.equal(exercises[1].supersetGroup, undefined);
  });

  await t.test('logSetAndAdvance after a pair goes A then B (.719)', () => {
    useWorkoutStore.getState().startWorkout('Push', [
      ...template('bench-press', 2),
      ...template('bent-over-row', 2),
    ]);
    useWorkoutStore.getState().toggleSupersetWithNext(0);
    const afterA = useWorkoutStore.getState().logSetAndAdvance(0, 0, 8, 40);
    assert.deepEqual(afterA, { exerciseIndex: 1, setIndex: 0 });
    const afterB = useWorkoutStore.getState().logSetAndAdvance(1, 0, 8, 50);
    assert.deepEqual(afterB, { exerciseIndex: 0, setIndex: 1 });
    const a = useWorkoutStore.getState().activeWorkout?.exercises[0].sets[0];
    assert.equal(a?.completed, true);
    assert.equal(a?.reps, 8);
    assert.equal(a?.weight, 40);
  });

  await t.test('garage swap clears planned weight when equipment changes', () => {
    const store = useWorkoutStore.getState();
    store.startWorkout('Push', template('bench-press', 2));
    const before = useWorkoutStore.getState().activeWorkout?.exercises[0];
    assert.equal(before?.sets[0]?.weight, 50);
    useWorkoutStore.getState().replaceExerciseInActive(0, 'push-ups');
    const after = useWorkoutStore.getState().activeWorkout?.exercises[0];
    assert.equal(after?.exerciseId, 'push-ups');
    assert.equal(after?.sets[0]?.weight, 0);
    assert.equal(after?.sets[0]?.reps, 10);
  });

  await t.test('addExercise on empty history seeds empty rows, not fake 10s (.946)', () => {
    useWorkoutStore.getState().startEmptyWorkout();
    useWorkoutStore.getState().addExerciseToActive('bench-press');
    const sets = useWorkoutStore.getState().activeWorkout?.exercises[0]?.sets ?? [];
    assert.equal(sets.length, 3);
    assert.ok(sets.every((s) => s.reps === 0 && s.weight === 0 && !s.completed));
  });
});
