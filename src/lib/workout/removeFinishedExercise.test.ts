/**
 * Remove this lift from a finished History draft. Empty / junk
 * invent nothing. Last remaining lift is noop. Source draft
 * is not mutated. No store.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';
import { decideRemoveFinishedExercise } from './removeFinishedExercise.ts';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

describe('decideRemoveFinishedExercise (.1038)', () => {
  const two = {
    exercises: [
      {
        exerciseId: 'bench-press',
        note: 'paused',
        sets: [{ reps: 5, weight: 135 }],
      },
      { exerciseId: 'squats', sets: [{ reps: 8, weight: 185 }] },
    ],
  };

  it('missing draft / not an array / junk index are empty', () => {
    assert.equal(
      decideRemoveFinishedExercise({
        draft: null,
        exerciseIndex: 0,
      }).kind,
      'empty'
    );
    assert.equal(
      decideRemoveFinishedExercise({
        draft: undefined,
        exerciseIndex: 0,
      }).kind,
      'empty'
    );
    assert.equal(
      decideRemoveFinishedExercise({
        draft: { exercises: null as unknown as [] },
        exerciseIndex: 0,
      }).kind,
      'empty'
    );
    assert.equal(
      decideRemoveFinishedExercise({
        draft: two,
        exerciseIndex: 0.5,
      }).kind,
      'empty'
    );
    assert.equal(
      decideRemoveFinishedExercise({
        draft: two,
        exerciseIndex: '0',
      }).kind,
      'empty'
    );
    assert.equal(
      decideRemoveFinishedExercise({
        draft: two,
        exerciseIndex: Number.NaN,
      }).kind,
      'empty'
    );
    assert.equal(
      decideRemoveFinishedExercise({
        draft: two,
        exerciseIndex: null,
      }).kind,
      'empty'
    );
  });

  it('out of range / last remaining lift are noop', () => {
    assert.equal(
      decideRemoveFinishedExercise({
        draft: two,
        exerciseIndex: 2,
      }).kind,
      'noop'
    );
    assert.equal(
      decideRemoveFinishedExercise({
        draft: two,
        exerciseIndex: -1,
      }).kind,
      'noop'
    );
    assert.equal(
      decideRemoveFinishedExercise({
        draft: { exercises: [] },
        exerciseIndex: 0,
      }).kind,
      'noop'
    );
    const one = {
      exercises: [
        { exerciseId: 'bench-press', sets: [{ reps: 5, weight: 135 }] },
      ],
    };
    assert.equal(
      decideRemoveFinishedExercise({
        draft: one,
        exerciseIndex: 0,
      }).kind,
      'noop'
    );
    assert.equal(one.exercises.length, 1);
    assert.equal(one.exercises[0]?.exerciseId, 'bench-press');
  });

  it('two lifts remove first keeps the second', () => {
    const decision = decideRemoveFinishedExercise({
      draft: two,
      exerciseIndex: 0,
    });
    assert.equal(decision.kind, 'apply');
    if (decision.kind !== 'apply') return;
    assert.equal(decision.draft.exercises.length, 1);
    assert.equal(decision.draft.exercises[0]?.exerciseId, 'squats');
    assert.equal(decision.draft.exercises[0]?.sets[0]?.weight, 185);
    assert.equal(decision.draft.exercises[0]?.sets[0]?.reps, 8);
    assert.equal(two.exercises.length, 2);
    assert.equal(two.exercises[0]?.exerciseId, 'bench-press');
    assert.equal(two.exercises[1]?.exerciseId, 'squats');
  });

  it('clones so the source draft is not mutated', () => {
    const decision = decideRemoveFinishedExercise({
      draft: two,
      exerciseIndex: 0,
    });
    assert.equal(decision.kind, 'apply');
    if (decision.kind !== 'apply') return;
    decision.draft.exercises[0]!.sets[0]!.weight = 999;
    decision.draft.exercises[0]!.exerciseId = 'wiped';
    assert.equal(two.exercises[0]?.exerciseId, 'bench-press');
    assert.equal(two.exercises[0]?.note, 'paused');
    assert.equal(two.exercises[0]?.sets[0]?.weight, 135);
    assert.equal(two.exercises[1]?.exerciseId, 'squats');
    assert.equal(two.exercises[1]?.sets[0]?.weight, 185);
    assert.equal(two.exercises.length, 2);
  });
});

describe('removeFinishedExercise wiring', () => {
  it('stays one home — no store / Wednesday write / live Start', () => {
    const src = read('src/lib/workout/removeFinishedExercise.ts');
    assert.match(src, /decideRemoveFinishedExercise/);
    assert.doesNotMatch(src, /from ['"]@\/store\/workoutStore['"]/);
    assert.doesNotMatch(src, /swapExerciseInPlan|savePlan|generateWeek|savedWorkouts/);
    assert.doesNotMatch(src, /startWorkout|protectLiveStart|decideThisDeviceResume/);
    assert.doesNotMatch(src, /decideDeleteFinishedSession|tomb/);
    assert.doesNotMatch(src, /localStorage/);
    assert.doesNotMatch(src, /from ['"]@\/lib\/coach\/planEngine/);
  });
});
