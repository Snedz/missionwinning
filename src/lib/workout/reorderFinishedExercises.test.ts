/**
 * Reorder lifts on a finished History draft. Empty / junk / same /
 * one-lift invent nothing. Sets ride with the lift. No store.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';
import type { CompletedWorkoutLog } from '@/types';
import { decideEditSave, draftFromLog } from './editFinishedSession.ts';
import { decideReorderFinishedExercises } from './reorderFinishedExercises.ts';
import { reorderSessionExercises } from './sessionReorder.ts';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

function log(
  over: Partial<CompletedWorkoutLog> &
    Pick<CompletedWorkoutLog, 'workoutName' | 'exercises'>
): CompletedWorkoutLog {
  return {
    id: 'log-1',
    clientId: 'cid-1',
    revision: 1,
    startedAt: '2026-08-17T10:00:00.000Z',
    completedAt: '2026-08-17T11:00:00.000Z',
    durationSeconds: 3600,
    totalVolume: 1000,
    ...over,
  };
}

describe('decideReorderFinishedExercises (.1034)', () => {
  it('missing draft / not an array / junk indexes are empty', () => {
    const draft = {
      exercises: [
        { exerciseId: 'bench-press', sets: [{ reps: 5, weight: 135 }] },
        { exerciseId: 'squat', sets: [{ reps: 5, weight: 185 }] },
      ],
    };
    assert.equal(
      decideReorderFinishedExercises({ draft: null, fromIndex: 0, toIndex: 1 }).kind,
      'empty'
    );
    assert.equal(
      decideReorderFinishedExercises({
        draft: undefined,
        fromIndex: 0,
        toIndex: 1,
      }).kind,
      'empty'
    );
    assert.equal(
      decideReorderFinishedExercises({
        draft: { exercises: null as unknown as [] },
        fromIndex: 0,
        toIndex: 1,
      }).kind,
      'empty'
    );
    assert.equal(
      decideReorderFinishedExercises({
        draft,
        fromIndex: 0.5,
        toIndex: 1,
      }).kind,
      'empty'
    );
    assert.equal(
      decideReorderFinishedExercises({
        draft,
        fromIndex: '0',
        toIndex: 1,
      }).kind,
      'empty'
    );
    assert.equal(
      decideReorderFinishedExercises({
        draft,
        fromIndex: 0,
        toIndex: Number.NaN,
      }).kind,
      'empty'
    );
  });

  it('same index / one lift / out of range are noop', () => {
    const two = {
      exercises: [
        { exerciseId: 'bench-press', sets: [{ reps: 5, weight: 135 }] },
        { exerciseId: 'squat', sets: [{ reps: 5, weight: 185 }] },
      ],
    };
    const one = {
      exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 135 }] }],
    };
    assert.equal(
      decideReorderFinishedExercises({ draft: two, fromIndex: 0, toIndex: 0 }).kind,
      'noop'
    );
    assert.equal(
      decideReorderFinishedExercises({ draft: one, fromIndex: 0, toIndex: 1 }).kind,
      'noop'
    );
    assert.equal(
      decideReorderFinishedExercises({ draft: two, fromIndex: 0, toIndex: 2 }).kind,
      'noop'
    );
    assert.equal(
      decideReorderFinishedExercises({ draft: two, fromIndex: -1, toIndex: 0 }).kind,
      'noop'
    );
    assert.equal(
      decideReorderFinishedExercises({ draft: { exercises: [] }, fromIndex: 0, toIndex: 1 })
        .kind,
      'noop'
    );
    assert.equal(reorderSessionExercises(two.exercises, 0, 0), null);
  });

  it('two lifts swap', () => {
    const draft = {
      exercises: [
        { exerciseId: 'bench-press', sets: [{ reps: 5, weight: 135 }] },
        { exerciseId: 'squat', sets: [{ reps: 5, weight: 185 }] },
      ],
    };
    const decision = decideReorderFinishedExercises({
      draft,
      fromIndex: 0,
      toIndex: 1,
    });
    assert.equal(decision.kind, 'apply');
    if (decision.kind !== 'apply') return;
    assert.deepEqual(
      decision.draft.exercises.map((ex) => ex.exerciseId),
      ['squat', 'bench-press']
    );
  });

  it('three lifts move last to first', () => {
    const draft = {
      exercises: [
        { exerciseId: 'bench-press', sets: [{ reps: 5, weight: 135 }] },
        { exerciseId: 'squat', sets: [{ reps: 5, weight: 185 }] },
        { exerciseId: 'row', sets: [{ reps: 8, weight: 60 }] },
      ],
    };
    const decision = decideReorderFinishedExercises({
      draft,
      fromIndex: 2,
      toIndex: 0,
    });
    assert.equal(decision.kind, 'apply');
    if (decision.kind !== 'apply') return;
    assert.deepEqual(
      decision.draft.exercises.map((ex) => ex.exerciseId),
      ['row', 'bench-press', 'squat']
    );
  });

  it('sets ride with the lift — reorder is not a swap of loads', () => {
    const draft = {
      exercises: [
        {
          exerciseId: 'bench-press',
          note: 'paused',
          sets: [
            { reps: 5, weight: 135 },
            { reps: 5, weight: 145 },
          ],
        },
        { exerciseId: 'squat', sets: [{ reps: 3, weight: 225 }] },
        { exerciseId: 'row', sets: [{ reps: 8, weight: 60 }] },
      ],
    };
    const decision = decideReorderFinishedExercises({
      draft,
      fromIndex: 0,
      toIndex: 2,
    });
    assert.equal(decision.kind, 'apply');
    if (decision.kind !== 'apply') return;
    assert.equal(decision.draft.exercises[2]?.exerciseId, 'bench-press');
    assert.equal(decision.draft.exercises[2]?.note, 'paused');
    assert.deepEqual(decision.draft.exercises[2]?.sets, [
      { reps: 5, weight: 135 },
      { reps: 5, weight: 145 },
    ]);
    assert.equal(decision.draft.exercises[0]?.exerciseId, 'squat');
    assert.equal(decision.draft.exercises[0]?.sets[0]?.weight, 225);
    decision.draft.exercises[2]!.sets[0]!.weight = 999;
    assert.equal(draft.exercises[0]?.sets[0]?.weight, 135);
    assert.equal(draft.exercises[0]?.exerciseId, 'bench-press');
  });

  it('does not change date / id — Save still keeps the same log', () => {
    const original = log({
      workoutName: 'Push',
      exercises: [
        { exerciseId: 'bench-press', sets: [{ reps: 5, weight: 135 }] },
        { exerciseId: 'squat', sets: [{ reps: 5, weight: 185 }] },
      ],
    });
    const draft = draftFromLog(original);
    assert.ok(draft);
    const decision = decideReorderFinishedExercises({
      draft,
      fromIndex: 0,
      toIndex: 1,
    });
    assert.equal(decision.kind, 'apply');
    if (decision.kind !== 'apply') return;
    assert.equal(original.id, 'log-1');
    assert.equal(original.clientId, 'cid-1');
    assert.equal(original.startedAt, '2026-08-17T10:00:00.000Z');
    assert.equal(original.completedAt, '2026-08-17T11:00:00.000Z');
    const save = decideEditSave({ original, draft: decision.draft });
    assert.equal(save.kind, 'apply');
    if (save.kind !== 'apply') return;
    assert.equal(save.next.id, 'log-1');
    assert.equal(save.next.clientId, 'cid-1');
    assert.equal(save.next.startedAt, original.startedAt);
    assert.equal(save.next.completedAt, original.completedAt);
    assert.equal(save.next.deletedAt, null);
    assert.deepEqual(
      save.next.exercises.map((ex) => ex.exerciseId),
      ['squat', 'bench-press']
    );
    assert.equal(save.next.exercises[0]?.sets[0]?.weight, 185);
    assert.equal(save.next.exercises[1]?.sets[0]?.weight, 135);
  });
});

describe('reorderFinishedExercises wiring', () => {
  it('wraps live reorder — no store, no splice fork, no Wednesday write', () => {
    const src = read('src/lib/workout/reorderFinishedExercises.ts');
    assert.match(src, /decideReorderFinishedExercises/);
    assert.match(src, /from ['"]@\/lib\/workout\/sessionReorder['"]/);
    assert.match(src, /reorderSessionExercises/);
    assert.doesNotMatch(src, /\.splice\(/);
    assert.doesNotMatch(src, /from ['"]@\/store\/workoutStore['"]/);
    assert.doesNotMatch(src, /swapExerciseInPlan|savePlan|generateWeek|savedWorkouts/);
    assert.doesNotMatch(src, /startWorkout|protectLiveStart|decideThisDeviceResume/);
    assert.doesNotMatch(src, /localStorage/);
    assert.doesNotMatch(src, /from ['"]@\/lib\/coach\/planEngine/);
  });
});
