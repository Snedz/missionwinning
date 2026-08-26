import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';
import type { ActiveWorkout, CompletedWorkoutLog } from '@/types';
import { decideMonthDaySelect } from '@/lib/history/monthTheyOwn.ts';
import { listSessionHistoryRows } from '@/lib/history/sessionHistoryList.ts';
import { localDateKeyFromIso } from '@/lib/time/localDate.ts';
import {
  applyMoveSessionDay,
  decideMoveSessionDay,
  localDayDelta,
  sessionDayKey,
  shiftIsoByLocalDays,
} from './moveSessionDay.ts';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

const TODAY = '2026-08-26';
const MONDAY = '2026-08-24';
const TUESDAY = '2026-08-25';
const SUNDAY = '2026-08-23';

/** Instant at local clock on a calendar day — never Date.parse of a bare date. */
function isoOnLocalDay(dateKey: string, hours: number, minutes: number): string {
  const [y, m, d] = dateKey.split('-').map(Number) as [number, number, number];
  return new Date(y, m - 1, d, hours, minutes, 0, 0).toISOString();
}

function log(
  over: Partial<CompletedWorkoutLog> & Pick<CompletedWorkoutLog, 'id'>
): CompletedWorkoutLog {
  return {
    clientId: `cid-${over.id}`,
    revision: 1,
    workoutName: 'Push',
    startedAt: isoOnLocalDay(MONDAY, 10, 0),
    completedAt: isoOnLocalDay(MONDAY, 11, 0),
    durationSeconds: 3600,
    totalVolume: 675,
    exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 135 }] }],
    ...over,
  };
}

function live(): ActiveWorkout {
  return {
    workoutName: 'Live',
    startedAt: '2026-08-26T10:00:00.000Z',
    clientId: 'cid-live',
    exercises: [{ exerciseId: 'row', sets: [] }],
  };
}

describe('sessionDayKey / localDayDelta (.1027)', () => {
  it('reads the completed day and counts calendar days from local fields', () => {
    assert.equal(sessionDayKey(log({ id: 'mon' })), MONDAY);
    assert.equal(localDayDelta(MONDAY, TUESDAY), 1);
    assert.equal(localDayDelta(TUESDAY, MONDAY), -1);
    assert.equal(localDayDelta(MONDAY, MONDAY), 0);
    assert.equal(localDayDelta('nope', TUESDAY), null);
  });

  it('shifts an instant by local days and keeps the clock', () => {
    const src = isoOnLocalDay(MONDAY, 10, 0);
    const moved = shiftIsoByLocalDays(src, 1);
    assert.equal(localDateKeyFromIso(moved), TUESDAY);
    const back = new Date(moved);
    const original = new Date(src);
    assert.equal(back.getHours(), original.getHours());
    assert.equal(back.getMinutes(), original.getMinutes());
  });
});

describe('decideMoveSessionDay (.1027)', () => {
  it('empty id / date / today invents nothing', () => {
    const history = [log({ id: 'log-mon' })];
    assert.equal(
      decideMoveSessionDay({
        sessionId: '',
        dateKey: TUESDAY,
        todayKey: TODAY,
        history,
      }).kind,
      'empty'
    );
    assert.equal(
      decideMoveSessionDay({
        sessionId: 'log-mon',
        dateKey: '',
        todayKey: TODAY,
        history,
      }).kind,
      'empty'
    );
    assert.equal(
      decideMoveSessionDay({
        sessionId: 'log-mon',
        dateKey: '2026-02-31',
        todayKey: TODAY,
        history,
      }).kind,
      'empty'
    );
    assert.equal(
      decideMoveSessionDay({
        sessionId: 'log-mon',
        dateKey: TUESDAY,
        todayKey: 'nope',
        history,
      }).kind,
      'empty'
    );
    assert.equal(
      applyMoveSessionDay({
        sessionId: '  ',
        dateKey: TUESDAY,
        todayKey: TODAY,
        history,
      }),
      null
    );
  });

  it('future invents nothing — not a planner', () => {
    const history = [log({ id: 'log-mon' })];
    assert.equal(
      decideMoveSessionDay({
        sessionId: 'log-mon',
        dateKey: '2026-08-27',
        todayKey: TODAY,
        history,
      }).kind,
      'empty'
    );
  });

  it('missing / tombstone / live / same day invent nothing', () => {
    const history = [
      log({ id: 'log-mon' }),
      log({ id: 'log-gone', deletedAt: '2026-08-25T12:00:00.000Z' }),
    ];
    assert.equal(
      decideMoveSessionDay({
        sessionId: 'missing',
        dateKey: TUESDAY,
        todayKey: TODAY,
        history,
      }).kind,
      'noop'
    );
    assert.equal(
      decideMoveSessionDay({
        sessionId: 'log-gone',
        dateKey: TUESDAY,
        todayKey: TODAY,
        history,
      }).kind,
      'noop'
    );
    const open = live();
    assert.equal(
      decideMoveSessionDay({
        sessionId: open.clientId,
        dateKey: MONDAY,
        todayKey: TODAY,
        history: [log({ id: open.clientId ?? 'x', clientId: open.clientId })],
        live: open,
      }).kind,
      'noop'
    );
    assert.equal(
      decideMoveSessionDay({
        sessionId: 'log-mon',
        dateKey: MONDAY,
        todayKey: TODAY,
        history,
      }).kind,
      'noop'
    );
  });

  it('Monday they logged — move to Tuesday applies, same id, same sets', () => {
    const original = log({ id: 'log-mon' });
    const history = [original];
    const decision = decideMoveSessionDay({
      sessionId: 'log-mon',
      dateKey: TUESDAY,
      todayKey: TODAY,
      history,
    });
    assert.equal(decision.kind, 'apply');
    if (decision.kind !== 'apply') return;
    assert.equal(decision.sessionId, 'log-mon');
    assert.equal(decision.dateKey, TUESDAY);

    const applied = applyMoveSessionDay({
      sessionId: 'log-mon',
      dateKey: TUESDAY,
      todayKey: TODAY,
      history,
      now: '2026-08-26T12:00:00.000Z',
    });
    assert.ok(applied);
    assert.equal(applied?.next.id, 'log-mon');
    assert.equal(applied?.next.clientId, 'cid-log-mon');
    assert.equal(applied?.next.revision, 2);
    assert.equal(applied?.next.deletedAt, null);
    assert.equal(applied?.next.durationSeconds, 3600);
    assert.equal(applied?.next.exercises[0]?.sets[0]?.weight, 135);
    assert.equal(applied?.next.exercises[0]?.sets[0]?.reps, 5);
    assert.equal(sessionDayKey(applied?.next), TUESDAY);
    assert.equal(localDateKeyFromIso(applied!.next.startedAt), TUESDAY);
    assert.notEqual(applied?.next.completedAt, original.completedAt);
  });
});

