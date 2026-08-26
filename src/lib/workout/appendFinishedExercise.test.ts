/**
 * Add a lift to a finished History draft. Empty / junk invent
 * nothing. Unknown lift is noop. Duplicate ids are allowed.
 * Source draft is not mutated. No store.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';
import type { CompletedWorkoutLog } from '@/types';
import { decideEditSave, draftFromLog } from './editFinishedSession.ts';
import { decideAppendFinishedExercise } from './appendFinishedExercise.ts';

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

describe('decideAppendFinishedExercise (.1037)', () => {
  const draft = {
    exercises: [
      {
        exerciseId: 'bench-press',
        note: 'paused',
        sets: [{ reps: 5, weight: 135 }],
      },
    ],
  };

  it('missing draft / not an array / empty next id are empty', () => {
    assert.equal(
      decideAppendFinishedExercise({
        draft: null,
        nextExerciseId: 'squats',
      }).kind,
      'empty'
    );
    assert.equal(
      decideAppendFinishedExercise({
        draft: undefined,
        nextExerciseId: 'squats',
      }).kind,
      'empty'
    );
    assert.equal(
      decideAppendFinishedExercise({
        draft: { exercises: null as unknown as [] },
        nextExerciseId: 'squats',
      }).kind,
      'empty'
    );
    assert.equal(
      decideAppendFinishedExercise({
        draft,
        nextExerciseId: '',
      }).kind,
      'empty'
    );
    assert.equal(
      decideAppendFinishedExercise({
        draft,
        nextExerciseId: '   ',
      }).kind,
      'empty'
    );
    assert.equal(
      decideAppendFinishedExercise({
        draft,
        nextExerciseId: null,
      }).kind,
      'empty'
    );
  });

  it('unknown lift is noop', () => {
    assert.equal(
      decideAppendFinishedExercise({
        draft,
        nextExerciseId: 'not-a-lift',
      }).kind,
      'noop'
    );
    assert.equal(
      decideAppendFinishedExercise({
        draft,
        nextExerciseId: 'squat',
      }).kind,
      'noop'
    );
  });

  it('append squat after bench keeps bench 135×5 and adds squat 0/0', () => {
    const decision = decideAppendFinishedExercise({
      draft,
      nextExerciseId: 'squats',
    });
    assert.equal(decision.kind, 'apply');
    if (decision.kind !== 'apply') return;
    assert.equal(decision.draft.exercises.length, 2);
    assert.equal(decision.draft.exercises[0]?.exerciseId, 'bench-press');
    assert.equal(decision.draft.exercises[0]?.note, 'paused');
    assert.equal(decision.draft.exercises[0]?.sets[0]?.weight, 135);
    assert.equal(decision.draft.exercises[0]?.sets[0]?.reps, 5);
    assert.equal(decision.draft.exercises[1]?.exerciseId, 'squats');
    assert.deepEqual(decision.draft.exercises[1]?.sets, [{ reps: 0, weight: 0 }]);
  });

  it('clones so the source draft is not mutated', () => {
    const decision = decideAppendFinishedExercise({
      draft,
      nextExerciseId: 'squats',
    });
    assert.equal(decision.kind, 'apply');
    if (decision.kind !== 'apply') return;
    decision.draft.exercises[0]!.sets[0]!.weight = 999;
    decision.draft.exercises[0]!.exerciseId = 'wiped';
    decision.draft.exercises[1]!.sets[0]!.reps = 8;
    assert.equal(draft.exercises[0]?.sets[0]?.weight, 135);
    assert.equal(draft.exercises[0]?.exerciseId, 'bench-press');
    assert.equal(draft.exercises[0]?.note, 'paused');
    assert.equal(draft.exercises.length, 1);
  });

  it('duplicate lift ids are allowed', () => {
    const decision = decideAppendFinishedExercise({
      draft,
      nextExerciseId: 'bench-press',
    });
    assert.equal(decision.kind, 'apply');
    if (decision.kind !== 'apply') return;
    assert.equal(decision.draft.exercises.length, 2);
    assert.equal(decision.draft.exercises[0]?.exerciseId, 'bench-press');
    assert.equal(decision.draft.exercises[0]?.sets[0]?.weight, 135);
    assert.equal(decision.draft.exercises[1]?.exerciseId, 'bench-press');
    assert.deepEqual(decision.draft.exercises[1]?.sets, [{ reps: 0, weight: 0 }]);
  });

  it('empty 0/0 still needs evidence — Save does not invent the lift', () => {
    const original = log({
      workoutName: 'Push',
      exercises: [
        { exerciseId: 'bench-press', sets: [{ reps: 5, weight: 135 }] },
      ],
    });
    const fromLog = draftFromLog(original);
    assert.ok(fromLog);
    const decision = decideAppendFinishedExercise({
      draft: fromLog,
      nextExerciseId: 'squats',
    });
    assert.equal(decision.kind, 'apply');
    if (decision.kind !== 'apply') return;
    const save = decideEditSave({ original, draft: decision.draft });
    assert.equal(save.kind, 'apply');
    if (save.kind !== 'apply') return;
    assert.equal(save.next.id, 'log-1');
    assert.equal(save.next.exercises.length, 1);
    assert.equal(save.next.exercises[0]?.exerciseId, 'bench-press');
    assert.equal(save.next.exercises[0]?.sets[0]?.weight, 135);
  });
});

describe('appendFinishedExercise wiring', () => {
  it('stays one home — no store / Wednesday write / live Start', () => {
    const src = read('src/lib/workout/appendFinishedExercise.ts');
    assert.match(src, /decideAppendFinishedExercise/);
    assert.match(src, /resolveExercise/);
    assert.doesNotMatch(src, /from ['"]@\/store\/workoutStore['"]/);
    assert.doesNotMatch(src, /swapExerciseInPlan|savePlan|generateWeek|savedWorkouts/);
    assert.doesNotMatch(src, /startWorkout|protectLiveStart|decideThisDeviceResume/);
    assert.doesNotMatch(src, /localStorage/);
    assert.doesNotMatch(src, /from ['"]@\/lib\/coach\/planEngine/);
  });
});
