/**
 * Replace a lift on a finished History draft. Empty / junk invent
 * nothing. Same id / unknown / out of range is noop. Sets ride.
 * Source draft is not mutated. No store.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';
import type { CompletedWorkoutLog } from '@/types';
import { decideEditSave, draftFromLog } from './editFinishedSession.ts';
import { decideReplaceFinishedExercise } from './replaceFinishedExercise.ts';

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

describe('decideReplaceFinishedExercise (.1036)', () => {
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
      { exerciseId: 'barbell-row', sets: [{ reps: 8, weight: 60 }] },
    ],
  };

  it('missing draft / not an array / junk index / empty next id are empty', () => {
    assert.equal(
      decideReplaceFinishedExercise({
        draft: null,
        exerciseIndex: 0,
        nextExerciseId: 'squats',
      }).kind,
      'empty'
    );
    assert.equal(
      decideReplaceFinishedExercise({
        draft: undefined,
        exerciseIndex: 0,
        nextExerciseId: 'squats',
      }).kind,
      'empty'
    );
    assert.equal(
      decideReplaceFinishedExercise({
        draft: { exercises: null as unknown as [] },
        exerciseIndex: 0,
        nextExerciseId: 'squats',
      }).kind,
      'empty'
    );
    assert.equal(
      decideReplaceFinishedExercise({
        draft,
        exerciseIndex: 0.5,
        nextExerciseId: 'squats',
      }).kind,
      'empty'
    );
    assert.equal(
      decideReplaceFinishedExercise({
        draft,
        exerciseIndex: '0',
        nextExerciseId: 'squats',
      }).kind,
      'empty'
    );
    assert.equal(
      decideReplaceFinishedExercise({
        draft,
        exerciseIndex: Number.NaN,
        nextExerciseId: 'squats',
      }).kind,
      'empty'
    );
    assert.equal(
      decideReplaceFinishedExercise({
        draft,
        exerciseIndex: 0,
        nextExerciseId: '',
      }).kind,
      'empty'
    );
    assert.equal(
      decideReplaceFinishedExercise({
        draft,
        exerciseIndex: 0,
        nextExerciseId: '   ',
      }).kind,
      'empty'
    );
    assert.equal(
      decideReplaceFinishedExercise({
        draft,
        exerciseIndex: 0,
        nextExerciseId: null,
      }).kind,
      'empty'
    );
  });

  it('same id / unknown lift / out of range are noop', () => {
    assert.equal(
      decideReplaceFinishedExercise({
        draft,
        exerciseIndex: 0,
        nextExerciseId: 'bench-press',
      }).kind,
      'noop'
    );
    assert.equal(
      decideReplaceFinishedExercise({
        draft,
        exerciseIndex: 0,
        nextExerciseId: 'not-a-lift',
      }).kind,
      'noop'
    );
    assert.equal(
      decideReplaceFinishedExercise({
        draft,
        exerciseIndex: 0,
        nextExerciseId: 'squat',
      }).kind,
      'noop'
    );
    assert.equal(
      decideReplaceFinishedExercise({
        draft,
        exerciseIndex: 2,
        nextExerciseId: 'squats',
      }).kind,
      'noop'
    );
    assert.equal(
      decideReplaceFinishedExercise({
        draft,
        exerciseIndex: -1,
        nextExerciseId: 'squats',
      }).kind,
      'noop'
    );
    assert.equal(
      decideReplaceFinishedExercise({
        draft: { exercises: [] },
        exerciseIndex: 0,
        nextExerciseId: 'squats',
      }).kind,
      'noop'
    );
  });

  it('bench to squat keeps 135×5', () => {
    const one = {
      exercises: [
        { exerciseId: 'bench-press', sets: [{ reps: 5, weight: 135 }] },
      ],
    };
    const decision = decideReplaceFinishedExercise({
      draft: one,
      exerciseIndex: 0,
      nextExerciseId: 'squats',
    });
    assert.equal(decision.kind, 'apply');
    if (decision.kind !== 'apply') return;
    assert.equal(decision.draft.exercises[0]?.exerciseId, 'squats');
    assert.equal(decision.draft.exercises[0]?.sets[0]?.weight, 135);
    assert.equal(decision.draft.exercises[0]?.sets[0]?.reps, 5);
    assert.equal(decision.draft.exercises.length, 1);
  });

  it('sets ride unchanged — replace is not a wipe of loads or notes', () => {
    const decision = decideReplaceFinishedExercise({
      draft,
      exerciseIndex: 0,
      nextExerciseId: 'squats',
    });
    assert.equal(decision.kind, 'apply');
    if (decision.kind !== 'apply') return;
    assert.equal(decision.draft.exercises[0]?.exerciseId, 'squats');
    assert.equal(decision.draft.exercises[0]?.note, 'paused');
    assert.deepEqual(decision.draft.exercises[0]?.sets, [
      { reps: 5, weight: 135 },
      { reps: 5, weight: 145 },
    ]);
    assert.equal(decision.draft.exercises[1]?.exerciseId, 'barbell-row');
    assert.equal(decision.draft.exercises[1]?.sets[0]?.weight, 60);
  });

  it('clones sets so the source draft is not mutated', () => {
    const decision = decideReplaceFinishedExercise({
      draft,
      exerciseIndex: 0,
      nextExerciseId: 'squats',
    });
    assert.equal(decision.kind, 'apply');
    if (decision.kind !== 'apply') return;
    decision.draft.exercises[0]!.sets[0]!.weight = 999;
    decision.draft.exercises[0]!.exerciseId = 'wiped';
    assert.equal(draft.exercises[0]?.sets[0]?.weight, 135);
    assert.equal(draft.exercises[0]?.exerciseId, 'bench-press');
    assert.equal(draft.exercises[0]?.note, 'paused');
  });

  it('does not change date / id — Save still keeps the same log', () => {
    const original = log({
      workoutName: 'Push',
      exercises: [
        { exerciseId: 'bench-press', sets: [{ reps: 5, weight: 135 }] },
        { exerciseId: 'barbell-row', sets: [{ reps: 8, weight: 60 }] },
      ],
    });
    const fromLog = draftFromLog(original);
    assert.ok(fromLog);
    const decision = decideReplaceFinishedExercise({
      draft: fromLog,
      exerciseIndex: 0,
      nextExerciseId: 'squats',
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
    assert.equal(save.next.exercises[0]?.exerciseId, 'squats');
    assert.equal(save.next.exercises[0]?.sets[0]?.weight, 135);
    assert.equal(save.next.exercises[1]?.exerciseId, 'barbell-row');
  });
});

describe('replaceFinishedExercise wiring', () => {
  it('stays one home — no store / Wednesday write / live Start', () => {
    const src = read('src/lib/workout/replaceFinishedExercise.ts');
    assert.match(src, /decideReplaceFinishedExercise/);
    assert.match(src, /resolveExercise/);
    assert.doesNotMatch(src, /from ['"]@\/store\/workoutStore['"]/);
    assert.doesNotMatch(src, /swapExerciseInPlan|savePlan|generateWeek|savedWorkouts/);
    assert.doesNotMatch(src, /startWorkout|protectLiveStart|decideThisDeviceResume/);
    assert.doesNotMatch(src, /localStorage/);
    assert.doesNotMatch(src, /from ['"]@\/lib\/coach\/planEngine/);
  });
});
