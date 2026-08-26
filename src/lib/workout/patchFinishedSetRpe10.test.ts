/**
 * Optional 1–10 RPE on a finished History draft.
 * Empty / junk indexes invent nothing. 99 invents
 * nothing. Blank clears. Same value is noop.
 * Does not write categorical rpe. Source draft
 * is not mutated. No store.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';
import type { CompletedWorkoutLog } from '@/types';
import {
  decideEditSave,
  type FinishedSessionDraft,
} from './editFinishedSession.ts';
import { decidePatchFinishedSetRpe10 } from './patchFinishedSetRpe10.ts';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

describe('decidePatchFinishedSetRpe10 (.1040)', () => {
  const two: FinishedSessionDraft = {
    exercises: [
      {
        exerciseId: 'bench-press',
        note: 'paused',
        sets: [
          { reps: 8, weight: 95, rpe10: 8, rpe: 'hard' },
          { reps: 5, weight: 135 },
          { reps: 8, weight: 95, rpe: 'easy' },
        ],
      },
      { exerciseId: 'squats', sets: [{ reps: 8, weight: 185, rpe10: 7 }] },
    ],
  };

  it('missing draft / not an array / junk indexes are empty', () => {
    assert.equal(
      decidePatchFinishedSetRpe10({
        draft: null,
        exerciseIndex: 0,
        setIndex: 0,
        rpe10: 8,
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetRpe10({
        draft: undefined,
        exerciseIndex: 0,
        setIndex: 0,
        rpe10: 8,
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetRpe10({
        draft: { exercises: null as unknown as [] },
        exerciseIndex: 0,
        setIndex: 0,
        rpe10: 8,
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetRpe10({
        draft: two,
        exerciseIndex: 0.5,
        setIndex: 0,
        rpe10: 8,
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetRpe10({
        draft: two,
        exerciseIndex: '0',
        setIndex: 0,
        rpe10: 8,
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetRpe10({
        draft: two,
        exerciseIndex: Number.NaN,
        setIndex: 0,
        rpe10: 8,
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetRpe10({
        draft: two,
        exerciseIndex: 0,
        setIndex: null,
        rpe10: 8,
      }).kind,
      'empty'
    );
  });

  it('99 invents nothing — out of range is empty, never clamped', () => {
    assert.equal(
      decidePatchFinishedSetRpe10({
        draft: two,
        exerciseIndex: 0,
        setIndex: 0,
        rpe10: 99,
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetRpe10({
        draft: two,
        exerciseIndex: 0,
        setIndex: 0,
        rpe10: '99',
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetRpe10({
        draft: two,
        exerciseIndex: 0,
        setIndex: 0,
        rpe10: 0,
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetRpe10({
        draft: two,
        exerciseIndex: 0,
        setIndex: 0,
        rpe10: 11,
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetRpe10({
        draft: two,
        exerciseIndex: 0,
        setIndex: 0,
        rpe10: 8.5,
      }).kind,
      'empty'
    );
    assert.equal(two.exercises[0]?.sets[0]?.rpe10, 8);
  });

  it('out of range set index / same value as current are noop', () => {
    assert.equal(
      decidePatchFinishedSetRpe10({
        draft: two,
        exerciseIndex: 2,
        setIndex: 0,
        rpe10: 8,
      }).kind,
      'noop'
    );
    assert.equal(
      decidePatchFinishedSetRpe10({
        draft: two,
        exerciseIndex: -1,
        setIndex: 0,
        rpe10: 8,
      }).kind,
      'noop'
    );
    assert.equal(
      decidePatchFinishedSetRpe10({
        draft: two,
        exerciseIndex: 0,
        setIndex: 3,
        rpe10: 8,
      }).kind,
      'noop'
    );
    assert.equal(
      decidePatchFinishedSetRpe10({
        draft: two,
        exerciseIndex: 0,
        setIndex: 0,
        rpe10: 8,
      }).kind,
      'noop'
    );
    assert.equal(
      decidePatchFinishedSetRpe10({
        draft: two,
        exerciseIndex: 0,
        setIndex: 0,
        rpe10: '8',
      }).kind,
      'noop'
    );
    assert.equal(
      decidePatchFinishedSetRpe10({
        draft: two,
        exerciseIndex: 0,
        setIndex: 1,
        rpe10: '',
      }).kind,
      'noop'
    );
    assert.equal(
      decidePatchFinishedSetRpe10({
        draft: two,
        exerciseIndex: 0,
        setIndex: 1,
        rpe10: null,
      }).kind,
      'noop'
    );
    assert.equal(
      decidePatchFinishedSetRpe10({
        draft: two,
        exerciseIndex: 0,
        setIndex: 1,
        rpe10: undefined,
      }).kind,
      'noop'
    );
  });

  it('8 apply; blank clears; field is absent after clear', () => {
    const apply8 = decidePatchFinishedSetRpe10({
      draft: two,
      exerciseIndex: 0,
      setIndex: 1,
      rpe10: 8,
    });
    assert.equal(apply8.kind, 'apply');
    if (apply8.kind !== 'apply') return;
    assert.equal(apply8.draft.exercises[0]?.sets[1]?.rpe10, 8);
    assert.equal(apply8.draft.exercises[0]?.sets[1]?.weight, 135);
    assert.equal(apply8.draft.exercises[0]?.sets[1]?.reps, 5);
    assert.equal(two.exercises[0]?.sets[1]?.rpe10, undefined);
    assert.equal(
      Object.prototype.hasOwnProperty.call(two.exercises[0]?.sets[1] ?? {}, 'rpe10'),
      false
    );

    const clear = decidePatchFinishedSetRpe10({
      draft: two,
      exerciseIndex: 0,
      setIndex: 0,
      rpe10: '',
    });
    assert.equal(clear.kind, 'apply');
    if (clear.kind !== 'apply') return;
    assert.equal(clear.draft.exercises[0]?.sets[0]?.rpe10, undefined);
    assert.equal(
      Object.prototype.hasOwnProperty.call(clear.draft.exercises[0]?.sets[0] ?? {}, 'rpe10'),
      false,
      'clear must omit the field, not store undefined'
    );
    assert.equal(two.exercises[0]?.sets[0]?.rpe10, 8);

    const clearNull = decidePatchFinishedSetRpe10({
      draft: two,
      exerciseIndex: 1,
      setIndex: 0,
      rpe10: null,
    });
    assert.equal(clearNull.kind, 'apply');
    if (clearNull.kind !== 'apply') return;
    assert.equal(
      Object.prototype.hasOwnProperty.call(clearNull.draft.exercises[1]?.sets[0] ?? {}, 'rpe10'),
      false
    );
  });

  it('does not write categorical rpe easy/med/hard', () => {
    const decision = decidePatchFinishedSetRpe10({
      draft: two,
      exerciseIndex: 0,
      setIndex: 0,
      rpe10: 9,
    });
    assert.equal(decision.kind, 'apply');
    if (decision.kind !== 'apply') return;
    assert.equal(decision.draft.exercises[0]?.sets[0]?.rpe10, 9);
    assert.equal(decision.draft.exercises[0]?.sets[0]?.rpe, 'hard');
    const ontoEmpty = decidePatchFinishedSetRpe10({
      draft: two,
      exerciseIndex: 0,
      setIndex: 1,
      rpe10: 6,
    });
    assert.equal(ontoEmpty.kind, 'apply');
    if (ontoEmpty.kind !== 'apply') return;
    assert.equal(ontoEmpty.draft.exercises[0]?.sets[1]?.rpe10, 6);
    assert.equal(ontoEmpty.draft.exercises[0]?.sets[1]?.rpe, undefined);
    const src = read('src/lib/workout/patchFinishedSetRpe10.ts');
    assert.doesNotMatch(src, /rpe:\s*['"](?:easy|med|hard)['"]/);
    assert.doesNotMatch(src, /rpe:\s*parsed/);
  });

  it('clones so the source draft is not mutated', () => {
    const decision = decidePatchFinishedSetRpe10({
      draft: two,
      exerciseIndex: 0,
      setIndex: 0,
      rpe10: 5,
    });
    assert.equal(decision.kind, 'apply');
    if (decision.kind !== 'apply') return;
    decision.draft.exercises[0]!.sets[0]!.rpe10 = 1;
    decision.draft.exercises[0]!.sets[0]!.weight = 999;
    decision.draft.exercises[0]!.exerciseId = 'wiped';
    decision.draft.exercises[1]!.sets[0]!.weight = 1;
    assert.equal(two.exercises[0]?.exerciseId, 'bench-press');
    assert.equal(two.exercises[0]?.note, 'paused');
    assert.equal(two.exercises[0]?.sets[0]?.rpe10, 8);
    assert.equal(two.exercises[0]?.sets[0]?.weight, 95);
    assert.equal(two.exercises[0]?.sets[0]?.rpe, 'hard');
    assert.equal(two.exercises[1]?.exerciseId, 'squats');
    assert.equal(two.exercises[1]?.sets[0]?.weight, 185);
    assert.equal(two.exercises[1]?.sets[0]?.rpe10, 7);
  });

  it('Save still decideEditSave — rpe10-only change applies; same log id', () => {
    const original: CompletedWorkoutLog = {
      id: 'log-1',
      clientId: 'cid-1',
      revision: 1,
      workoutName: 'Push',
      startedAt: '2026-08-17T10:00:00.000Z',
      completedAt: '2026-08-17T11:00:00.000Z',
      durationSeconds: 3600,
      totalVolume: 675,
      exercises: [
        {
          exerciseId: 'bench-press',
          sets: [{ reps: 5, weight: 135, rpe: 'hard' }],
        },
      ],
    };
    const patched = decidePatchFinishedSetRpe10({
      draft: { exercises: original.exercises.map((ex) => ({ ...ex, sets: ex.sets.map((s) => ({ ...s })) })) },
      exerciseIndex: 0,
      setIndex: 0,
      rpe10: 8,
    });
    assert.equal(patched.kind, 'apply');
    if (patched.kind !== 'apply') return;
    const decision = decideEditSave({ original, draft: patched.draft });
    assert.equal(decision.kind, 'apply');
    if (decision.kind !== 'apply') return;
    assert.equal(decision.next.id, 'log-1');
    assert.equal(decision.next.clientId, 'cid-1');
    assert.equal(decision.next.exercises[0]?.sets[0]?.rpe10, 8);
    assert.equal(decision.next.exercises[0]?.sets[0]?.rpe, 'hard');
    assert.equal(decision.next.exercises[0]?.sets[0]?.weight, 135);
    assert.equal(decision.next.deletedAt, null);
  });
});

describe('patchFinishedSetRpe10 wiring', () => {
  it('stays one home — no store / Wednesday write / live Start', () => {
    const src = read('src/lib/workout/patchFinishedSetRpe10.ts');
    assert.match(src, /decidePatchFinishedSetRpe10/);
    assert.match(src, /patchDraftSet/);
    assert.match(src, /parseOptionalRpe10/);
    assert.doesNotMatch(src, /from ['"]@\/store\/workoutStore['"]/);
    assert.doesNotMatch(src, /swapExerciseInPlan|savePlan|generateWeek|savedWorkouts/);
    assert.doesNotMatch(src, /startWorkout|protectLiveStart|decideThisDeviceResume/);
    assert.doesNotMatch(src, /localStorage/);
    assert.doesNotMatch(src, /from ['"]@\/lib\/coach\/planEngine/);
    assert.doesNotMatch(src, /epley|1RM|one.?rep/i);
  });
});
