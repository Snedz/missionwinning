import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';
import type { CompletedWorkoutLog } from '@/types';
import {
  appendBackfillExercise,
  applyBackfillLog,
  backfillPrLabels,
  decideBackfillSession,
  emptyBackfillDraft,
  localInstantFromDateAndTime,
  parseBackfillTime,
  patchBackfillSet,
} from './backfillSession.ts';
import { localDateKey } from '@/lib/time/localDate';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

const TODAY = '2026-08-25';
const MONDAY = '2026-08-24';

const PR_WORDS = {
  heaviest: 'PR · heaviest',
  mostReps: 'PR · most reps',
  bestLogged5: 'PR · best logged 5',
};

function ids() {
  return { id: 'log-backfill-1', clientId: 'cid-backfill-1' };
}

describe('parseBackfillTime', () => {
  it('keeps HH:MM and treats junk as empty', () => {
    assert.equal(parseBackfillTime('09:30'), '09:30');
    assert.equal(parseBackfillTime('9:05'), '09:05');
    assert.equal(parseBackfillTime(''), '');
    assert.equal(parseBackfillTime('now'), '');
    assert.equal(parseBackfillTime('25:00'), '');
  });
});

describe('emptyBackfillDraft (.1000 / .1028 prefill)', () => {
  it('starts with no date, timing off, and no copied sets', () => {
    const draft = emptyBackfillDraft();
    assert.equal(draft.dateKey, '');
    assert.equal(draft.timing.enabled, false);
    assert.equal(draft.exercises.length, 0);
    assert.equal(draft.workoutName, '');
  });

  it('prefills a real local dateKey and refuses junk', () => {
    const draft = emptyBackfillDraft(MONDAY);
    assert.equal(draft.dateKey, MONDAY);
    assert.equal(draft.exercises.length, 0);
    assert.equal(emptyBackfillDraft('').dateKey, '');
    assert.equal(emptyBackfillDraft('2026-13-40').dateKey, '');
    assert.equal(emptyBackfillDraft('July 2').dateKey, '');
  });
});

