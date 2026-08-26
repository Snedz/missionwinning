/**
 * Optional per-lift diary on a finished History draft.
 * Empty / junk indexes invent nothing. Non-string
 * junk invents nothing. Blank clears. Same text
 * is noop. Over-cap truncates to 200. Does not
 * write sets / sessionNote / pin. Source draft
 * is not mutated. No store. No lastNotesFor. No LLM.
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
import { EXERCISE_NOTE_MAX } from './exerciseNote.ts';
import { decidePatchFinishedExerciseNote } from './patchFinishedExerciseNote.ts';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

describe('decidePatchFinishedExerciseNote (.1045)', () => {
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
        ],
      },
      { exerciseId: 'squats', sets: [{ reps: 8, weight: 185, rir: 3 }] },
    ],
  };

  it('missing draft / not an array / junk indexes are empty', () => {
    assert.equal(
      decidePatchFinishedExerciseNote({
        draft: null,
        exerciseIndex: 0,
        note: 'paused',
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedExerciseNote({
        draft: undefined,
        exerciseIndex: 0,
        note: 'paused',
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedExerciseNote({
        draft: { exercises: null as unknown as [] },
        exerciseIndex: 0,
        note: 'paused',
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedExerciseNote({
        draft: two,
        exerciseIndex: 0.5,
        note: 'paused',
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedExerciseNote({
        draft: two,
        exerciseIndex: '0',
        note: 'paused',
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedExerciseNote({
        draft: two,
        exerciseIndex: Number.NaN,
        note: 'paused',
      }).kind,
      'empty'
    );
  });

  it('non-string junk invents nothing', () => {
    assert.equal(
      decidePatchFinishedExerciseNote({
        draft: two,
        exerciseIndex: 0,
        note: 0,
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedExerciseNote({
        draft: two,
        exerciseIndex: 0,
        note: true,
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedExerciseNote({
        draft: two,
        exerciseIndex: 0,
        note: { text: 'paused' },
      }).kind,
      'empty'
    );
    assert.equal(two.exercises[0]?.note, 'paused');
    assert.equal(two.exercises[0]?.sets[0]?.weight, 95);
  });

  it('out of range exercise index / same text as current are noop', () => {
    assert.equal(
      decidePatchFinishedExerciseNote({
        draft: two,
        exerciseIndex: 2,
        note: 'paused',
      }).kind,
      'noop'
    );
    assert.equal(
      decidePatchFinishedExerciseNote({
        draft: two,
        exerciseIndex: -1,
        note: 'paused',
      }).kind,
      'noop'
    );
    assert.equal(
      decidePatchFinishedExerciseNote({
        draft: two,
        exerciseIndex: 0,
        note: 'paused',
      }).kind,
      'noop'
    );
    assert.equal(
      decidePatchFinishedExerciseNote({
        draft: two,
        exerciseIndex: 0,
        note: '  paused  ',
      }).kind,
      'noop'
    );
    assert.equal(
      decidePatchFinishedExerciseNote({
        draft: two,
        exerciseIndex: 1,
        note: '',
      }).kind,
      'noop'
    );
    assert.equal(
      decidePatchFinishedExerciseNote({
        draft: two,
        exerciseIndex: 1,
        note: null,
      }).kind,
      'noop'
    );
    assert.equal(
      decidePatchFinishedExerciseNote({
        draft: two,
        exerciseIndex: 1,
        note: undefined,
      }).kind,
      'noop'
    );
  });

  it('apply "paused"; blank clears; field is absent after clear', () => {
    const apply = decidePatchFinishedExerciseNote({
      draft: two,
      exerciseIndex: 1,
      note: 'paused',
    });
    assert.equal(apply.kind, 'apply');
    if (apply.kind !== 'apply') return;
    assert.equal(apply.draft.exercises[1]?.note, 'paused');
    assert.equal(apply.draft.exercises[1]?.sets[0]?.weight, 185);
    assert.equal(two.exercises[1]?.note, undefined);
    assert.equal(
      Object.prototype.hasOwnProperty.call(two.exercises[1] ?? {}, 'note'),
      false
    );

    const clear = decidePatchFinishedExerciseNote({
      draft: two,
      exerciseIndex: 0,
      note: '',
    });
    assert.equal(clear.kind, 'apply');
    if (clear.kind !== 'apply') return;
    assert.equal(clear.draft.exercises[0]?.note, undefined);
    assert.equal(
      Object.prototype.hasOwnProperty.call(clear.draft.exercises[0] ?? {}, 'note'),
      false,
      'clear must omit the field, not store undefined'
    );
    assert.equal(two.exercises[0]?.note, 'paused');
    assert.deepEqual(two.exercises[0]?.sets[0], {
      reps: 8,
      weight: 95,
      loadPct: 80,
      tempo: { ecc: 3, pause: 1, con: 1 },
      rir: 2,
      rpe10: 8,
      rpe: 'hard',
      kind: 'normal',
      side: 'L',
    });

    const clearNull = decidePatchFinishedExerciseNote({
      draft: two,
      exerciseIndex: 0,
      note: null,
    });
    assert.equal(clearNull.kind, 'apply');
    if (clearNull.kind !== 'apply') return;
    assert.equal(
      Object.prototype.hasOwnProperty.call(clearNull.draft.exercises[0] ?? {}, 'note'),
      false
    );
  });

  it('over-cap truncates to 200 — never empties, never pads', () => {
    const long = 'x'.repeat(EXERCISE_NOTE_MAX + 40);
    const decision = decidePatchFinishedExerciseNote({
      draft: two,
      exerciseIndex: 1,
      note: long,
    });
    assert.equal(decision.kind, 'apply');
    if (decision.kind !== 'apply') return;
    assert.equal(decision.draft.exercises[1]?.note, 'x'.repeat(EXERCISE_NOTE_MAX));
    assert.equal(decision.draft.exercises[1]?.note?.length, EXERCISE_NOTE_MAX);
    assert.equal(two.exercises[1]?.note, undefined);
  });

  it('does not write sets or sessionNote', () => {
    const decision = decidePatchFinishedExerciseNote({
      draft: two,
      exerciseIndex: 0,
      note: 'belt on 3',
    });
    assert.equal(decision.kind, 'apply');
    if (decision.kind !== 'apply') return;
    assert.equal(decision.draft.exercises[0]?.note, 'belt on 3');
    assert.deepEqual(decision.draft.exercises[0]?.sets, two.exercises[0]?.sets);
    assert.equal(decision.draft.exercises[0]?.sets[0]?.weight, 95);
    assert.equal(decision.draft.exercises[0]?.sets[0]?.reps, 8);
    assert.equal(decision.draft.exercises[0]?.sets[0]?.loadPct, 80);
    assert.equal(decision.draft.exercises[1]?.exerciseId, 'squats');
    const src = read('src/lib/workout/patchFinishedExerciseNote.ts');
    assert.doesNotMatch(src, /sessionNote\s*:/);
    assert.doesNotMatch(src, /patchDraftSet/);
    assert.doesNotMatch(src, /sets:\s*\[/);
    assert.doesNotMatch(src, /from ['"]@\/lib\/workout\/exercisePin/);
  });

  it('clones so the source draft is not mutated', () => {
    const decision = decidePatchFinishedExerciseNote({
      draft: two,
      exerciseIndex: 0,
      note: 'belt on 3',
    });
    assert.equal(decision.kind, 'apply');
    if (decision.kind !== 'apply') return;
    decision.draft.exercises[0]!.note = 'wiped';
    decision.draft.exercises[0]!.sets[0]!.weight = 999;
    decision.draft.exercises[0]!.exerciseId = 'wiped';
    decision.draft.exercises[1]!.sets[0]!.weight = 1;
    assert.equal(two.exercises[0]?.exerciseId, 'bench-press');
    assert.equal(two.exercises[0]?.note, 'paused');
    assert.equal(two.exercises[0]?.sets[0]?.weight, 95);
    assert.equal(two.exercises[0]?.sets[0]?.loadPct, 80);
    assert.equal(two.exercises[1]?.exerciseId, 'squats');
    assert.equal(two.exercises[1]?.sets[0]?.weight, 185);
    assert.equal(two.exercises[1]?.sets[0]?.rir, 3);
  });

  it('Save still decideEditSave — note-only change applies; same log id; sets unchanged', () => {
    const original: CompletedWorkoutLog = {
      id: 'log-1',
      clientId: 'cid-1',
      revision: 1,
      workoutName: 'Push',
      startedAt: '2026-08-17T10:00:00.000Z',
      completedAt: '2026-08-17T11:00:00.000Z',
      durationSeconds: 3600,
      totalVolume: 675,
      sessionNote: 'session felt heavy',
      exercises: [
        {
          exerciseId: 'bench-press',
          sets: [{ reps: 5, weight: 135, rpe: 'hard', rpe10: 8, rir: 2, kind: 'normal' }],
        },
      ],
    };
    const patched = decidePatchFinishedExerciseNote({
      draft: {
        exercises: original.exercises.map((ex) => ({
          ...ex,
          sets: ex.sets.map((s) => ({ ...s })),
        })),
      },
      exerciseIndex: 0,
      note: 'paused',
    });
    assert.equal(patched.kind, 'apply');
    if (patched.kind !== 'apply') return;
    const decision = decideEditSave({ original, draft: patched.draft });
    assert.equal(decision.kind, 'apply');
    if (decision.kind !== 'apply') return;
    assert.equal(decision.next.id, 'log-1');
    assert.equal(decision.next.clientId, 'cid-1');
    assert.equal(decision.next.exercises[0]?.note, 'paused');
    assert.equal(decision.next.exercises[0]?.sets[0]?.weight, 135);
    assert.equal(decision.next.exercises[0]?.sets[0]?.reps, 5);
    assert.equal(decision.next.exercises[0]?.sets[0]?.rpe10, 8);
    assert.equal(decision.next.sessionNote, 'session felt heavy');
    assert.equal(decision.next.deletedAt, null);
  });
});

describe('patchFinishedExerciseNote wiring', () => {
  it('stays one home — no store / lastNotesFor / LLM / pin / Wednesday write / live Start', () => {
    const src = read('src/lib/workout/patchFinishedExerciseNote.ts');
    assert.match(src, /decidePatchFinishedExerciseNote/);
    assert.match(src, /normalizeExerciseNote/);
    assert.doesNotMatch(src, /patchDraftSet/);
    assert.doesNotMatch(src, /lastNotesFor/);
    assert.doesNotMatch(src, /cueMemory/);
    assert.doesNotMatch(src, /from ['"]@\/lib\/llm/);
    assert.doesNotMatch(src, /from ['"]@\/lib\/workout\/exercisePin/);
    assert.doesNotMatch(src, /readJson|writeJson|STORAGE_KEYS/);
    assert.doesNotMatch(src, /from ['"]@\/store\/workoutStore['"]/);
    assert.doesNotMatch(src, /swapExerciseInPlan|savePlan|generateWeek|savedWorkouts/);
    assert.doesNotMatch(src, /startWorkout|protectLiveStart|decideThisDeviceResume/);
    assert.doesNotMatch(src, /localStorage/);
    assert.doesNotMatch(src, /from ['"]@\/lib\/coach\/planEngine/);
  });
});
