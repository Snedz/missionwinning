/**
 * Optional 0–5 RIR on a finished History draft.
 * Empty / junk indexes invent nothing. 6 invents
 * nothing. Blank clears. Same value is noop.
 * Does not write rpe / rpe10. Source draft
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
import { decidePatchFinishedSetRir } from './patchFinishedSetRir.ts';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

describe('decidePatchFinishedSetRir (.1041)', () => {
  const two: FinishedSessionDraft = {
    exercises: [
      {
        exerciseId: 'bench-press',
        note: 'paused',
        sets: [
          { reps: 8, weight: 95, rir: 2, rpe10: 8, rpe: 'hard' },
          { reps: 5, weight: 135 },
          { reps: 8, weight: 95, rpe: 'easy' },
        ],
      },
      { exerciseId: 'squats', sets: [{ reps: 8, weight: 185, rir: 3 }] },
    ],
  };

  it('missing draft / not an array / junk indexes are empty', () => {
    assert.equal(
      decidePatchFinishedSetRir({
        draft: null,
        exerciseIndex: 0,
        setIndex: 0,
        rir: 2,
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetRir({
        draft: undefined,
        exerciseIndex: 0,
        setIndex: 0,
        rir: 2,
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetRir({
        draft: { exercises: null as unknown as [] },
        exerciseIndex: 0,
        setIndex: 0,
        rir: 2,
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetRir({
        draft: two,
        exerciseIndex: 0.5,
        setIndex: 0,
        rir: 2,
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetRir({
        draft: two,
        exerciseIndex: '0',
        setIndex: 0,
        rir: 2,
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetRir({
        draft: two,
        exerciseIndex: Number.NaN,
        setIndex: 0,
        rir: 2,
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetRir({
        draft: two,
        exerciseIndex: 0,
        setIndex: null,
        rir: 2,
      }).kind,
      'empty'
    );
  });

  it('6 invents nothing — out of range is empty, never clamped', () => {
    assert.equal(
      decidePatchFinishedSetRir({
        draft: two,
        exerciseIndex: 0,
        setIndex: 0,
        rir: 6,
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetRir({
        draft: two,
        exerciseIndex: 0,
        setIndex: 0,
        rir: 10,
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetRir({
        draft: two,
        exerciseIndex: 0,
        setIndex: 0,
        rir: 'nope',
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetRir({
        draft: two,
        exerciseIndex: 0,
        setIndex: 0,
        rir: '6',
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetRir({
        draft: two,
        exerciseIndex: 0,
        setIndex: 0,
        rir: 2.5,
      }).kind,
      'empty'
    );
    assert.equal(two.exercises[0]?.sets[0]?.rir, 2);
  });

  it('out of range set index / same value as current are noop', () => {
    assert.equal(
      decidePatchFinishedSetRir({
        draft: two,
        exerciseIndex: 2,
        setIndex: 0,
        rir: 2,
      }).kind,
      'noop'
    );
    assert.equal(
      decidePatchFinishedSetRir({
        draft: two,
        exerciseIndex: -1,
        setIndex: 0,
        rir: 2,
      }).kind,
      'noop'
    );
    assert.equal(
      decidePatchFinishedSetRir({
        draft: two,
        exerciseIndex: 0,
        setIndex: 3,
        rir: 2,
      }).kind,
      'noop'
    );
    assert.equal(
      decidePatchFinishedSetRir({
        draft: two,
        exerciseIndex: 0,
        setIndex: 0,
        rir: 2,
      }).kind,
      'noop'
    );
    assert.equal(
      decidePatchFinishedSetRir({
        draft: two,
        exerciseIndex: 0,
        setIndex: 0,
        rir: '2',
      }).kind,
      'noop'
    );
    assert.equal(
      decidePatchFinishedSetRir({
        draft: two,
        exerciseIndex: 0,
        setIndex: 1,
        rir: '',
      }).kind,
      'noop'
    );
    assert.equal(
      decidePatchFinishedSetRir({
        draft: two,
        exerciseIndex: 0,
        setIndex: 1,
        rir: null,
      }).kind,
      'noop'
    );
    assert.equal(
      decidePatchFinishedSetRir({
        draft: two,
        exerciseIndex: 0,
        setIndex: 1,
        rir: undefined,
      }).kind,
      'noop'
    );
  });

  it('2 apply; blank clears; field is absent after clear', () => {
    const apply2 = decidePatchFinishedSetRir({
      draft: two,
      exerciseIndex: 0,
      setIndex: 1,
      rir: 2,
    });
    assert.equal(apply2.kind, 'apply');
    if (apply2.kind !== 'apply') return;
    assert.equal(apply2.draft.exercises[0]?.sets[1]?.rir, 2);
    assert.equal(apply2.draft.exercises[0]?.sets[1]?.weight, 135);
    assert.equal(apply2.draft.exercises[0]?.sets[1]?.reps, 5);
    assert.equal(two.exercises[0]?.sets[1]?.rir, undefined);
    assert.equal(
      Object.prototype.hasOwnProperty.call(two.exercises[0]?.sets[1] ?? {}, 'rir'),
      false
    );

    const clear = decidePatchFinishedSetRir({
      draft: two,
      exerciseIndex: 0,
      setIndex: 0,
      rir: '',
    });
    assert.equal(clear.kind, 'apply');
    if (clear.kind !== 'apply') return;
    assert.equal(clear.draft.exercises[0]?.sets[0]?.rir, undefined);
    assert.equal(
      Object.prototype.hasOwnProperty.call(clear.draft.exercises[0]?.sets[0] ?? {}, 'rir'),
      false,
      'clear must omit the field, not store undefined'
    );
    assert.equal(two.exercises[0]?.sets[0]?.rir, 2);

    const clearNull = decidePatchFinishedSetRir({
      draft: two,
      exerciseIndex: 1,
      setIndex: 0,
      rir: null,
    });
    assert.equal(clearNull.kind, 'apply');
    if (clearNull.kind !== 'apply') return;
    assert.equal(
      Object.prototype.hasOwnProperty.call(clearNull.draft.exercises[1]?.sets[0] ?? {}, 'rir'),
      false
    );
  });

  it('does not write rpe10 or categorical rpe', () => {
    const decision = decidePatchFinishedSetRir({
      draft: two,
      exerciseIndex: 0,
      setIndex: 0,
      rir: 0,
    });
    assert.equal(decision.kind, 'apply');
    if (decision.kind !== 'apply') return;
    assert.equal(decision.draft.exercises[0]?.sets[0]?.rir, 0);
    assert.equal(decision.draft.exercises[0]?.sets[0]?.rpe10, 8);
    assert.equal(decision.draft.exercises[0]?.sets[0]?.rpe, 'hard');
    const ontoEmpty = decidePatchFinishedSetRir({
      draft: two,
      exerciseIndex: 0,
      setIndex: 1,
      rir: 2,
    });
    assert.equal(ontoEmpty.kind, 'apply');
    if (ontoEmpty.kind !== 'apply') return;
    assert.equal(ontoEmpty.draft.exercises[0]?.sets[1]?.rir, 2);
    assert.equal(ontoEmpty.draft.exercises[0]?.sets[1]?.rpe10, undefined);
    assert.equal(ontoEmpty.draft.exercises[0]?.sets[1]?.rpe, undefined);
    const src = read('src/lib/workout/patchFinishedSetRir.ts');
    assert.doesNotMatch(src, /rpe10:\s*parsed/);
    assert.doesNotMatch(src, /rpe:\s*parsed/);
    assert.doesNotMatch(src, /rpe:\s*['"](?:easy|med|hard)['"]/);
  });

  it('clones so the source draft is not mutated', () => {
    const decision = decidePatchFinishedSetRir({
      draft: two,
      exerciseIndex: 0,
      setIndex: 0,
      rir: 1,
    });
    assert.equal(decision.kind, 'apply');
    if (decision.kind !== 'apply') return;
    decision.draft.exercises[0]!.sets[0]!.rir = 5;
    decision.draft.exercises[0]!.sets[0]!.weight = 999;
    decision.draft.exercises[0]!.exerciseId = 'wiped';
    decision.draft.exercises[1]!.sets[0]!.weight = 1;
    assert.equal(two.exercises[0]?.exerciseId, 'bench-press');
    assert.equal(two.exercises[0]?.note, 'paused');
    assert.equal(two.exercises[0]?.sets[0]?.rir, 2);
    assert.equal(two.exercises[0]?.sets[0]?.weight, 95);
    assert.equal(two.exercises[0]?.sets[0]?.rpe10, 8);
    assert.equal(two.exercises[0]?.sets[0]?.rpe, 'hard');
    assert.equal(two.exercises[1]?.exerciseId, 'squats');
    assert.equal(two.exercises[1]?.sets[0]?.weight, 185);
    assert.equal(two.exercises[1]?.sets[0]?.rir, 3);
  });

  it('Save still decideEditSave — rir-only change applies; same log id', () => {
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
          sets: [{ reps: 5, weight: 135, rpe: 'hard', rpe10: 8 }],
        },
      ],
    };
    const patched = decidePatchFinishedSetRir({
      draft: { exercises: original.exercises.map((ex) => ({ ...ex, sets: ex.sets.map((s) => ({ ...s })) })) },
      exerciseIndex: 0,
      setIndex: 0,
      rir: 2,
    });
    assert.equal(patched.kind, 'apply');
    if (patched.kind !== 'apply') return;
    const decision = decideEditSave({ original, draft: patched.draft });
    assert.equal(decision.kind, 'apply');
    if (decision.kind !== 'apply') return;
    assert.equal(decision.next.id, 'log-1');
    assert.equal(decision.next.clientId, 'cid-1');
    assert.equal(decision.next.exercises[0]?.sets[0]?.rir, 2);
    assert.equal(decision.next.exercises[0]?.sets[0]?.rpe10, 8);
    assert.equal(decision.next.exercises[0]?.sets[0]?.rpe, 'hard');
    assert.equal(decision.next.exercises[0]?.sets[0]?.weight, 135);
    assert.equal(decision.next.deletedAt, null);
  });
});

describe('patchFinishedSetRir wiring', () => {
  it('stays one home — no store / Wednesday write / live Start', () => {
    const src = read('src/lib/workout/patchFinishedSetRir.ts');
    assert.match(src, /decidePatchFinishedSetRir/);
    assert.match(src, /patchDraftSet/);
    assert.match(src, /parseOptionalRir/);
    assert.doesNotMatch(src, /from ['"]@\/store\/workoutStore['"]/);
    assert.doesNotMatch(src, /swapExerciseInPlan|savePlan|generateWeek|savedWorkouts/);
    assert.doesNotMatch(src, /startWorkout|protectLiveStart|decideThisDeviceResume/);
    assert.doesNotMatch(src, /localStorage/);
    assert.doesNotMatch(src, /from ['"]@\/lib\/coach\/planEngine/);
    assert.doesNotMatch(src, /epley|1RM|one.?rep/i);
  });
});
