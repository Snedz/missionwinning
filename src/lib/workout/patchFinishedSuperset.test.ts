/**
 * Optional exercise group on a finished History draft.
 * Empty / junk indexes invent nothing. One lift empty.
 * Last lift + next empty. Pair two applies a shared id.
 * Already paired noop. Unpair clears and strips orphan.
 * Does not write sets / notes. Source draft is not
 * mutated. No store. Save still decideEditSave.
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
import { decidePatchFinishedSuperset } from './patchFinishedSuperset.ts';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

describe('decidePatchFinishedSuperset (.1047)', () => {
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

  const one: FinishedSessionDraft = {
    exercises: [
      { exerciseId: 'bench-press', sets: [{ reps: 5, weight: 135 }] },
    ],
  };

  it('missing draft / not an array / junk indexes are empty', () => {
    assert.equal(
      decidePatchFinishedSuperset({
        draft: null,
        exerciseIndex: 0,
        pair: true,
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSuperset({
        draft: undefined,
        exerciseIndex: 0,
        pair: true,
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSuperset({
        draft: { exercises: null as unknown as [] },
        exerciseIndex: 0,
        pair: true,
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSuperset({
        draft: two,
        exerciseIndex: 0.5,
        pair: true,
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSuperset({
        draft: two,
        exerciseIndex: '0',
        pair: true,
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSuperset({
        draft: two,
        exerciseIndex: Number.NaN,
        pair: true,
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSuperset({
        draft: two,
        exerciseIndex: -1,
        pair: true,
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSuperset({
        draft: two,
        exerciseIndex: 2,
        pair: true,
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSuperset({
        draft: two,
        exerciseIndex: 0,
        pair: 'unpair',
      }).kind,
      'empty'
    );
    assert.equal(two.exercises[0]?.sets[0]?.weight, 95);
  });

  it('one lift is empty — cannot pair', () => {
    assert.equal(
      decidePatchFinishedSuperset({
        draft: one,
        exerciseIndex: 0,
        pair: true,
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSuperset({
        draft: one,
        exerciseIndex: 0,
        pair: false,
      }).kind,
      'empty'
    );
  });

  it('last lift + pair-with-next is empty', () => {
    assert.equal(
      decidePatchFinishedSuperset({
        draft: two,
        exerciseIndex: 1,
        pair: true,
      }).kind,
      'empty'
    );
    assert.equal(
      decidePatchFinishedSuperset({
        draft: two,
        exerciseIndex: 1,
        pair: 'next',
      }).kind,
      'empty'
    );
    assert.equal(two.exercises[1]?.supersetGroup, undefined);
  });

  it('pair two applies a shared id', () => {
    const apply = decidePatchFinishedSuperset({
      draft: two,
      exerciseIndex: 0,
      pair: true,
    });
    assert.equal(apply.kind, 'apply');
    if (apply.kind !== 'apply') return;
    const group = apply.draft.exercises[0]?.supersetGroup;
    assert.ok(group);
    assert.equal(apply.draft.exercises[1]?.supersetGroup, group);
    assert.match(group ?? '', /^ss-/);

    const viaNext = decidePatchFinishedSuperset({
      draft: two,
      exerciseIndex: 0,
      pair: 'next',
    });
    assert.equal(viaNext.kind, 'apply');
    if (viaNext.kind !== 'apply') return;
    assert.equal(
      viaNext.draft.exercises[0]?.supersetGroup,
      viaNext.draft.exercises[1]?.supersetGroup
    );
    assert.equal(two.exercises[0]?.supersetGroup, undefined);
    assert.equal(two.exercises[1]?.supersetGroup, undefined);
  });

  it('reuses an existing group on either side', () => {
    const leftHas: FinishedSessionDraft = {
      exercises: [
        {
          exerciseId: 'bench-press',
          supersetGroup: 'g-left',
          sets: [{ reps: 5, weight: 135 }],
        },
        { exerciseId: 'squats', sets: [{ reps: 8, weight: 185 }] },
        { exerciseId: 'rows', sets: [{ reps: 8, weight: 70 }] },
      ],
    };
    const fromLeft = decidePatchFinishedSuperset({
      draft: leftHas,
      exerciseIndex: 0,
      pair: true,
    });
    assert.equal(fromLeft.kind, 'apply');
    if (fromLeft.kind !== 'apply') return;
    assert.equal(fromLeft.draft.exercises[0]?.supersetGroup, 'g-left');
    assert.equal(fromLeft.draft.exercises[1]?.supersetGroup, 'g-left');
    assert.equal(fromLeft.draft.exercises[2]?.supersetGroup, undefined);

    const rightHas: FinishedSessionDraft = {
      exercises: [
        { exerciseId: 'bench-press', sets: [{ reps: 5, weight: 135 }] },
        {
          exerciseId: 'squats',
          supersetGroup: 'g-right',
          sets: [{ reps: 8, weight: 185 }],
        },
        {
          exerciseId: 'rows',
          supersetGroup: 'g-right',
          sets: [{ reps: 8, weight: 70 }],
        },
      ],
    };
    const fromRight = decidePatchFinishedSuperset({
      draft: rightHas,
      exerciseIndex: 0,
      pair: true,
    });
    assert.equal(fromRight.kind, 'apply');
    if (fromRight.kind !== 'apply') return;
    assert.equal(fromRight.draft.exercises[0]?.supersetGroup, 'g-right');
    assert.equal(fromRight.draft.exercises[1]?.supersetGroup, 'g-right');
    assert.equal(fromRight.draft.exercises[2]?.supersetGroup, 'g-right');
  });

  it('already sharing a group with next is noop', () => {
    const paired: FinishedSessionDraft = {
      exercises: [
        {
          exerciseId: 'bench-press',
          supersetGroup: 'g1',
          sets: [{ reps: 5, weight: 135 }],
        },
        {
          exerciseId: 'squats',
          supersetGroup: 'g1',
          sets: [{ reps: 8, weight: 185 }],
        },
      ],
    };
    assert.equal(
      decidePatchFinishedSuperset({
        draft: paired,
        exerciseIndex: 0,
        pair: true,
      }).kind,
      'noop'
    );
    assert.equal(
      decidePatchFinishedSuperset({
        draft: paired,
        exerciseIndex: 0,
        pair: 'next',
      }).kind,
      'noop'
    );
    assert.equal(paired.exercises[0]?.supersetGroup, 'g1');
  });

  it('unpair clears this lift then strips an orphan', () => {
    const paired: FinishedSessionDraft = {
      exercises: [
        {
          exerciseId: 'bench-press',
          note: 'paused',
          supersetGroup: 'g1',
          sets: [{ reps: 5, weight: 135 }],
        },
        {
          exerciseId: 'squats',
          supersetGroup: 'g1',
          sets: [{ reps: 8, weight: 185 }],
        },
      ],
    };
    const clear = decidePatchFinishedSuperset({
      draft: paired,
      exerciseIndex: 0,
      pair: false,
    });
    assert.equal(clear.kind, 'apply');
    if (clear.kind !== 'apply') return;
    assert.equal(clear.draft.exercises[0]?.supersetGroup, undefined);
    assert.equal(
      Object.prototype.hasOwnProperty.call(
        clear.draft.exercises[0] ?? {},
        'supersetGroup'
      ),
      false,
      'unpair must omit the field, not store undefined'
    );
    assert.equal(clear.draft.exercises[1]?.supersetGroup, undefined);
    assert.equal(paired.exercises[0]?.supersetGroup, 'g1');
    assert.equal(paired.exercises[1]?.supersetGroup, 'g1');

    const viaBlank = decidePatchFinishedSuperset({
      draft: paired,
      exerciseIndex: 0,
      pair: '',
    });
    assert.equal(viaBlank.kind, 'apply');
    if (viaBlank.kind !== 'apply') return;
    assert.equal(viaBlank.draft.exercises[0]?.supersetGroup, undefined);
    assert.equal(viaBlank.draft.exercises[1]?.supersetGroup, undefined);
  });

  it('unpair of a three-lift group leaves the remaining pair', () => {
    const circuit: FinishedSessionDraft = {
      exercises: [
        {
          exerciseId: 'bench-press',
          supersetGroup: 'g1',
          sets: [{ reps: 5, weight: 135 }],
        },
        {
          exerciseId: 'squats',
          supersetGroup: 'g1',
          sets: [{ reps: 8, weight: 185 }],
        },
        {
          exerciseId: 'rows',
          supersetGroup: 'g1',
          sets: [{ reps: 8, weight: 70 }],
        },
      ],
    };
    const clear = decidePatchFinishedSuperset({
      draft: circuit,
      exerciseIndex: 0,
      pair: false,
    });
    assert.equal(clear.kind, 'apply');
    if (clear.kind !== 'apply') return;
    assert.equal(clear.draft.exercises[0]?.supersetGroup, undefined);
    assert.equal(clear.draft.exercises[1]?.supersetGroup, 'g1');
    assert.equal(clear.draft.exercises[2]?.supersetGroup, 'g1');
  });

  it('already unpaired is noop', () => {
    assert.equal(
      decidePatchFinishedSuperset({
        draft: two,
        exerciseIndex: 0,
        pair: false,
      }).kind,
      'noop'
    );
    assert.equal(
      decidePatchFinishedSuperset({
        draft: two,
        exerciseIndex: 1,
        pair: '',
      }).kind,
      'noop'
    );
  });

  it('does not write sets or notes', () => {
    const decision = decidePatchFinishedSuperset({
      draft: two,
      exerciseIndex: 0,
      pair: true,
    });
    assert.equal(decision.kind, 'apply');
    if (decision.kind !== 'apply') return;
    assert.deepEqual(decision.draft.exercises[0]?.sets, two.exercises[0]?.sets);
    assert.equal(decision.draft.exercises[0]?.note, 'paused');
    assert.equal(decision.draft.exercises[0]?.sets[0]?.weight, 95);
    assert.equal(decision.draft.exercises[0]?.sets[0]?.reps, 8);
    assert.equal(decision.draft.exercises[0]?.sets[0]?.loadPct, 80);
    assert.equal(decision.draft.exercises[1]?.exerciseId, 'squats');
    const src = read('src/lib/workout/patchFinishedSuperset.ts');
    assert.doesNotMatch(src, /sessionNote\s*:/);
    assert.doesNotMatch(src, /patchDraftSet/);
    assert.doesNotMatch(src, /sets:\s*\[/);
    assert.doesNotMatch(src, /durationSeconds\s*:/);
    assert.doesNotMatch(src, /workoutName\s*:/);
  });

  it('clones so the source draft is not mutated', () => {
    const decision = decidePatchFinishedSuperset({
      draft: two,
      exerciseIndex: 0,
      pair: true,
    });
    assert.equal(decision.kind, 'apply');
    if (decision.kind !== 'apply') return;
    decision.draft.exercises[0]!.supersetGroup = 'wiped';
    decision.draft.exercises[0]!.sets[0]!.weight = 999;
    decision.draft.exercises[0]!.exerciseId = 'wiped';
    decision.draft.exercises[1]!.sets[0]!.weight = 1;
    assert.equal(two.exercises[0]?.exerciseId, 'bench-press');
    assert.equal(two.exercises[0]?.note, 'paused');
    assert.equal(two.exercises[0]?.supersetGroup, undefined);
    assert.equal(two.exercises[0]?.sets[0]?.weight, 95);
    assert.equal(two.exercises[0]?.sets[0]?.loadPct, 80);
    assert.equal(two.exercises[1]?.exerciseId, 'squats');
    assert.equal(two.exercises[1]?.sets[0]?.weight, 185);
    assert.equal(two.exercises[1]?.sets[0]?.rir, 3);
  });

  it('Save still decideEditSave — pair-only change applies; same log id; sets unchanged', () => {
    const original: CompletedWorkoutLog = {
      id: 'log-1',
      clientId: 'cid-1',
      revision: 1,
      workoutName: 'Push',
      startedAt: '2026-08-17T10:00:00.000Z',
      completedAt: '2026-08-17T11:00:00.000Z',
      durationSeconds: 3600,
      totalVolume: 1765,
      sessionNote: 'session felt heavy',
      exercises: [
        {
          exerciseId: 'bench-press',
          note: 'paused',
          sets: [{ reps: 5, weight: 135, rpe: 'hard', rpe10: 8, rir: 2, kind: 'normal' }],
        },
        {
          exerciseId: 'squats',
          sets: [{ reps: 8, weight: 185 }],
        },
      ],
    };
    const patched = decidePatchFinishedSuperset({
      draft: {
        exercises: original.exercises.map((ex) => ({
          ...ex,
          sets: ex.sets.map((s) => ({ ...s })),
        })),
      },
      exerciseIndex: 0,
      pair: true,
    });
    assert.equal(patched.kind, 'apply');
    if (patched.kind !== 'apply') return;
    const decision = decideEditSave({ original, draft: patched.draft });
    assert.equal(decision.kind, 'apply');
    if (decision.kind !== 'apply') return;
    assert.equal(decision.next.id, 'log-1');
    assert.equal(decision.next.clientId, 'cid-1');
    const group = decision.next.exercises[0]?.supersetGroup;
    assert.ok(group);
    assert.equal(decision.next.exercises[1]?.supersetGroup, group);
    assert.equal(decision.next.exercises[0]?.sets[0]?.weight, 135);
    assert.equal(decision.next.exercises[0]?.sets[0]?.reps, 5);
    assert.equal(decision.next.exercises[0]?.note, 'paused');
    assert.equal(decision.next.exercises[1]?.sets[0]?.weight, 185);
    assert.equal(decision.next.sessionNote, 'session felt heavy');
    assert.equal(decision.next.durationSeconds, 3600);
    assert.equal(decision.next.workoutName, 'Push');
    assert.equal(decision.next.deletedAt, null);

    const already = decideEditSave({ original: decision.next, draft: patched.draft });
    assert.equal(already.kind, 'noop');
  });
});

describe('patchFinishedSuperset wiring', () => {
  it('stays one home — no store / pair-mark rewrite / LLM / Wednesday write / live Start', () => {
    const src = read('src/lib/workout/patchFinishedSuperset.ts');
    assert.match(src, /decidePatchFinishedSuperset/);
    assert.match(src, /stripOrphanGroups/);
    assert.doesNotMatch(src, /pairMark|supersetLabel/);
    assert.doesNotMatch(src, /patchDraftSet/);
    assert.doesNotMatch(src, /from ['"]@\/lib\/llm/);
    assert.doesNotMatch(src, /readJson|writeJson|STORAGE_KEYS/);
    assert.doesNotMatch(src, /from ['"]@\/store\/workoutStore['"]/);
    assert.doesNotMatch(src, /swapExerciseInPlan|savePlan|generateWeek|savedWorkouts/);
    assert.doesNotMatch(src, /startWorkout|protectLiveStart|decideThisDeviceResume/);
    assert.doesNotMatch(src, /localStorage/);
    assert.doesNotMatch(src, /from ['"]@\/lib\/coach\/planEngine/);
  });
});
