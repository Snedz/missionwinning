/**
 * Set kind on a finished History draft. Empty / junk /
 * unknown kind invent nothing. Same kind is noop.
 * Source draft is not mutated. No store.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';
import type { FinishedSessionDraft } from './editFinishedSession.ts';
import { countsTowardVolume } from './setKind.ts';
import {
  cycleFinishedSetKind,
  decidePatchFinishedSetKind,
} from './patchFinishedSetKind.ts';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

describe('decidePatchFinishedSetKind (.1039)', () => {
  const two: FinishedSessionDraft = {
    exercises: [
      {
        exerciseId: 'bench-press',
        note: 'paused',
        sets: [
          { reps: 8, weight: 95, kind: 'warmup' },
          { reps: 5, weight: 135 },
          { reps: 8, weight: 95, kind: 'drop' },
        ],
      },
      { exerciseId: 'squats', sets: [{ reps: 8, weight: 185 }] },
    ],
  };

  it('missing draft / not an array / junk indexes / unknown kind are empty', () => {
    assert.equal(
      decidePatchFinishedSetKind({
        draft: null,
        exerciseIndex: 0,
        setIndex: 0,
        kind: 'warmup',
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetKind({
        draft: undefined,
        exerciseIndex: 0,
        setIndex: 0,
        kind: 'warmup',
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetKind({
        draft: { exercises: null as unknown as [] },
        exerciseIndex: 0,
        setIndex: 0,
        kind: 'warmup',
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetKind({
        draft: two,
        exerciseIndex: 0.5,
        setIndex: 0,
        kind: 'warmup',
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetKind({
        draft: two,
        exerciseIndex: '0',
        setIndex: 0,
        kind: 'warmup',
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetKind({
        draft: two,
        exerciseIndex: Number.NaN,
        setIndex: 0,
        kind: 'warmup',
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetKind({
        draft: two,
        exerciseIndex: 0,
        setIndex: null,
        kind: 'warmup',
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetKind({
        draft: two,
        exerciseIndex: 0,
        setIndex: 0,
        kind: 'work',
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetKind({
        draft: two,
        exerciseIndex: 0,
        setIndex: 0,
        kind: 'W',
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetKind({
        draft: two,
        exerciseIndex: 0,
        setIndex: 0,
        kind: '',
      }).kind,
      'empty'
    );
  });

  it('out of range / same kind as current are noop', () => {
    assert.equal(
      decidePatchFinishedSetKind({
        draft: two,
        exerciseIndex: 2,
        setIndex: 0,
        kind: 'warmup',
      }).kind,
      'noop'
    );
    assert.equal(
      decidePatchFinishedSetKind({
        draft: two,
        exerciseIndex: -1,
        setIndex: 0,
        kind: 'warmup',
      }).kind,
      'noop'
    );
    assert.equal(
      decidePatchFinishedSetKind({
        draft: two,
        exerciseIndex: 0,
        setIndex: 3,
        kind: 'warmup',
      }).kind,
      'noop'
    );
    assert.equal(
      decidePatchFinishedSetKind({
        draft: two,
        exerciseIndex: 0,
        setIndex: 0,
        kind: 'warmup',
      }).kind,
      'noop'
    );
    assert.equal(
      decidePatchFinishedSetKind({
        draft: two,
        exerciseIndex: 0,
        setIndex: 1,
        kind: 'normal',
      }).kind,
      'noop'
    );
  });

  it('warmup to normal applies; missing current is treated as normal', () => {
    const decision = decidePatchFinishedSetKind({
      draft: two,
      exerciseIndex: 0,
      setIndex: 0,
      kind: 'normal',
    });
    assert.equal(decision.kind, 'apply');
    if (decision.kind !== 'apply') return;
    assert.equal(decision.draft.exercises[0]?.sets[0]?.kind, 'normal');
    assert.equal(decision.draft.exercises[0]?.sets[0]?.weight, 95);
    assert.equal(decision.draft.exercises[0]?.sets[0]?.reps, 8);
    assert.equal(two.exercises[0]?.sets[0]?.kind, 'warmup');
    const alreadyWork = decidePatchFinishedSetKind({
      draft: two,
      exerciseIndex: 0,
      setIndex: 1,
      kind: 'normal',
    });
    assert.equal(alreadyWork.kind, 'noop');
    const markWorkAsWarmup = decidePatchFinishedSetKind({
      draft: two,
      exerciseIndex: 0,
      setIndex: 1,
      kind: 'warmup',
    });
    assert.equal(markWorkAsWarmup.kind, 'apply');
    if (markWorkAsWarmup.kind !== 'apply') return;
    assert.equal(markWorkAsWarmup.draft.exercises[0]?.sets[1]?.kind, 'warmup');
    assert.equal(two.exercises[0]?.sets[1]?.kind, undefined);
  });

  it('drop stays drop until toggled', () => {
    assert.equal(
      decidePatchFinishedSetKind({
        draft: two,
        exerciseIndex: 0,
        setIndex: 2,
        kind: 'drop',
      }).kind,
      'noop'
    );
    assert.equal(two.exercises[0]?.sets[2]?.kind, 'drop');
    assert.equal(cycleFinishedSetKind('drop'), 'failure');
    const cycled = decidePatchFinishedSetKind({
      draft: two,
      exerciseIndex: 0,
      setIndex: 2,
      kind: cycleFinishedSetKind('drop'),
    });
    assert.equal(cycled.kind, 'apply');
    if (cycled.kind !== 'apply') return;
    assert.equal(cycled.draft.exercises[0]?.sets[2]?.kind, 'failure');
    assert.equal(two.exercises[0]?.sets[2]?.kind, 'drop');
    assert.equal(cycleFinishedSetKind(undefined), 'warmup');
    assert.equal(cycleFinishedSetKind('normal'), 'warmup');
    assert.equal(cycleFinishedSetKind('warmup'), 'drop');
    assert.equal(cycleFinishedSetKind('failure'), 'normal');
  });

  it('clones so the source draft is not mutated', () => {
    const decision = decidePatchFinishedSetKind({
      draft: two,
      exerciseIndex: 0,
      setIndex: 0,
      kind: 'normal',
    });
    assert.equal(decision.kind, 'apply');
    if (decision.kind !== 'apply') return;
    decision.draft.exercises[0]!.sets[0]!.kind = 'failure';
    decision.draft.exercises[0]!.sets[0]!.weight = 999;
    decision.draft.exercises[0]!.exerciseId = 'wiped';
    decision.draft.exercises[1]!.sets[0]!.weight = 1;
    assert.equal(two.exercises[0]?.exerciseId, 'bench-press');
    assert.equal(two.exercises[0]?.note, 'paused');
    assert.equal(two.exercises[0]?.sets[0]?.kind, 'warmup');
    assert.equal(two.exercises[0]?.sets[0]?.weight, 95);
    assert.equal(two.exercises[1]?.exerciseId, 'squats');
    assert.equal(two.exercises[1]?.sets[0]?.weight, 185);
  });

  it('warmup still does not count toward volume', () => {
    assert.equal(countsTowardVolume('warmup'), false);
    assert.equal(countsTowardVolume('normal'), true);
    assert.equal(countsTowardVolume('drop'), true);
    const src = read('src/lib/workout/patchFinishedSetKind.ts');
    assert.doesNotMatch(src, /countsTowardVolume\s*=/);
  });
});

describe('patchFinishedSetKind wiring', () => {
  it('stays one home — no store / Wednesday write / live Start', () => {
    const src = read('src/lib/workout/patchFinishedSetKind.ts');
    assert.match(src, /decidePatchFinishedSetKind/);
    assert.match(src, /patchDraftSet/);
    assert.match(src, /toggleSetTag/);
    assert.match(src, /SET_KINDS/);
    assert.doesNotMatch(src, /from ['"]@\/store\/workoutStore['"]/);
    assert.doesNotMatch(src, /swapExerciseInPlan|savePlan|generateWeek|savedWorkouts/);
    assert.doesNotMatch(src, /startWorkout|protectLiveStart|decideThisDeviceResume/);
    assert.doesNotMatch(src, /localStorage/);
    assert.doesNotMatch(src, /from ['"]@\/lib\/coach\/planEngine/);
  });
});
