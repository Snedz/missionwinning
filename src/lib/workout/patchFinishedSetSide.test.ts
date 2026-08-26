/**
 * Optional L / R / Alt on a finished History draft.
 * Empty / junk indexes invent nothing. `left` invents
 * nothing. Squat + `L` invents nothing. Blank
 * clears. Same value is noop. Does not write
 * rpe / rpe10 / rir / kind. Source draft
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
import { decidePatchFinishedSetSide } from './patchFinishedSetSide.ts';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

describe('decidePatchFinishedSetSide (.1042)', () => {
  const two: FinishedSessionDraft = {
    exercises: [
      {
        exerciseId: 'lunges',
        note: 'paused',
        sets: [
          { reps: 8, weight: 20, side: 'L', rir: 2, rpe10: 8, rpe: 'hard', kind: 'normal' },
          { reps: 8, weight: 20 },
          { reps: 8, weight: 20, rpe: 'easy' },
        ],
      },
      { exerciseId: 'squats', sets: [{ reps: 8, weight: 185, rir: 3 }] },
      { exerciseId: 'dumbbell-row', sets: [{ reps: 10, weight: 30, side: 'R' }] },
    ],
  };

  it('missing draft / not an array / junk indexes are empty', () => {
    assert.equal(
      decidePatchFinishedSetSide({
        draft: null,
        exerciseIndex: 0,
        setIndex: 0,
        side: 'L',
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetSide({
        draft: undefined,
        exerciseIndex: 0,
        setIndex: 0,
        side: 'L',
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetSide({
        draft: { exercises: null as unknown as [] },
        exerciseIndex: 0,
        setIndex: 0,
        side: 'L',
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetSide({
        draft: two,
        exerciseIndex: 0.5,
        setIndex: 0,
        side: 'L',
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetSide({
        draft: two,
        exerciseIndex: '0',
        setIndex: 0,
        side: 'L',
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetSide({
        draft: two,
        exerciseIndex: Number.NaN,
        setIndex: 0,
        side: 'L',
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetSide({
        draft: two,
        exerciseIndex: 0,
        setIndex: null,
        side: 'L',
      }).kind,
      'empty'
    );
  });

  it('left / Left / normal / 1 invent nothing', () => {
    assert.equal(
      decidePatchFinishedSetSide({
        draft: two,
        exerciseIndex: 0,
        setIndex: 0,
        side: 'left',
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetSide({
        draft: two,
        exerciseIndex: 0,
        setIndex: 0,
        side: 'Left',
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetSide({
        draft: two,
        exerciseIndex: 0,
        setIndex: 0,
        side: 'normal',
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetSide({
        draft: two,
        exerciseIndex: 0,
        setIndex: 0,
        side: '1',
      }).kind,
      'empty'
    );
    assert.equal(two.exercises[0]?.sets[0]?.side, 'L');
  });

  it('squat / bench + L invents nothing — no side on bilateral', () => {
    assert.equal(
      decidePatchFinishedSetSide({
        draft: two,
        exerciseIndex: 1,
        setIndex: 0,
        side: 'L',
      }).kind,
      'empty'
    );
    const bench: FinishedSessionDraft = {
      exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 135 }] }],
    };
    assert.equal(
      decidePatchFinishedSetSide({
        draft: bench,
        exerciseIndex: 0,
        setIndex: 0,
        side: 'R',
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetSide({
        draft: bench,
        exerciseIndex: 0,
        setIndex: 0,
        side: 'alt',
      }).kind,
      'empty'
    );
    assert.equal(two.exercises[1]?.sets[0]?.side, undefined);
  });

  it('out of range set index / same value as current are noop', () => {
    assert.equal(
      decidePatchFinishedSetSide({
        draft: two,
        exerciseIndex: 4,
        setIndex: 0,
        side: 'L',
      }).kind,
      'noop'
    );
    assert.equal(
      decidePatchFinishedSetSide({
        draft: two,
        exerciseIndex: -1,
        setIndex: 0,
        side: 'L',
      }).kind,
      'noop'
    );
    assert.equal(
      decidePatchFinishedSetSide({
        draft: two,
        exerciseIndex: 0,
        setIndex: 3,
        side: 'L',
      }).kind,
      'noop'
    );
    assert.equal(
      decidePatchFinishedSetSide({
        draft: two,
        exerciseIndex: 0,
        setIndex: 0,
        side: 'L',
      }).kind,
      'noop'
    );
    assert.equal(
      decidePatchFinishedSetSide({
        draft: two,
        exerciseIndex: 0,
        setIndex: 1,
        side: '',
      }).kind,
      'noop'
    );
    assert.equal(
      decidePatchFinishedSetSide({
        draft: two,
        exerciseIndex: 0,
        setIndex: 1,
        side: null,
      }).kind,
      'noop'
    );
    assert.equal(
      decidePatchFinishedSetSide({
        draft: two,
        exerciseIndex: 0,
        setIndex: 1,
        side: undefined,
      }).kind,
      'noop'
    );
  });

  it('L apply on a lunge / db-row; blank clears; field is absent after clear', () => {
    const applyL = decidePatchFinishedSetSide({
      draft: two,
      exerciseIndex: 0,
      setIndex: 1,
      side: 'L',
    });
    assert.equal(applyL.kind, 'apply');
    if (applyL.kind !== 'apply') return;
    assert.equal(applyL.draft.exercises[0]?.sets[1]?.side, 'L');
    assert.equal(applyL.draft.exercises[0]?.sets[1]?.weight, 20);
    assert.equal(applyL.draft.exercises[0]?.sets[1]?.reps, 8);
    assert.equal(two.exercises[0]?.sets[1]?.side, undefined);
    assert.equal(
      Object.prototype.hasOwnProperty.call(two.exercises[0]?.sets[1] ?? {}, 'side'),
      false
    );

    const applyAlt = decidePatchFinishedSetSide({
      draft: two,
      exerciseIndex: 2,
      setIndex: 0,
      side: 'alt',
    });
    assert.equal(applyAlt.kind, 'apply');
    if (applyAlt.kind !== 'apply') return;
    assert.equal(applyAlt.draft.exercises[2]?.sets[0]?.side, 'alt');
    assert.equal(two.exercises[2]?.sets[0]?.side, 'R');

    const clear = decidePatchFinishedSetSide({
      draft: two,
      exerciseIndex: 0,
      setIndex: 0,
      side: '',
    });
    assert.equal(clear.kind, 'apply');
    if (clear.kind !== 'apply') return;
    assert.equal(clear.draft.exercises[0]?.sets[0]?.side, undefined);
    assert.equal(
      Object.prototype.hasOwnProperty.call(clear.draft.exercises[0]?.sets[0] ?? {}, 'side'),
      false,
      'clear must omit the field, not store undefined'
    );
    assert.equal(two.exercises[0]?.sets[0]?.side, 'L');

    const clearNull = decidePatchFinishedSetSide({
      draft: two,
      exerciseIndex: 2,
      setIndex: 0,
      side: null,
    });
    assert.equal(clearNull.kind, 'apply');
    if (clearNull.kind !== 'apply') return;
    assert.equal(
      Object.prototype.hasOwnProperty.call(clearNull.draft.exercises[2]?.sets[0] ?? {}, 'side'),
      false
    );
  });

  it('does not write rpe, rpe10, rir, or kind', () => {
    const decision = decidePatchFinishedSetSide({
      draft: two,
      exerciseIndex: 0,
      setIndex: 0,
      side: 'R',
    });
    assert.equal(decision.kind, 'apply');
    if (decision.kind !== 'apply') return;
    assert.equal(decision.draft.exercises[0]?.sets[0]?.side, 'R');
    assert.equal(decision.draft.exercises[0]?.sets[0]?.rpe10, 8);
    assert.equal(decision.draft.exercises[0]?.sets[0]?.rpe, 'hard');
    assert.equal(decision.draft.exercises[0]?.sets[0]?.rir, 2);
    assert.equal(decision.draft.exercises[0]?.sets[0]?.kind, 'normal');
    const ontoEmpty = decidePatchFinishedSetSide({
      draft: two,
      exerciseIndex: 0,
      setIndex: 1,
      side: 'L',
    });
    assert.equal(ontoEmpty.kind, 'apply');
    if (ontoEmpty.kind !== 'apply') return;
    assert.equal(ontoEmpty.draft.exercises[0]?.sets[1]?.side, 'L');
    assert.equal(ontoEmpty.draft.exercises[0]?.sets[1]?.rpe10, undefined);
    assert.equal(ontoEmpty.draft.exercises[0]?.sets[1]?.rpe, undefined);
    assert.equal(ontoEmpty.draft.exercises[0]?.sets[1]?.rir, undefined);
    assert.equal(ontoEmpty.draft.exercises[0]?.sets[1]?.kind, undefined);
    const src = read('src/lib/workout/patchFinishedSetSide.ts');
    assert.doesNotMatch(src, /rpe10:\s*parsed/);
    assert.doesNotMatch(src, /rpe:\s*parsed/);
    assert.doesNotMatch(src, /rir:\s*parsed/);
    assert.doesNotMatch(src, /kind:\s*parsed/);
    assert.doesNotMatch(src, /rpe:\s*['"](?:easy|med|hard)['"]/);
    assert.doesNotMatch(src, /UNILATERAL_RE/);
  });

  it('clones so the source draft is not mutated', () => {
    const decision = decidePatchFinishedSetSide({
      draft: two,
      exerciseIndex: 0,
      setIndex: 0,
      side: 'R',
    });
    assert.equal(decision.kind, 'apply');
    if (decision.kind !== 'apply') return;
    decision.draft.exercises[0]!.sets[0]!.side = 'alt';
    decision.draft.exercises[0]!.sets[0]!.weight = 999;
    decision.draft.exercises[0]!.exerciseId = 'wiped';
    decision.draft.exercises[1]!.sets[0]!.weight = 1;
    assert.equal(two.exercises[0]?.exerciseId, 'lunges');
    assert.equal(two.exercises[0]?.note, 'paused');
    assert.equal(two.exercises[0]?.sets[0]?.side, 'L');
    assert.equal(two.exercises[0]?.sets[0]?.weight, 20);
    assert.equal(two.exercises[0]?.sets[0]?.rpe10, 8);
    assert.equal(two.exercises[0]?.sets[0]?.rpe, 'hard');
    assert.equal(two.exercises[0]?.sets[0]?.rir, 2);
    assert.equal(two.exercises[1]?.exerciseId, 'squats');
    assert.equal(two.exercises[1]?.sets[0]?.weight, 185);
    assert.equal(two.exercises[1]?.sets[0]?.rir, 3);
  });

  it('Save still decideEditSave — side-only change applies; same log id', () => {
    const original: CompletedWorkoutLog = {
      id: 'log-1',
      clientId: 'cid-1',
      revision: 1,
      workoutName: 'Legs',
      startedAt: '2026-08-17T10:00:00.000Z',
      completedAt: '2026-08-17T11:00:00.000Z',
      durationSeconds: 3600,
      totalVolume: 160,
      exercises: [
        {
          exerciseId: 'lunges',
          sets: [{ reps: 8, weight: 20, rpe: 'hard', rpe10: 8, rir: 2, kind: 'normal' }],
        },
      ],
    };
    const patched = decidePatchFinishedSetSide({
      draft: {
        exercises: original.exercises.map((ex) => ({
          ...ex,
          sets: ex.sets.map((s) => ({ ...s })),
        })),
      },
      exerciseIndex: 0,
      setIndex: 0,
      side: 'L',
    });
    assert.equal(patched.kind, 'apply');
    if (patched.kind !== 'apply') return;
    const decision = decideEditSave({ original, draft: patched.draft });
    assert.equal(decision.kind, 'apply');
    if (decision.kind !== 'apply') return;
    assert.equal(decision.next.id, 'log-1');
    assert.equal(decision.next.clientId, 'cid-1');
    assert.equal(decision.next.exercises[0]?.sets[0]?.side, 'L');
    assert.equal(decision.next.exercises[0]?.sets[0]?.rpe10, 8);
    assert.equal(decision.next.exercises[0]?.sets[0]?.rpe, 'hard');
    assert.equal(decision.next.exercises[0]?.sets[0]?.rir, 2);
    assert.equal(decision.next.exercises[0]?.sets[0]?.kind, 'normal');
    assert.equal(decision.next.exercises[0]?.sets[0]?.weight, 20);
    assert.equal(decision.next.deletedAt, null);
  });
});

describe('patchFinishedSetSide wiring', () => {
  it('stays one home — no store / Wednesday write / live Start', () => {
    const src = read('src/lib/workout/patchFinishedSetSide.ts');
    assert.match(src, /decidePatchFinishedSetSide/);
    assert.match(src, /patchDraftSet/);
    assert.match(src, /parseSetSide/);
    assert.match(src, /persistableSetSide/);
    assert.match(src, /shouldOfferSetSide/);
    assert.doesNotMatch(src, /from ['"]@\/store\/workoutStore['"]/);
    assert.doesNotMatch(src, /swapExerciseInPlan|savePlan|generateWeek|savedWorkouts/);
    assert.doesNotMatch(src, /startWorkout|protectLiveStart|decideThisDeviceResume/);
    assert.doesNotMatch(src, /localStorage/);
    assert.doesNotMatch(src, /from ['"]@\/lib\/coach\/planEngine/);
    assert.doesNotMatch(src, /epley|1RM|one.?rep/i);
    assert.doesNotMatch(src, /UNILATERAL_RE/);
  });
});
