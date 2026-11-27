/**
 * Delete this finished session. Restore a tombstone.
 * Empty / live / missing / not-deleted invent nothing.
 * Confirm-gated delete. Other days stay. Never wipes the account.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';
import type { ActiveWorkout, CompletedWorkoutLog } from '@/types';
import { countTrainDaysThisWeek } from '@/lib/habitWeekCount.ts';
import {
  listDeletedSessionHistoryRows,
  listSessionHistoryRows,
} from '@/lib/history/sessionHistoryList.ts';
import { listMovementHistory } from './movementHistory.ts';
import { getBestPriorSet } from './workoutPr.ts';
import {
  applyDeleteFinishedSession,
  applyRestoreFinishedSession,
  decideDeleteFinishedSession,
  decideRestoreFinishedSession,
  findDeletedSession,
  findFinishedSession,
} from './deleteFinishedSession.ts';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

function log(
  over: Partial<CompletedWorkoutLog> &
    Pick<CompletedWorkoutLog, 'id' | 'workoutName' | 'exercises'>
): CompletedWorkoutLog {
  return {
    clientId: `cid-${over.id}`,
    revision: 1,
    startedAt: '2026-08-17T10:00:00.000Z',
    completedAt: '2026-08-17T11:00:00.000Z',
    durationSeconds: 3600,
    totalVolume: 675,
    ...over,
  };
}

function monday(): CompletedWorkoutLog {
  return log({
    id: 'log-mon',
    workoutName: 'Bogus Monday',
    startedAt: '2026-08-17T10:00:00.000Z',
    completedAt: '2026-08-17T11:00:00.000Z',
    exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 135 }] }],
    totalVolume: 675,
  });
}

function tuesday(): CompletedWorkoutLog {
  return log({
    id: 'log-tue',
    clientId: 'cid-tue',
    workoutName: 'Tuesday',
    startedAt: '2026-08-18T10:00:00.000Z',
    completedAt: '2026-08-18T11:00:00.000Z',
    exercises: [{ exerciseId: 'squat', sets: [{ reps: 5, weight: 185 }] }],
    totalVolume: 925,
  });
}

function live(over: Partial<ActiveWorkout> = {}): ActiveWorkout {
  return {
    workoutName: 'Live',
    startedAt: '2026-08-25T10:00:00.000Z',
    clientId: 'cid-live',
    exercises: [{ exerciseId: 'row', sets: [] }],
    ...over,
  };
}

describe('decideDeleteFinishedSession (.1003)', () => {
  it('empty id invents nothing', () => {
    const history = [monday(), tuesday()];
    assert.equal(
      decideDeleteFinishedSession({ sessionId: '', history }).kind,
      'empty'
    );
    assert.equal(
      decideDeleteFinishedSession({ sessionId: '   ', history }).kind,
      'empty'
    );
    assert.equal(
      decideDeleteFinishedSession({ sessionId: null, history }).kind,
      'empty'
    );
    assert.equal(
      decideDeleteFinishedSession({ sessionId: undefined, history }).kind,
      'empty'
    );
    assert.equal(
      applyDeleteFinishedSession({ sessionId: '', history }),
      null
    );
  });

  it('live session id invents nothing — discard is elsewhere', () => {
    const history = [monday(), tuesday()];
    const open = live();
    assert.equal(
      decideDeleteFinishedSession({
        sessionId: open.clientId,
        history,
        live: open,
      }).kind,
      'noop'
    );
    assert.equal(
      decideDeleteFinishedSession({
        sessionId: 'wid-live',
        history,
        live: live({ workoutId: 'wid-live' }),
      }).kind,
      'noop'
    );
    assert.equal(
      applyDeleteFinishedSession({
        sessionId: open.clientId,
        history,
        live: open,
      }),
      null
    );
    assert.equal(findFinishedSession(history, open.clientId), null);
  });

  it('missing / already-gone invents nothing', () => {
    const history = [monday(), tuesday()];
    assert.equal(
      decideDeleteFinishedSession({ sessionId: 'log-missing', history }).kind,
      'noop'
    );
    assert.equal(
      decideDeleteFinishedSession({ sessionId: 'log-mon', history: [] }).kind,
      'noop'
    );
    assert.equal(
      decideDeleteFinishedSession({
        sessionId: 'log-mon',
        history: [
          { ...monday(), deletedAt: '2026-08-25T12:00:00.000Z' },
          tuesday(),
        ],
      }).kind,
      'noop'
    );
    assert.equal(
      applyDeleteFinishedSession({ sessionId: 'nope', history }),
      null
    );
  });

  it('a finished log always needs confirm — never auto-delete', () => {
    const history = [monday(), tuesday()];
    assert.deepEqual(
      decideDeleteFinishedSession({ sessionId: ' log-mon ', history }),
      { kind: 'needs-confirm', sessionId: 'log-mon' }
    );
    assert.deepEqual(
      decideDeleteFinishedSession({ sessionId: 'cid-log-mon', history }),
      { kind: 'needs-confirm', sessionId: 'log-mon' }
    );
  });
});

describe('applyDeleteFinishedSession (.1003)', () => {
  const NOW = '2026-08-25T15:00:00.000Z';

  it('tombstones that one session — other days stay', () => {
    const history = [monday(), tuesday()];
    const applied = applyDeleteFinishedSession({
      sessionId: 'log-mon',
      history,
      now: NOW,
    });
    assert.ok(applied);
    assert.equal(applied?.next.id, 'log-mon');
    assert.equal(applied?.next.clientId, 'cid-log-mon');
    assert.equal(applied?.next.deletedAt, NOW);
    assert.equal(applied?.next.updatedAt, NOW);
    assert.equal(applied?.next.revision, 2);
    assert.equal(applied?.history.length, 2);
    const tue = applied?.history.find((row) => row.id === 'log-tue');
    assert.ok(tue);
    assert.equal(tue?.deletedAt, undefined);
    assert.equal(tue?.workoutName, 'Tuesday');
    assert.equal(tue?.exercises[0]?.exerciseId, 'squat');
  });

  it('leaves History / week strip / this-movement / PR diary honest', () => {
    const history = [monday(), tuesday()];
    const applied = applyDeleteFinishedSession({
      sessionId: 'log-mon',
      history,
      now: NOW,
    });
    assert.ok(applied);
    const next = applied!.history;
    assert.deepEqual(
      listSessionHistoryRows(next).map((row) => row.id),
      ['log-tue']
    );
    assert.equal(listMovementHistory(next, 'bench-press').length, 0);
    assert.equal(listMovementHistory(next, 'squat').length, 1);
    assert.equal(getBestPriorSet('bench-press', next), null);
    assert.deepEqual(getBestPriorSet('squat', next), { weight: 185, reps: 5 });
    const weekNow = new Date('2026-08-19T12:00:00');
    assert.equal(countTrainDaysThisWeek(history, weekNow), 2);
    assert.equal(countTrainDaysThisWeek(next, weekNow), 1);
  });

  it('never wipes the account — two logs stay two rows', () => {
    const history = [monday(), tuesday()];
    const applied = applyDeleteFinishedSession({
      sessionId: 'log-mon',
      history,
      now: NOW,
    });
    assert.equal(applied?.history.length, 2);
    assert.ok(applied?.history.some((row) => row.id === 'log-tue' && !row.deletedAt));
    assert.ok(applied?.history.some((row) => row.id === 'log-mon' && row.deletedAt));
  });

  it('does not invent a session when the id is gone', () => {
    assert.equal(
      applyDeleteFinishedSession({
        sessionId: 'log-mon',
        history: null,
        now: NOW,
      }),
      null
    );
    assert.equal(findFinishedSession(undefined, 'log-mon'), null);
  });
});

describe('decideRestoreFinishedSession (.1006)', () => {
  const NOW = '2026-08-25T16:00:00.000Z';
  const tomb = (): CompletedWorkoutLog => ({
    ...monday(),
    deletedAt: '2026-08-25T15:00:00.000Z',
    revision: 2,
  });

  it('empty id invents nothing', () => {
    const history = [tomb(), tuesday()];
    assert.equal(decideRestoreFinishedSession({ sessionId: '', history }).kind, 'empty');
    assert.equal(decideRestoreFinishedSession({ sessionId: '   ', history }).kind, 'empty');
    assert.equal(decideRestoreFinishedSession({ sessionId: null, history }).kind, 'empty');
    assert.equal(applyRestoreFinishedSession({ sessionId: '', history }), null);
  });

  it('not-deleted / missing invents nothing', () => {
    const history = [monday(), tuesday()];
    assert.equal(
      decideRestoreFinishedSession({ sessionId: 'log-mon', history }).kind,
      'noop'
    );
    assert.equal(
      decideRestoreFinishedSession({ sessionId: 'log-missing', history: [tomb()] }).kind,
      'noop'
    );
    assert.equal(applyRestoreFinishedSession({ sessionId: 'log-mon', history }), null);
    assert.equal(findDeletedSession(history, 'log-mon'), null);
  });

  it('findDeletedSession matches id or clientId — live rows are not this', () => {
    const gone = tomb();
    const history = [gone, tuesday()];
    assert.equal(findDeletedSession(history, 'log-mon')?.id, 'log-mon');
    assert.equal(findDeletedSession(history, 'cid-log-mon')?.id, 'log-mon');
    assert.equal(findDeletedSession(history, ' cid-log-mon ')?.id, 'log-mon');
    assert.equal(findDeletedSession([monday(), tuesday()], 'cid-log-mon'), null);
    assert.equal(findDeletedSession(history, 'cid-tue'), null);
    assert.equal(findDeletedSession(null, 'cid-log-mon'), null);
    assert.equal(findDeletedSession(undefined, 'log-mon'), null);
    assert.equal(findDeletedSession(history, ''), null);
  });

  it('live session id invents nothing — do not undelete a live session', () => {
    const open = live();
    const history = [
      { ...tomb(), id: open.clientId ?? 'x', clientId: open.clientId },
      tuesday(),
    ];
    assert.equal(
      findDeletedSession(history, open.clientId)?.clientId,
      open.clientId,
      'the tomb exists; live is what noops'
    );
    assert.equal(
      decideRestoreFinishedSession({
        sessionId: open.clientId,
        history,
        live: open,
      }).kind,
      'noop'
    );
    assert.equal(
      applyRestoreFinishedSession({
        sessionId: open.clientId,
        history,
        live: open,
      }),
      null
    );
    assert.equal(
      decideRestoreFinishedSession({
        sessionId: 'wid-live',
        history,
        live: live({ workoutId: 'wid-live' }),
      }).kind,
      'noop'
    );
  });

  it('a tombstone restores that one session — other days stay', () => {
    const history = [tomb(), tuesday()];
    assert.deepEqual(
      decideRestoreFinishedSession({ sessionId: ' log-mon ', history }),
      { kind: 'restore', sessionId: 'log-mon' }
    );
    assert.deepEqual(
      decideRestoreFinishedSession({ sessionId: 'cid-log-mon', history }),
      { kind: 'restore', sessionId: 'log-mon' }
    );
    const applied = applyRestoreFinishedSession({
      sessionId: 'cid-log-mon',
      history,
      now: NOW,
    });
    assert.ok(applied);
    assert.equal(applied?.next.id, 'log-mon');
    assert.equal(applied?.next.deletedAt, null);
    assert.equal(applied?.next.updatedAt, NOW);
    assert.equal(applied?.next.revision, 3);
    const tue = applied?.history.find((row) => row.id === 'log-tue');
    assert.ok(tue && !tue.deletedAt);
    assert.deepEqual(
      listSessionHistoryRows(applied!.history).map((row) => row.id),
      ['log-mon', 'log-tue']
    );
    assert.equal(listDeletedSessionHistoryRows(applied!.history).length, 0);
    assert.equal(listMovementHistory(applied!.history, 'bench-press').length, 1);
    assert.deepEqual(getBestPriorSet('bench-press', applied!.history), {
      weight: 135,
      reps: 5,
    });
    const weekNow = new Date('2026-08-19T12:00:00');
    assert.equal(countTrainDaysThisWeek(applied!.history, weekNow), 2);
  });
});

describe('deleteFinishedSession wiring', () => {
  it('stays one home — no store / resume / paywall / wipe / live cancel', () => {
    const src = read('src/lib/workout/deleteFinishedSession.ts');
    assert.match(src, /decideDeleteFinishedSession/);
    assert.match(src, /applyDeleteFinishedSession/);
    assert.match(src, /decideRestoreFinishedSession/);
    assert.match(src, /applyRestoreFinishedSession/);
    assert.match(src, /needs-confirm/);
    assert.doesNotMatch(src, /from '@\/store\/workoutStore'/);
    assert.doesNotMatch(src, /startWorkout|protectLiveStart|decideThisDeviceResume/);
    assert.doesNotMatch(src, /cancelActiveWorkout|tombstoneFromActive/);
    assert.doesNotMatch(src, /isPremium|UnlockButton|\/bundle|permalink/);
    assert.doesNotMatch(src, /workoutHistory\s*=\s*\[\]|savedWorkouts\s*=\s*\[\]/);
    assert.doesNotMatch(src, /discord\.com|WeChat|four-scene|Force Sync|Session Expired/i);
    assert.doesNotMatch(src, /fieldTest|pregnancy|pt-safety/i);
  });
});