describe('decideBackfillSession (.1000)', () => {
  it('Monday they trained — date + typed sets apply, one new identity', () => {
    let draft = emptyBackfillDraft();
    draft = { ...draft, dateKey: MONDAY, workoutName: 'Push' };
    draft = appendBackfillExercise(draft, 'bench-press');
    draft = patchBackfillSet(draft, 0, 0, { reps: 5, weight: 135 });
    const decision = decideBackfillSession({ draft, todayKey: TODAY, ...ids() });
    assert.equal(decision.kind, 'apply');
    if (decision.kind !== 'apply') return;
    assert.equal(decision.next.id, 'log-backfill-1');
    assert.equal(decision.next.clientId, 'cid-backfill-1');
    assert.equal(decision.next.revision, 1);
    assert.equal(decision.next.deletedAt, null);
    assert.equal(decision.next.workoutName, 'Push');
    assert.equal(decision.next.exercises[0]?.sets[0]?.weight, 135);
    assert.equal(decision.next.exercises[0]?.sets[0]?.reps, 5);
    assert.equal(decision.next.durationSeconds, 0);
    assert.equal(localDateKey(new Date(decision.next.completedAt)), MONDAY);
    assert.equal(localDateKey(new Date(decision.next.startedAt)), MONDAY);
  });

  it('prefilled emptyBackfillDraft date + work still applies on that day (.1028)', () => {
    let draft = emptyBackfillDraft(MONDAY);
    draft = appendBackfillExercise(draft, 'bench-press');
    draft = patchBackfillSet(draft, 0, 0, { reps: 5, weight: 135 });
    const decision = decideBackfillSession({ draft, todayKey: TODAY, ...ids() });
    assert.equal(decision.kind, 'apply');
    if (decision.kind !== 'apply') return;
    assert.equal(localDateKey(new Date(decision.next.completedAt)), MONDAY);
  });

  it('empty invents nothing — no date, no work, 0/0/0, future', () => {
    assert.equal(
      decideBackfillSession({ draft: emptyBackfillDraft(), todayKey: TODAY, ...ids() }).kind,
      'empty'
    );
    assert.equal(
      decideBackfillSession({
        draft: { ...emptyBackfillDraft(), dateKey: MONDAY },
        todayKey: TODAY,
        ...ids(),
      }).kind,
      'empty'
    );
    let workNoDate = appendBackfillExercise(emptyBackfillDraft(), 'bench-press');
    workNoDate = patchBackfillSet(workNoDate, 0, 0, { reps: 5, weight: 135 });
    assert.equal(
      decideBackfillSession({ draft: workNoDate, todayKey: TODAY, ...ids() }).kind,
      'empty'
    );
    let zero = { ...emptyBackfillDraft(), dateKey: MONDAY };
    zero = appendBackfillExercise(zero, 'bench-press');
    assert.equal(decideBackfillSession({ draft: zero, todayKey: TODAY, ...ids() }).kind, 'empty');
    let future = { ...emptyBackfillDraft(), dateKey: '2026-08-26' };
    future = appendBackfillExercise(future, 'bench-press');
    future = patchBackfillSet(future, 0, 0, { reps: 5, weight: 135 });
    assert.equal(decideBackfillSession({ draft: future, todayKey: TODAY, ...ids() }).kind, 'empty');
    assert.equal(applyBackfillLog({ draft: null, todayKey: TODAY, ...ids() }), null);
  });

  it('timing off never invents a clock from now — duration is 0', () => {
    let draft = { ...emptyBackfillDraft(), dateKey: MONDAY };
    draft = appendBackfillExercise(draft, 'bench-press');
    draft = patchBackfillSet(draft, 0, 0, { reps: 5, weight: 100 });
    const before = Date.now();
    const next = applyBackfillLog({ draft, todayKey: TODAY, ...ids() });
    const after = Date.now();
    assert.ok(next);
    assert.equal(next?.durationSeconds, 0);
    const startedMs = Date.parse(next!.startedAt);
    assert.ok(startedMs < before, 'startedAt must not be now');
    assert.ok(startedMs < after);
    assert.equal(next?.startedAt, next?.completedAt);
  });

  it('timing on uses the times they set — 10:00 to 11:00 is 3600s', () => {
    let draft = {
      ...emptyBackfillDraft(),
      dateKey: MONDAY,
      timing: { enabled: true, startTime: '10:00', endTime: '11:00' },
    };
    draft = appendBackfillExercise(draft, 'bench-press');
    draft = patchBackfillSet(draft, 0, 0, { reps: 5, weight: 100 });
    const next = applyBackfillLog({ draft, todayKey: TODAY, ...ids() });
    assert.ok(next);
    assert.equal(next?.durationSeconds, 3600);
    assert.equal(localDateKey(new Date(next!.startedAt)), MONDAY);
    assert.equal(localDateKey(new Date(next!.completedAt)), MONDAY);
    const start = localInstantFromDateAndTime(MONDAY, '10:00');
    const end = localInstantFromDateAndTime(MONDAY, '11:00');
    assert.equal(next?.startedAt, start);
    assert.equal(next?.completedAt, end);
  });

  it('overnight end before start adds one local day — never now', () => {
    let draft = {
      ...emptyBackfillDraft(),
      dateKey: MONDAY,
      timing: { enabled: true, startTime: '22:00', endTime: '01:00' },
    };
    draft = appendBackfillExercise(draft, 'bench-press');
    draft = patchBackfillSet(draft, 0, 0, { reps: 5, weight: 100 });
    const next = applyBackfillLog({ draft, todayKey: TODAY, ...ids() });
    assert.ok(next);
    assert.equal(next?.durationSeconds, 3 * 3600);
    assert.equal(localDateKey(new Date(next!.startedAt)), MONDAY);
    assert.equal(localDateKey(new Date(next!.completedAt)), TODAY);
  });

  it('timing on without both times omits duration — does not invent now', () => {
    let draft = {
      ...emptyBackfillDraft(),
      dateKey: MONDAY,
      timing: { enabled: true, startTime: '10:00', endTime: '' },
    };
    draft = appendBackfillExercise(draft, 'bench-press');
    draft = patchBackfillSet(draft, 0, 0, { reps: 5, weight: 100 });
    const next = applyBackfillLog({ draft, todayKey: TODAY, ...ids() });
    assert.ok(next);
    assert.equal(next?.durationSeconds, 0);
  });

  it('today is allowed; nameless session stays Workout; plank time is work', () => {
    let named = { ...emptyBackfillDraft(), dateKey: TODAY };
    named = appendBackfillExercise(named, 'bench-press');
    named = patchBackfillSet(named, 0, 0, { reps: 5, weight: 100 });
    const todayLog = applyBackfillLog({ draft: named, todayKey: TODAY, ...ids() });
    assert.ok(todayLog);
    assert.equal(todayLog?.workoutName, 'Workout');
    assert.equal(localDateKey(new Date(todayLog!.completedAt)), TODAY);

    let plank = { ...emptyBackfillDraft(), dateKey: MONDAY };
    plank = appendBackfillExercise(plank, 'plank');
    plank = patchBackfillSet(plank, 0, 0, { reps: 0, weight: 0, durationSeconds: 45 });
    const plankLog = applyBackfillLog({ draft: plank, todayKey: TODAY, ...ids() });
    assert.ok(plankLog);
    assert.equal(plankLog?.exercises[0]?.sets[0]?.durationSeconds, 45);
    assert.equal(plankLog?.totalVolume, 0);
  });

  it('apply never tombstones or mints a second identity', () => {
    let draft = { ...emptyBackfillDraft(), dateKey: MONDAY };
    draft = appendBackfillExercise(draft, 'bench-press');
    draft = patchBackfillSet(draft, 0, 0, { reps: 5, weight: 135 });
    const a = applyBackfillLog({ draft, todayKey: TODAY, ...ids() });
    const b = applyBackfillLog({ draft, todayKey: TODAY, ...ids() });
    assert.equal(a?.id, b?.id);
    assert.equal(a?.clientId, b?.clientId);
    assert.equal(a?.deletedAt, null);
    assert.equal(
      applyBackfillLog({ draft, todayKey: TODAY, id: '', clientId: 'cid-1' }),
      null
    );
  });
});