describe('vacated day honesty (.1027)', () => {
  it('vacated day drops that session; destination day shows it', () => {
    const monday = log({ id: 'log-mon' });
    const other = log({
      id: 'log-sun',
      startedAt: isoOnLocalDay(SUNDAY, 10, 0),
      completedAt: isoOnLocalDay(SUNDAY, 11, 0),
    });
    const applied = applyMoveSessionDay({
      sessionId: 'log-mon',
      dateKey: TUESDAY,
      todayKey: TODAY,
      history: [monday, other],
    });
    assert.ok(applied);
    const next = applied!.history;

    const vacated = decideMonthDaySelect({ dateKey: MONDAY, history: next });
    assert.equal(vacated.kind, 'none');

    const dest = decideMonthDaySelect({ dateKey: TUESDAY, history: next });
    assert.equal(dest.kind, 'day');
    if (dest.kind !== 'day') return;
    assert.equal(dest.rows.length, 1);
    assert.equal(dest.rows[0]?.id, 'log-mon');

    const sunday = decideMonthDaySelect({ dateKey: SUNDAY, history: next });
    assert.equal(sunday.kind, 'day');
    if (sunday.kind !== 'day') return;
    assert.equal(sunday.rows[0]?.id, 'log-sun');

    const rows = listSessionHistoryRows(next);
    assert.equal(rows.some((row) => row.id === 'log-mon'), true);
    assert.equal(
      rows.find((row) => row.id === 'log-mon')?.completedAt,
      applied!.next.completedAt
    );
  });

  it('tomb stays a tomb — move never restores or invents', () => {
    const tomb = log({
      id: 'log-tomb',
      deletedAt: '2026-08-25T12:00:00.000Z',
    });
    const liveMon = log({ id: 'log-mon' });
    assert.equal(
      decideMoveSessionDay({
        sessionId: 'log-tomb',
        dateKey: TUESDAY,
        todayKey: TODAY,
        history: [tomb, liveMon],
      }).kind,
      'noop'
    );
    const applied = applyMoveSessionDay({
      sessionId: 'log-mon',
      dateKey: TUESDAY,
      todayKey: TODAY,
      history: [tomb, liveMon],
    });
    assert.ok(applied);
    const stillTomb = applied!.history.find((row) => row.id === 'log-tomb');
    assert.ok(stillTomb?.deletedAt);
    const vacated = decideMonthDaySelect({
      dateKey: MONDAY,
      history: applied!.history,
    });
    assert.equal(vacated.kind, 'none');
  });

  it('empty history invents nothing', () => {
    assert.equal(
      decideMoveSessionDay({
        sessionId: 'log-mon',
        dateKey: TUESDAY,
        todayKey: TODAY,
        history: [],
      }).kind,
      'noop'
    );
    assert.equal(
      applyMoveSessionDay({
        sessionId: 'log-mon',
        dateKey: TUESDAY,
        todayKey: TODAY,
        history: null,
      }),
      null
    );
  });
});

describe('moveSessionDay wiring', () => {
  it('is a pure helper — no store, no Start, no Feed', () => {
    const src = read('src/lib/workout/moveSessionDay.ts');
    assert.match(src, /decideMoveSessionDay/);
    assert.match(src, /applyMoveSessionDay/);
    assert.doesNotMatch(src, /from '@\/store\/workoutStore'/);
    assert.doesNotMatch(src, /startWorkout|protectLiveStart|decideThisDeviceResume/);
    assert.doesNotMatch(src, /navigator\.share|mailto:|likes|Top 8/);
  });
});
