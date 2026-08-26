import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';
import type { ActiveWorkout, CompletedWorkoutLog } from '@/types';
import { decideMonthDaySelect } from '@/lib/history/monthTheyOwn.ts';
import { listSessionHistoryRows } from '@/lib/history/sessionHistoryList.ts';
import { localDateKeyFromIso } from '@/lib/time/localDate.ts';
import { decideRepeatThisSession } from './repeatThisSession.ts';
import {
  applyMoveSessionDay,
  sessionDayKey,
} from './moveSessionDay.ts';
import {
  applyCopySessionDay,
  decideCopySessionDay,
} from './copySessionDay.ts';

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
    sessionTitle: 'Garage',
    sessionNote: 'felt heavy',
    startedAt: isoOnLocalDay(MONDAY, 10, 0),
    completedAt: isoOnLocalDay(MONDAY, 11, 0),
    durationSeconds: 3600,
    totalVolume: 675,
    exercises: [
      {
        exerciseId: 'bench-press',
        note: 'paused',
        sets: [{ reps: 5, weight: 135 }],
      },
    ],
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

describe('decideCopySessionDay (.1030)', () => {
  it('empty id / date / today invents nothing', () => {
    const history = [log({ id: 'log-mon' })];
    assert.equal(
      decideCopySessionDay({
        sessionId: '',
        dateKey: TUESDAY,
        todayKey: TODAY,
        history,
      }).kind,
      'empty'
    );
    assert.equal(
      decideCopySessionDay({
        sessionId: 'log-mon',
        dateKey: '',
        todayKey: TODAY,
        history,
      }).kind,
      'empty'
    );
    assert.equal(
      decideCopySessionDay({
        sessionId: 'log-mon',
        dateKey: '2026-02-31',
        todayKey: TODAY,
        history,
      }).kind,
      'empty'
    );
    assert.equal(
      decideCopySessionDay({
        sessionId: 'log-mon',
        dateKey: TUESDAY,
        todayKey: 'nope',
        history,
      }).kind,
      'empty'
    );
    assert.equal(
      applyCopySessionDay({
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
      decideCopySessionDay({
        sessionId: 'log-mon',
        dateKey: '2026-08-27',
        todayKey: TODAY,
        history,
      }).kind,
      'empty'
    );
    assert.equal(
      applyCopySessionDay({
        sessionId: 'log-mon',
        dateKey: '2026-08-27',
        todayKey: TODAY,
        history,
      }),
      null
    );
  });

  it('missing / tombstone / live / same day invent nothing', () => {
    const history = [
      log({ id: 'log-mon' }),
      log({ id: 'log-gone', deletedAt: '2026-08-25T12:00:00.000Z' }),
    ];
    assert.equal(
      decideCopySessionDay({
        sessionId: 'missing',
        dateKey: TUESDAY,
        todayKey: TODAY,
        history,
      }).kind,
      'noop'
    );
    assert.equal(
      decideCopySessionDay({
        sessionId: 'log-gone',
        dateKey: TUESDAY,
        todayKey: TODAY,
        history,
      }).kind,
      'noop'
    );
    const open = live();
    assert.equal(
      decideCopySessionDay({
        sessionId: open.clientId,
        dateKey: MONDAY,
        todayKey: TODAY,
        history: [log({ id: open.clientId ?? 'x', clientId: open.clientId })],
        live: open,
      }).kind,
      'noop'
    );
    assert.equal(
      decideCopySessionDay({
        sessionId: 'log-mon',
        dateKey: MONDAY,
        todayKey: TODAY,
        history,
      }).kind,
      'noop'
    );
    assert.equal(
      applyCopySessionDay({
        sessionId: 'log-mon',
        dateKey: MONDAY,
        todayKey: TODAY,
        history,
      }),
      null
    );
  });
});

describe('applyCopySessionDay (.1030)', () => {
  it('Monday they logged — copy to Tuesday mints a new id; original stays', () => {
    const original = log({ id: 'log-mon' });
    const history = [original];
    const decision = decideCopySessionDay({
      sessionId: 'log-mon',
      dateKey: TUESDAY,
      todayKey: TODAY,
      history,
    });
    assert.equal(decision.kind, 'apply');
    if (decision.kind !== 'apply') return;

    const applied = applyCopySessionDay({
      sessionId: 'log-mon',
      dateKey: TUESDAY,
      todayKey: TODAY,
      history,
      now: '2026-08-26T12:00:00.000Z',
    });
    assert.ok(applied);
    assert.notEqual(applied?.next.id, 'log-mon');
    assert.notEqual(applied?.next.clientId, 'cid-log-mon');
    assert.notEqual(applied?.next.id, applied?.next.clientId);
    assert.equal(applied?.next.revision, 1);
    assert.equal(applied?.next.deletedAt, null);
    assert.equal(applied?.next.durationSeconds, 3600);
    assert.equal(applied?.next.workoutName, 'Push');
    assert.equal(applied?.next.sessionTitle, 'Garage');
    assert.equal(applied?.next.sessionNote, 'felt heavy');
    assert.equal(applied?.next.exercises[0]?.note, 'paused');
    assert.equal(applied?.next.exercises[0]?.sets[0]?.weight, 135);
    assert.equal(applied?.next.exercises[0]?.sets[0]?.reps, 5);
    assert.equal(sessionDayKey(applied?.next), TUESDAY);
    assert.equal(localDateKeyFromIso(applied!.next.startedAt), TUESDAY);
    assert.equal(localDateKeyFromIso(applied!.next.completedAt), TUESDAY);
    const started = new Date(applied!.next.startedAt);
    const originalStarted = new Date(original.startedAt);
    assert.equal(started.getHours(), originalStarted.getHours());
    assert.equal(started.getMinutes(), originalStarted.getMinutes());

    const stillOriginal = applied!.history.find((row) => row.id === 'log-mon');
    assert.ok(stillOriginal);
    assert.equal(stillOriginal?.clientId, 'cid-log-mon');
    assert.equal(sessionDayKey(stillOriginal), MONDAY);
    assert.equal(stillOriginal?.startedAt, original.startedAt);
    assert.equal(stillOriginal?.completedAt, original.completedAt);
    assert.equal(stillOriginal?.durationSeconds, 3600);

    applied!.next.exercises[0]!.sets[0]!.weight = 999;
    assert.equal(stillOriginal?.exercises[0]?.sets[0]?.weight, 135);
  });

  it('duration 0 stays 0 — copy does not invent a clock', () => {
    const original = log({ id: 'log-mon', durationSeconds: 0 });
    const applied = applyCopySessionDay({
      sessionId: 'log-mon',
      dateKey: TUESDAY,
      todayKey: TODAY,
      history: [original],
    });
    assert.ok(applied);
    assert.equal(applied?.next.durationSeconds, 0);
    assert.equal(
      applied?.history.find((row) => row.id === 'log-mon')?.durationSeconds,
      0
    );
  });
});

describe('source and destination day honesty (.1030)', () => {
  it('source day still has original; destination day lists the copy', () => {
    const monday = log({ id: 'log-mon' });
    const other = log({
      id: 'log-sun',
      startedAt: isoOnLocalDay(SUNDAY, 10, 0),
      completedAt: isoOnLocalDay(SUNDAY, 11, 0),
    });
    const applied = applyCopySessionDay({
      sessionId: 'log-mon',
      dateKey: TUESDAY,
      todayKey: TODAY,
      history: [monday, other],
    });
    assert.ok(applied);
    const next = applied!.history;

    const source = decideMonthDaySelect({ dateKey: MONDAY, history: next });
    assert.equal(source.kind, 'day');
    if (source.kind !== 'day') return;
    assert.equal(source.rows.length, 1);
    assert.equal(source.rows[0]?.id, 'log-mon');

    const dest = decideMonthDaySelect({ dateKey: TUESDAY, history: next });
    assert.equal(dest.kind, 'day');
    if (dest.kind !== 'day') return;
    assert.equal(dest.rows.length, 1);
    assert.equal(dest.rows[0]?.id, applied!.next.id);
    assert.notEqual(dest.rows[0]?.id, 'log-mon');

    const sunday = decideMonthDaySelect({ dateKey: SUNDAY, history: next });
    assert.equal(sunday.kind, 'day');
    if (sunday.kind !== 'day') return;
    assert.equal(sunday.rows[0]?.id, 'log-sun');

    const rows = listSessionHistoryRows(next);
    assert.equal(rows.some((row) => row.id === 'log-mon'), true);
    assert.equal(rows.some((row) => row.id === applied!.next.id), true);
  });

  it('tomb stays a tomb — copy never restores or invents', () => {
    const tomb = log({
      id: 'log-tomb',
      deletedAt: '2026-08-25T12:00:00.000Z',
    });
    const liveMon = log({ id: 'log-mon' });
    assert.equal(
      decideCopySessionDay({
        sessionId: 'log-tomb',
        dateKey: TUESDAY,
        todayKey: TODAY,
        history: [tomb, liveMon],
      }).kind,
      'noop'
    );
    const applied = applyCopySessionDay({
      sessionId: 'log-mon',
      dateKey: TUESDAY,
      todayKey: TODAY,
      history: [tomb, liveMon],
    });
    assert.ok(applied);
    const stillTomb = applied!.history.find((row) => row.id === 'log-tomb');
    assert.ok(stillTomb?.deletedAt);
    const source = decideMonthDaySelect({
      dateKey: MONDAY,
      history: applied!.history,
    });
    assert.equal(source.kind, 'day');
    if (source.kind !== 'day') return;
    assert.equal(source.rows.some((row) => row.id === 'log-mon'), true);
  });

  it('empty history invents nothing', () => {
    assert.equal(
      decideCopySessionDay({
        sessionId: 'log-mon',
        dateKey: TUESDAY,
        todayKey: TODAY,
        history: [],
      }).kind,
      'noop'
    );
    assert.equal(
      applyCopySessionDay({
        sessionId: 'log-mon',
        dateKey: TUESDAY,
        todayKey: TODAY,
        history: null,
      }),
      null
    );
  });
});

describe('Move and Repeat stay themselves (.1030)', () => {
  it('Move still re-dates the same id', () => {
    const original = log({ id: 'log-mon' });
    const moved = applyMoveSessionDay({
      sessionId: 'log-mon',
      dateKey: TUESDAY,
      todayKey: TODAY,
      history: [original],
    });
    assert.ok(moved);
    assert.equal(moved?.next.id, 'log-mon');
    assert.equal(moved?.next.clientId, 'cid-log-mon');
    assert.equal(sessionDayKey(moved?.next), TUESDAY);
    const vacated = decideMonthDaySelect({
      dateKey: MONDAY,
      history: moved!.history,
    });
    assert.equal(vacated.kind, 'none');
  });

  it('Repeat still lands Start after a copy; original stays', () => {
    const original = log({ id: 'log-mon' });
    const applied = applyCopySessionDay({
      sessionId: 'log-mon',
      dateKey: TUESDAY,
      todayKey: TODAY,
      history: [original],
    });
    assert.ok(applied);
    const source = applied!.history.find((row) => row.id === 'log-mon');
    assert.ok(source);
    const repeat = decideRepeatThisSession({ log: source });
    assert.equal(repeat.kind, 'start');
    if (repeat.kind !== 'start') return;
    assert.equal(repeat.name, 'Push');
    assert.equal(repeat.exercises[0]?.sets[0]?.weight, 135);
  });
});

describe('copySessionDay wiring', () => {
  it('is a pure helper — no store, no Start, no Feed', () => {
    const src = read('src/lib/workout/copySessionDay.ts');
    assert.match(src, /decideCopySessionDay/);
    assert.match(src, /applyCopySessionDay/);
    assert.match(src, /newClientId/);
    assert.match(src, /localDayDelta/);
    assert.match(src, /shiftIsoByLocalDays/);
    assert.doesNotMatch(src, /from '@\/store\/workoutStore'/);
    assert.doesNotMatch(src, /startWorkout|protectLiveStart|decideThisDeviceResume/);
    assert.doesNotMatch(src, /navigator\.share|mailto:|likes|Top 8/);
    assert.doesNotMatch(src, /localStorage/);
  });
});