describe('backfillPrLabels (.1000 uses .999)', () => {
  const prior: CompletedWorkoutLog = {
    id: 'log-prior',
    clientId: 'cid-prior',
    workoutName: 'Push',
    startedAt: '2026-08-17T10:00:00.000Z',
    completedAt: '2026-08-17T11:00:00.000Z',
    durationSeconds: 3600,
    totalVolume: 675,
    exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 135 }] }],
  };

  it('first-ever invents nothing; a heavier backfill cites the diary', () => {
    let draft = { ...emptyBackfillDraft(), dateKey: MONDAY };
    draft = appendBackfillExercise(draft, 'bench-press');
    draft = patchBackfillSet(draft, 0, 0, { reps: 5, weight: 225 });
    assert.deepEqual(backfillPrLabels(draft, [], PR_WORDS), [[null]]);
    const labels = backfillPrLabels(draft, [prior], PR_WORDS);
    assert.ok(labels[0]?.[0]);
    assert.match(String(labels[0]?.[0]), /heaviest|best logged 5/);
  });
});

describe('backfillSession wiring', () => {
  it('stays one home — no store / resume / paywall / now-clock', () => {
    const src = read('src/lib/workout/backfillSession.ts');
    assert.match(src, /decideBackfillSession/);
    assert.match(src, /applyBackfillLog/);
    assert.match(src, /emptyBackfillDraft/);
    assert.doesNotMatch(src, /from '@\/store\/workoutStore'/);
    assert.doesNotMatch(src, /startWorkout|protectLiveStart|decideThisDeviceResume/);
    assert.doesNotMatch(src, /isPremium|UnlockButton|\/bundle|permalink/);
    assert.doesNotMatch(src, /deletedAt:\s*['"]|tombstoneFromActive/);
    assert.doesNotMatch(src, /Date\.now\(/);
    assert.doesNotMatch(src, /from '@\/lib\/rewards|from '@\/lib\/social|from '@\/lib\/wearables/);
    assert.doesNotMatch(src, /discord\.com|WeChat|four-scene|Force Sync|Session Expired/i);
  });
});
