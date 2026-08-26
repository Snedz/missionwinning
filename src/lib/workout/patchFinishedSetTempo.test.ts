/**
 * Optional e-p-c tempo on a finished History draft.
 * Empty / junk indexes invent nothing. `311` /
 * `10-0-0` invent nothing. Blank clears. Same
 * value is noop. Does not write rpe / rpe10 /
 * rir / kind / side. Source draft is not
 * mutated. No store. No rememberLastTempo.
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
import { decidePatchFinishedSetTempo } from './patchFinishedSetTempo.ts';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

describe('decidePatchFinishedSetTempo (.1043)', () => {
  const two: FinishedSessionDraft = {
    exercises: [
      {
        exerciseId: 'bench-press',
        note: 'paused',
        sets: [
          {
            reps: 8,
            weight: 95,
            tempo: { ecc: 3, pause: 1, con: 1 },
            rir: 2,
            rpe10: 8,
            rpe: 'hard',
            kind: 'normal',
            side: 'L',
          },
          { reps: 5, weight: 135 },
          { reps: 8, weight: 95, rpe: 'easy' },
        ],
      },
      { exerciseId: 'squats', sets: [{ reps: 8, weight: 185, rir: 3 }] },
    ],
  };

  it('missing draft / not an array / junk indexes are empty', () => {
    assert.equal(
      decidePatchFinishedSetTempo({
        draft: null,
        exerciseIndex: 0,
        setIndex: 0,
        tempo: '3-1-1',
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetTempo({
        draft: undefined,
        exerciseIndex: 0,
        setIndex: 0,
        tempo: '3-1-1',
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetTempo({
        draft: { exercises: null as unknown as [] },
        exerciseIndex: 0,
        setIndex: 0,
        tempo: '3-1-1',
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetTempo({
        draft: two,
        exerciseIndex: 0.5,
        setIndex: 0,
        tempo: '3-1-1',
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetTempo({
        draft: two,
        exerciseIndex: '0',
        setIndex: 0,
        tempo: '3-1-1',
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetTempo({
        draft: two,
        exerciseIndex: Number.NaN,
        setIndex: 0,
        tempo: '3-1-1',
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetTempo({
        draft: two,
        exerciseIndex: 0,
        setIndex: null,
        tempo: '3-1-1',
      }).kind,
      'empty'
    );
  });

  it('311 / 10-0-0 / 4-count / nope / number / boolean invent nothing', () => {
    assert.equal(
      decidePatchFinishedSetTempo({
        draft: two,
        exerciseIndex: 0,
        setIndex: 0,
        tempo: '311',
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetTempo({
        draft: two,
        exerciseIndex: 0,
        setIndex: 0,
        tempo: '10-0-0',
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetTempo({
        draft: two,
        exerciseIndex: 0,
        setIndex: 0,
        tempo: '3-1-1-1',
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetTempo({
        draft: two,
        exerciseIndex: 0,
        setIndex: 0,
        tempo: 'nope',
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetTempo({
        draft: two,
        exerciseIndex: 0,
        setIndex: 0,
        tempo: 311,
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetTempo({
        draft: two,
        exerciseIndex: 0,
        setIndex: 0,
        tempo: true,
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetTempo({
        draft: two,
        exerciseIndex: 0,
        setIndex: 0,
        tempo: { ecc: 10, pause: 0, con: 0 },
      }).kind,
      'empty'
    );
    assert.deepEqual(two.exercises[0]?.sets[0]?.tempo, { ecc: 3, pause: 1, con: 1 });
  });

  it('out of range set index / same value as current are noop', () => {
    assert.equal(
      decidePatchFinishedSetTempo({
        draft: two,
        exerciseIndex: 2,
        setIndex: 0,
        tempo: '3-1-1',
      }).kind,
      'noop'
    );
    assert.equal(
      decidePatchFinishedSetTempo({
        draft: two,
        exerciseIndex: -1,
        setIndex: 0,
        tempo: '3-1-1',
      }).kind,
      'noop'
    );
    assert.equal(
      decidePatchFinishedSetTempo({
        draft: two,
        exerciseIndex: 0,
        setIndex: 3,
        tempo: '3-1-1',
      }).kind,
      'noop'
    );
    assert.equal(
      decidePatchFinishedSetTempo({
        draft: two,
        exerciseIndex: 0,
        setIndex: 0,
        tempo: '3-1-1',
      }).kind,
      'noop'
    );
    assert.equal(
      decidePatchFinishedSetTempo({
        draft: two,
        exerciseIndex: 0,
        setIndex: 0,
        tempo: { ecc: 3, pause: 1, con: 1 },
      }).kind,
      'noop'
    );
    assert.equal(
      decidePatchFinishedSetTempo({
        draft: two,
        exerciseIndex: 0,
        setIndex: 1,
        tempo: '',
      }).kind,
      'noop'
    );
    assert.equal(
      decidePatchFinishedSetTempo({
        draft: two,
        exerciseIndex: 0,
        setIndex: 1,
        tempo: null,
      }).kind,
      'noop'
    );
    assert.equal(
      decidePatchFinishedSetTempo({
        draft: two,
        exerciseIndex: 0,
        setIndex: 1,
        tempo: undefined,
      }).kind,
      'noop'
    );
  });

  it('3-1-1 apply; blank clears; field is absent after clear', () => {
    const apply311 = decidePatchFinishedSetTempo({
      draft: two,
      exerciseIndex: 0,
      setIndex: 1,
      tempo: '3-1-1',
    });
    assert.equal(apply311.kind, 'apply');
    if (apply311.kind !== 'apply') return;
    assert.deepEqual(apply311.draft.exercises[0]?.sets[1]?.tempo, {
      ecc: 3,
      pause: 1,
      con: 1,
    });
    assert.equal(apply311.draft.exercises[0]?.sets[1]?.weight, 135);
    assert.equal(apply311.draft.exercises[0]?.sets[1]?.reps, 5);
    assert.equal(two.exercises[0]?.sets[1]?.tempo, undefined);
    assert.equal(
      Object.prototype.hasOwnProperty.call(two.exercises[0]?.sets[1] ?? {}, 'tempo'),
      false
    );

    const applyObj = decidePatchFinishedSetTempo({
      draft: two,
      exerciseIndex: 1,
      setIndex: 0,
      tempo: { ecc: 2, pause: 0, con: 1 },
    });
    assert.equal(applyObj.kind, 'apply');
    if (applyObj.kind !== 'apply') return;
    assert.deepEqual(applyObj.draft.exercises[1]?.sets[0]?.tempo, {
      ecc: 2,
      pause: 0,
      con: 1,
    });

    const clear = decidePatchFinishedSetTempo({
      draft: two,
      exerciseIndex: 0,
      setIndex: 0,
      tempo: '',
    });
    assert.equal(clear.kind, 'apply');
    if (clear.kind !== 'apply') return;
    assert.equal(clear.draft.exercises[0]?.sets[0]?.tempo, undefined);
    assert.equal(
      Object.prototype.hasOwnProperty.call(clear.draft.exercises[0]?.sets[0] ?? {}, 'tempo'),
      false,
      'clear must omit the field, not store undefined'
    );
    assert.deepEqual(two.exercises[0]?.sets[0]?.tempo, { ecc: 3, pause: 1, con: 1 });

    const clearNull = decidePatchFinishedSetTempo({
      draft: two,
      exerciseIndex: 0,
      setIndex: 0,
      tempo: null,
    });
    assert.equal(clearNull.kind, 'apply');
    if (clearNull.kind !== 'apply') return;
    assert.equal(
      Object.prototype.hasOwnProperty.call(clearNull.draft.exercises[0]?.sets[0] ?? {}, 'tempo'),
      false
    );
  });

  it('does not write rpe, rpe10, rir, kind, or side', () => {
    const decision = decidePatchFinishedSetTempo({
      draft: two,
      exerciseIndex: 0,
      setIndex: 0,
      tempo: '4-2-1',
    });
    assert.equal(decision.kind, 'apply');
    if (decision.kind !== 'apply') return;
    assert.deepEqual(decision.draft.exercises[0]?.sets[0]?.tempo, {
      ecc: 4,
      pause: 2,
      con: 1,
    });
    assert.equal(decision.draft.exercises[0]?.sets[0]?.rpe10, 8);
    assert.equal(decision.draft.exercises[0]?.sets[0]?.rpe, 'hard');
    assert.equal(decision.draft.exercises[0]?.sets[0]?.rir, 2);
    assert.equal(decision.draft.exercises[0]?.sets[0]?.kind, 'normal');
    assert.equal(decision.draft.exercises[0]?.sets[0]?.side, 'L');
    const ontoEmpty = decidePatchFinishedSetTempo({
      draft: two,
      exerciseIndex: 0,
      setIndex: 1,
      tempo: '3-1-1',
    });
    assert.equal(ontoEmpty.kind, 'apply');
    if (ontoEmpty.kind !== 'apply') return;
    assert.deepEqual(ontoEmpty.draft.exercises[0]?.sets[1]?.tempo, {
      ecc: 3,
      pause: 1,
      con: 1,
    });
    assert.equal(ontoEmpty.draft.exercises[0]?.sets[1]?.rpe10, undefined);
    assert.equal(ontoEmpty.draft.exercises[0]?.sets[1]?.rpe, undefined);
    assert.equal(ontoEmpty.draft.exercises[0]?.sets[1]?.rir, undefined);
    assert.equal(ontoEmpty.draft.exercises[0]?.sets[1]?.kind, undefined);
    assert.equal(ontoEmpty.draft.exercises[0]?.sets[1]?.side, undefined);
    const src = read('src/lib/workout/patchFinishedSetTempo.ts');
    assert.doesNotMatch(src, /rpe10:\s*parsed/);
    assert.doesNotMatch(src, /rpe:\s*parsed/);
    assert.doesNotMatch(src, /rir:\s*parsed/);
    assert.doesNotMatch(src, /kind:\s*parsed/);
    assert.doesNotMatch(src, /side:\s*parsed/);
    assert.doesNotMatch(src, /rpe:\s*['"](?:easy|med|hard)['"]/);
  });

  it('clones so the source draft is not mutated', () => {
    const decision = decidePatchFinishedSetTempo({
      draft: two,
      exerciseIndex: 0,
      setIndex: 0,
      tempo: '4-2-1',
    });
    assert.equal(decision.kind, 'apply');
    if (decision.kind !== 'apply') return;
    decision.draft.exercises[0]!.sets[0]!.tempo = { ecc: 9, pause: 9, con: 9 };
    decision.draft.exercises[0]!.sets[0]!.weight = 999;
    decision.draft.exercises[0]!.exerciseId = 'wiped';
    decision.draft.exercises[1]!.sets[0]!.weight = 1;
    assert.equal(two.exercises[0]?.exerciseId, 'bench-press');
    assert.equal(two.exercises[0]?.note, 'paused');
    assert.deepEqual(two.exercises[0]?.sets[0]?.tempo, { ecc: 3, pause: 1, con: 1 });
    assert.equal(two.exercises[0]?.sets[0]?.weight, 95);
    assert.equal(two.exercises[0]?.sets[0]?.rpe10, 8);
    assert.equal(two.exercises[0]?.sets[0]?.rpe, 'hard');
    assert.equal(two.exercises[0]?.sets[0]?.rir, 2);
    assert.equal(two.exercises[1]?.exerciseId, 'squats');
    assert.equal(two.exercises[1]?.sets[0]?.weight, 185);
    assert.equal(two.exercises[1]?.sets[0]?.rir, 3);
  });

  it('Save still decideEditSave — tempo-only change applies; same log id', () => {
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
          sets: [{ reps: 5, weight: 135, rpe: 'hard', rpe10: 8, rir: 2, kind: 'normal' }],
        },
      ],
    };
    const patched = decidePatchFinishedSetTempo({
      draft: {
        exercises: original.exercises.map((ex) => ({
          ...ex,
          sets: ex.sets.map((s) => ({ ...s })),
        })),
      },
      exerciseIndex: 0,
      setIndex: 0,
      tempo: '3-1-1',
    });
    assert.equal(patched.kind, 'apply');
    if (patched.kind !== 'apply') return;
    const decision = decideEditSave({ original, draft: patched.draft });
    assert.equal(decision.kind, 'apply');
    if (decision.kind !== 'apply') return;
    assert.equal(decision.next.id, 'log-1');
    assert.equal(decision.next.clientId, 'cid-1');
    assert.deepEqual(decision.next.exercises[0]?.sets[0]?.tempo, {
      ecc: 3,
      pause: 1,
      con: 1,
    });
    assert.equal(decision.next.exercises[0]?.sets[0]?.rpe10, 8);
    assert.equal(decision.next.exercises[0]?.sets[0]?.rpe, 'hard');
    assert.equal(decision.next.exercises[0]?.sets[0]?.rir, 2);
    assert.equal(decision.next.exercises[0]?.sets[0]?.kind, 'normal');
    assert.equal(decision.next.exercises[0]?.sets[0]?.weight, 135);
    assert.equal(decision.next.deletedAt, null);
  });
});

describe('patchFinishedSetTempo wiring', () => {
  it('stays one home — no store / Wednesday write / live Start / rememberLastTempo', () => {
    const src = read('src/lib/workout/patchFinishedSetTempo.ts');
    assert.match(src, /decidePatchFinishedSetTempo/);
    assert.match(src, /patchDraftSet/);
    assert.match(src, /parseOptionalTempo/);
    assert.match(src, /temposEqual/);
    assert.doesNotMatch(src, /rememberLastTempo/);
    assert.doesNotMatch(src, /recallLastTempo/);
    assert.doesNotMatch(src, /readJson|writeJson|STORAGE_KEYS/);
    assert.doesNotMatch(src, /from ['"]@\/store\/workoutStore['"]/);
    assert.doesNotMatch(src, /swapExerciseInPlan|savePlan|generateWeek|savedWorkouts/);
    assert.doesNotMatch(src, /startWorkout|protectLiveStart|decideThisDeviceResume/);
    assert.doesNotMatch(src, /localStorage/);
    assert.doesNotMatch(src, /from ['"]@\/lib\/coach\/planEngine/);
    assert.doesNotMatch(src, /epley|1RM|one.?rep/i);
  });
});
