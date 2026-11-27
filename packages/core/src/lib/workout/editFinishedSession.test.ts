import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';
import type { CompletedWorkoutLog } from '@/types';
import {
  applyEditedLog,
  decideEditSave,
  draftFromLog,
  isDestructiveEdit,
  parseFinishedSetNumber,
  patchDraftSet,
  removeDraftSet,
} from './editFinishedSession.ts';

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

describe('draftFromLog (.997)', () => {
  it('copies the sets they logged', () => {
    const draft = draftFromLog(
      log({
        workoutName: 'Push',
        exercises: [
          { exerciseId: 'bench-press', sets: [{ reps: 5, weight: 135 }] },
        ],
      })
    );
    assert.ok(draft);
    assert.equal(draft?.exercises[0]?.sets[0]?.weight, 135);
    assert.equal(draft?.exercises[0]?.sets[0]?.reps, 5);
  });

  it('tombstone / missing / malformed invent nothing', () => {
    assert.equal(draftFromLog(null), null);
    assert.equal(draftFromLog(undefined), null);
    assert.equal(
      draftFromLog(
        log({
          workoutName: 'X',
          deletedAt: '2026-08-17T12:00:00.000Z',
          exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 100 }] }],
        })
      ),
      null
    );
  });
});

describe('parseFinishedSetNumber', () => {
  it('keeps a typed load and treats blank as 0', () => {
    assert.equal(parseFinishedSetNumber(135), 135);
    assert.equal(parseFinishedSetNumber('225'), 225);
    assert.equal(parseFinishedSetNumber(' 40.5 '), 40.5);
    assert.equal(parseFinishedSetNumber(''), 0);
    assert.equal(parseFinishedSetNumber('nope'), 0);
    assert.equal(parseFinishedSetNumber(-4), 0);
  });
});

describe('decideEditSave (.997)', () => {
  const original = log({
    workoutName: 'Push',
    exercises: [
      {
        exerciseId: 'bench-press',
        sets: [
          { reps: 5, weight: 135 },
          { reps: 5, weight: 135 },
        ],
      },
    ],
    totalVolume: 1350,
  });

  it('typo that still has work applies — 135 → 225', () => {
    const draft = draftFromLog(original);
    assert.ok(draft);
    const nextDraft = patchDraftSet(draft, 0, 0, { weight: 225 });
    const decision = decideEditSave({ original, draft: nextDraft });
    assert.equal(decision.kind, 'apply');
    if (decision.kind !== 'apply') return;
    assert.equal(decision.next.id, 'log-1');
    assert.equal(decision.next.clientId, 'cid-1');
    assert.equal(decision.next.exercises[0]?.sets[0]?.weight, 225);
    assert.equal(decision.next.revision, 2);
    assert.equal(decision.next.deletedAt, null);
    assert.equal(decision.next.totalVolume, 5 * 225 + 5 * 135);
  });

  it('same numbers are a noop', () => {
    const draft = draftFromLog(original);
    assert.equal(decideEditSave({ original, draft }).kind, 'noop');
  });

  it('dropping one of two working sets needs confirm', () => {
    const draft = draftFromLog(original);
    assert.ok(draft);
    const nextDraft = patchDraftSet(draft, 0, 1, { reps: 0, weight: 0 });
    const decision = decideEditSave({ original, draft: nextDraft });
    assert.equal(decision.kind, 'needs-confirm');
    if (decision.kind !== 'needs-confirm') return;
    assert.equal(decision.next.exercises[0]?.sets.length, 1);
    assert.equal(decision.next.deletedAt, null);
  });

  it('dropping the only working set is empty — no wipe', () => {
    const one = log({
      workoutName: 'Push',
      exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 135 }] }],
    });
    const draft = draftFromLog(one);
    assert.ok(draft);
    const emptied = patchDraftSet(draft, 0, 0, { reps: 0, weight: 0 });
    const decision = decideEditSave({ original: one, draft: emptied });
    assert.equal(decision.kind, 'empty');
    assert.equal(applyEditedLog(one, emptied), null);
    assert.equal(isDestructiveEdit(one, emptied), true);
  });

  it('tombstone / missing invent nothing', () => {
    assert.equal(decideEditSave({ original: null, draft: { exercises: [] } }).kind, 'empty');
    assert.equal(
      decideEditSave({
        original: log({
          workoutName: 'X',
          deletedAt: 't',
          exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 100 }] }],
        }),
        draft: { exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 100 }] }] },
      }).kind,
      'empty'
    );
  });

  it('duration plank time is work — 45 × 0 is not the saved line', () => {
    const plank = log({
      workoutName: 'Core',
      exercises: [
        { exerciseId: 'plank', sets: [{ reps: 0, weight: 0, durationSeconds: 45 }] },
      ],
      totalVolume: 0,
    });
    const draft = draftFromLog(plank);
    assert.ok(draft);
    const nextDraft = patchDraftSet(draft, 0, 0, { durationSeconds: 60 });
    const decision = decideEditSave({ original: plank, draft: nextDraft });
    assert.equal(decision.kind, 'apply');
    if (decision.kind !== 'apply') return;
    assert.equal(decision.next.exercises[0]?.sets[0]?.durationSeconds, 60);
    assert.equal(decision.next.totalVolume, 0);
    assert.equal(decision.next.exercises[0]?.sets[0]?.reps, 0);
  });

  it('apply never mints a second clientId or tombstone', () => {
    const draft = draftFromLog(original);
    assert.ok(draft);
    const next = applyEditedLog(original, patchDraftSet(draft, 0, 0, { weight: 140 }));
    assert.ok(next);
    assert.equal(next?.id, original.id);
    assert.equal(next?.clientId, original.clientId);
    assert.equal(next?.startedAt, original.startedAt);
    assert.equal(next?.completedAt, original.completedAt);
    assert.equal(next?.workoutName, original.workoutName);
    assert.equal(next?.deletedAt, null);
    assert.notEqual(next?.clientId, undefined);
  });

  it('removing a working set by splice is destructive', () => {
    const draft = draftFromLog(original);
    assert.ok(draft);
    const nextDraft = removeDraftSet(draft, 0, 1);
    assert.equal(isDestructiveEdit(original, nextDraft), true);
    assert.equal(decideEditSave({ original, draft: nextDraft }).kind, 'needs-confirm');
  });
});

describe('editFinishedSession wiring', () => {
  it('stays one home — no store / resume / paywall / permalink', () => {
    const src = read('src/lib/workout/editFinishedSession.ts');
    assert.match(src, /decideEditSave/);
    assert.match(src, /applyEditedLog/);
    assert.match(src, /setRowHasWork/);
    assert.match(src, /setRowVolume/);
    assert.doesNotMatch(src, /from '@\/store\/workoutStore'/);
    assert.doesNotMatch(src, /startWorkout|protectLiveStart|decideThisDeviceResume/);
    assert.doesNotMatch(src, /isPremium|UnlockButton|\/bundle|permalink/);
    assert.doesNotMatch(src, /deletedAt:\s*['"]|tombstoneFromActive/);
    assert.doesNotMatch(src, /discord\.com|WeChat|four-scene|Force Sync|Session Expired/i);
  });
});
