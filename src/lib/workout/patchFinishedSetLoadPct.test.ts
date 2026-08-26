/**
 * Optional load % on a finished History draft.
 * Empty / junk indexes invent nothing. `0` /
 * `101` / `80.12` invent nothing. Blank
 * clears. Same value is noop. Does not write
 * weight / rpe / rpe10 / rir / kind / side /
 * tempo. Source draft is not mutated. No
 * store. No Epley. No knownMax.
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
import { decidePatchFinishedSetLoadPct } from './patchFinishedSetLoadPct.ts';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

describe('decidePatchFinishedSetLoadPct (.1044)', () => {
  const two: FinishedSessionDraft = {
    exercises: [
      {
        exerciseId: 'bench-press',
        note: 'paused',
        sets: [
          {
            reps: 8,
            weight: 95,
            loadPct: 80,
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
      decidePatchFinishedSetLoadPct({
        draft: null,
        exerciseIndex: 0,
        setIndex: 0,
        loadPct: 80,
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetLoadPct({
        draft: undefined,
        exerciseIndex: 0,
        setIndex: 0,
        loadPct: 80,
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetLoadPct({
        draft: { exercises: null as unknown as [] },
        exerciseIndex: 0,
        setIndex: 0,
        loadPct: 80,
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetLoadPct({
        draft: two,
        exerciseIndex: 0.5,
        setIndex: 0,
        loadPct: 80,
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetLoadPct({
        draft: two,
        exerciseIndex: '0',
        setIndex: 0,
        loadPct: 80,
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetLoadPct({
        draft: two,
        exerciseIndex: Number.NaN,
        setIndex: 0,
        loadPct: 80,
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetLoadPct({
        draft: two,
        exerciseIndex: 0,
        setIndex: null,
        loadPct: 80,
      }).kind,
      'empty'
    );
  });

  it('0 / 101 / 80.12 / nope / boolean invent nothing', () => {
    assert.equal(
      decidePatchFinishedSetLoadPct({
        draft: two,
        exerciseIndex: 0,
        setIndex: 0,
        loadPct: 0,
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetLoadPct({
        draft: two,
        exerciseIndex: 0,
        setIndex: 0,
        loadPct: '0',
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetLoadPct({
        draft: two,
        exerciseIndex: 0,
        setIndex: 0,
        loadPct: 101,
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetLoadPct({
        draft: two,
        exerciseIndex: 0,
        setIndex: 0,
        loadPct: '80.12',
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetLoadPct({
        draft: two,
        exerciseIndex: 0,
        setIndex: 0,
        loadPct: 'nope',
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSetLoadPct({
        draft: two,
        exerciseIndex: 0,
        setIndex: 0,
        loadPct: true,
      }).kind,
      'empty'
    );
    assert.equal(two.exercises[0]?.sets[0]?.loadPct, 80);
    assert.equal(two.exercises[0]?.sets[0]?.weight, 95);
  });

  it('out of range set index / same value as current are noop', () => {
    assert.equal(
      decidePatchFinishedSetLoadPct({
        draft: two,
        exerciseIndex: 2,
        setIndex: 0,
        loadPct: 80,
      }).kind,
      'noop'
    );
    assert.equal(
      decidePatchFinishedSetLoadPct({
        draft: two,
        exerciseIndex: -1,
        setIndex: 0,
        loadPct: 80,
      }).kind,
      'noop'
    );
    assert.equal(
      decidePatchFinishedSetLoadPct({
        draft: two,
        exerciseIndex: 0,
        setIndex: 3,
        loadPct: 80,
      }).kind,
      'noop'
    );
    assert.equal(
      decidePatchFinishedSetLoadPct({
        draft: two,
        exerciseIndex: 0,
        setIndex: 0,
        loadPct: 80,
      }).kind,
      'noop'
    );
    assert.equal(
      decidePatchFinishedSetLoadPct({
        draft: two,
        exerciseIndex: 0,
        setIndex: 0,
        loadPct: '80%',
      }).kind,
      'noop'
    );
    assert.equal(
      decidePatchFinishedSetLoadPct({
        draft: two,
        exerciseIndex: 0,
        setIndex: 1,
        loadPct: '',
      }).kind,
      'noop'
    );
    assert.equal(
      decidePatchFinishedSetLoadPct({
        draft: two,
        exerciseIndex: 0,
        setIndex: 1,
        loadPct: null,
      }).kind,
      'noop'
    );
    assert.equal(
      decidePatchFinishedSetLoadPct({
        draft: two,
        exerciseIndex: 0,
        setIndex: 1,
        loadPct: undefined,
      }).kind,
      'noop'
    );
  });

  it('80 / 76.5 / 80% apply; blank clears; field is absent after clear', () => {
    const apply80 = decidePatchFinishedSetLoadPct({
      draft: two,
      exerciseIndex: 0,
      setIndex: 1,
      loadPct: 80,
    });
    assert.equal(apply80.kind, 'apply');
    if (apply80.kind !== 'apply') return;
    assert.equal(apply80.draft.exercises[0]?.sets[1]?.loadPct, 80);
    assert.equal(apply80.draft.exercises[0]?.sets[1]?.weight, 135);
    assert.equal(apply80.draft.exercises[0]?.sets[1]?.reps, 5);
    assert.equal(two.exercises[0]?.sets[1]?.loadPct, undefined);
    assert.equal(
      Object.prototype.hasOwnProperty.call(two.exercises[0]?.sets[1] ?? {}, 'loadPct'),
      false
    );

    const applyDecimal = decidePatchFinishedSetLoadPct({
      draft: two,
      exerciseIndex: 1,
      setIndex: 0,
      loadPct: 76.5,
    });
    assert.equal(applyDecimal.kind, 'apply');
    if (applyDecimal.kind !== 'apply') return;
    assert.equal(applyDecimal.draft.exercises[1]?.sets[0]?.loadPct, 76.5);
    assert.equal(applyDecimal.draft.exercises[1]?.sets[0]?.weight, 185);

    const applyPct = decidePatchFinishedSetLoadPct({
      draft: two,
      exerciseIndex: 0,
      setIndex: 1,
      loadPct: '80%',
    });
    assert.equal(applyPct.kind, 'apply');
    if (applyPct.kind !== 'apply') return;
    assert.equal(applyPct.draft.exercises[0]?.sets[1]?.loadPct, 80);
    assert.equal(applyPct.draft.exercises[0]?.sets[1]?.weight, 135);

    const clear = decidePatchFinishedSetLoadPct({
      draft: two,
      exerciseIndex: 0,
      setIndex: 0,
      loadPct: '',
    });
    assert.equal(clear.kind, 'apply');
    if (clear.kind !== 'apply') return;
    assert.equal(clear.draft.exercises[0]?.sets[0]?.loadPct, undefined);
    assert.equal(
      Object.prototype.hasOwnProperty.call(clear.draft.exercises[0]?.sets[0] ?? {}, 'loadPct'),
      false,
      'clear must omit the field, not store undefined'
    );
    assert.equal(two.exercises[0]?.sets[0]?.loadPct, 80);
    assert.equal(two.exercises[0]?.sets[0]?.weight, 95);

    const clearNull = decidePatchFinishedSetLoadPct({
      draft: two,
      exerciseIndex: 0,
      setIndex: 0,
      loadPct: null,
    });
    assert.equal(clearNull.kind, 'apply');
    if (clearNull.kind !== 'apply') return;
    assert.equal(
      Object.prototype.hasOwnProperty.call(clearNull.draft.exercises[0]?.sets[0] ?? {}, 'loadPct'),
      false
    );
  });

  it('does not write weight, rpe, rpe10, rir, kind, side, or tempo', () => {
    const decision = decidePatchFinishedSetLoadPct({
      draft: two,
      exerciseIndex: 0,
      setIndex: 0,
      loadPct: 75,
    });
    assert.equal(decision.kind, 'apply');
    if (decision.kind !== 'apply') return;
    assert.equal(decision.draft.exercises[0]?.sets[0]?.loadPct, 75);
    assert.equal(decision.draft.exercises[0]?.sets[0]?.weight, 95);
    assert.equal(decision.draft.exercises[0]?.sets[0]?.rpe10, 8);
    assert.equal(decision.draft.exercises[0]?.sets[0]?.rpe, 'hard');
    assert.equal(decision.draft.exercises[0]?.sets[0]?.rir, 2);
    assert.equal(decision.draft.exercises[0]?.sets[0]?.kind, 'normal');
    assert.equal(decision.draft.exercises[0]?.sets[0]?.side, 'L');
    assert.deepEqual(decision.draft.exercises[0]?.sets[0]?.tempo, {
      ecc: 3,
      pause: 1,
      con: 1,
    });
    const ontoEmpty = decidePatchFinishedSetLoadPct({
      draft: two,
      exerciseIndex: 0,
      setIndex: 1,
      loadPct: 80,
    });
    assert.equal(ontoEmpty.kind, 'apply');
    if (ontoEmpty.kind !== 'apply') return;
    assert.equal(ontoEmpty.draft.exercises[0]?.sets[1]?.loadPct, 80);
    assert.equal(ontoEmpty.draft.exercises[0]?.sets[1]?.weight, 135);
    assert.equal(ontoEmpty.draft.exercises[0]?.sets[1]?.rpe10, undefined);
    assert.equal(ontoEmpty.draft.exercises[0]?.sets[1]?.rpe, undefined);
    assert.equal(ontoEmpty.draft.exercises[0]?.sets[1]?.rir, undefined);
    assert.equal(ontoEmpty.draft.exercises[0]?.sets[1]?.kind, undefined);
    assert.equal(ontoEmpty.draft.exercises[0]?.sets[1]?.side, undefined);
    assert.equal(ontoEmpty.draft.exercises[0]?.sets[1]?.tempo, undefined);
    const src = read('src/lib/workout/patchFinishedSetLoadPct.ts');
    assert.doesNotMatch(src, /weight:\s*parsed/);
    assert.doesNotMatch(src, /rpe10:\s*parsed/);
    assert.doesNotMatch(src, /rpe:\s*parsed/);
    assert.doesNotMatch(src, /rir:\s*parsed/);
    assert.doesNotMatch(src, /kind:\s*parsed/);
    assert.doesNotMatch(src, /side:\s*parsed/);
    assert.doesNotMatch(src, /tempo:\s*parsed/);
    assert.doesNotMatch(src, /rpe:\s*['"](?:easy|med|hard)['"]/);
  });

  it('clones so the source draft is not mutated', () => {
    const decision = decidePatchFinishedSetLoadPct({
      draft: two,
      exerciseIndex: 0,
      setIndex: 0,
      loadPct: 75,
    });
    assert.equal(decision.kind, 'apply');
    if (decision.kind !== 'apply') return;
    decision.draft.exercises[0]!.sets[0]!.loadPct = 9;
    decision.draft.exercises[0]!.sets[0]!.weight = 999;
    decision.draft.exercises[0]!.exerciseId = 'wiped';
    decision.draft.exercises[1]!.sets[0]!.weight = 1;
    assert.equal(two.exercises[0]?.exerciseId, 'bench-press');
    assert.equal(two.exercises[0]?.note, 'paused');
    assert.equal(two.exercises[0]?.sets[0]?.loadPct, 80);
    assert.equal(two.exercises[0]?.sets[0]?.weight, 95);
    assert.equal(two.exercises[0]?.sets[0]?.rpe10, 8);
    assert.equal(two.exercises[0]?.sets[0]?.rpe, 'hard');
    assert.equal(two.exercises[0]?.sets[0]?.rir, 2);
    assert.deepEqual(two.exercises[0]?.sets[0]?.tempo, { ecc: 3, pause: 1, con: 1 });
    assert.equal(two.exercises[1]?.exerciseId, 'squats');
    assert.equal(two.exercises[1]?.sets[0]?.weight, 185);
    assert.equal(two.exercises[1]?.sets[0]?.rir, 3);
  });

  it('Save still decideEditSave — loadPct-only change applies; same log id; weight unchanged', () => {
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
    const patched = decidePatchFinishedSetLoadPct({
      draft: {
        exercises: original.exercises.map((ex) => ({
          ...ex,
          sets: ex.sets.map((s) => ({ ...s })),
        })),
      },
      exerciseIndex: 0,
      setIndex: 0,
      loadPct: 80,
    });
    assert.equal(patched.kind, 'apply');
    if (patched.kind !== 'apply') return;
    const decision = decideEditSave({ original, draft: patched.draft });
    assert.equal(decision.kind, 'apply');
    if (decision.kind !== 'apply') return;
    assert.equal(decision.next.id, 'log-1');
    assert.equal(decision.next.clientId, 'cid-1');
    assert.equal(decision.next.exercises[0]?.sets[0]?.loadPct, 80);
    assert.equal(decision.next.exercises[0]?.sets[0]?.weight, 135);
    assert.equal(decision.next.exercises[0]?.sets[0]?.rpe10, 8);
    assert.equal(decision.next.exercises[0]?.sets[0]?.rpe, 'hard');
    assert.equal(decision.next.exercises[0]?.sets[0]?.rir, 2);
    assert.equal(decision.next.exercises[0]?.sets[0]?.kind, 'normal');
    assert.equal(decision.next.deletedAt, null);
  });
});

describe('patchFinishedSetLoadPct wiring', () => {
  it('stays one home — no store / Wednesday write / live Start / Epley / knownMax', () => {
    const src = read('src/lib/workout/patchFinishedSetLoadPct.ts');
    assert.match(src, /decidePatchFinishedSetLoadPct/);
    assert.match(src, /patchDraftSet/);
    assert.match(src, /parseOptionalLoadPct/);
    assert.doesNotMatch(src, /knownMaxFromHistory/);
    assert.doesNotMatch(src, /weightFromKnownMaxPct/);
    assert.doesNotMatch(src, /loadPctOfKnownMax/);
    assert.doesNotMatch(src, /workingMaxFromHistory/);
    assert.doesNotMatch(src, /epley/i);
    assert.doesNotMatch(src, /readJson|writeJson|STORAGE_KEYS/);
    assert.doesNotMatch(src, /from ['"]@\/store\/workoutStore['"]/);
    assert.doesNotMatch(src, /swapExerciseInPlan|savePlan|generateWeek|savedWorkouts/);
    assert.doesNotMatch(src, /startWorkout|protectLiveStart|decideThisDeviceResume/);
    assert.doesNotMatch(src, /localStorage/);
    assert.doesNotMatch(src, /from ['"]@\/lib\/coach\/planEngine/);
  });
});
