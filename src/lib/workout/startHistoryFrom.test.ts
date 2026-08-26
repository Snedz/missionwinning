/**
 * Start history from this date. Empty / missing / future invent
 * nothing. Fold, don't erase. Confirm when it hides a lot of days.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';
import type { CompletedWorkoutLog } from '@/types';
import { countTrainDaysThisWeek } from '@/lib/habitWeekCount.ts';
import { listSessionHistoryRows } from '@/lib/history/sessionHistoryList.ts';
import { findFinishedSession } from './deleteFinishedSession.ts';
import { quietWeekGlance } from '@/lib/today/quietWeekGlance.ts';
import { getTrainingStreak } from '@/lib/streaks.ts';
import {
  START_HISTORY_CONFIRM_DAYS,
  decideClearStartHistoryFrom,
  decideStartHistoryFrom,
  foldHistoryFrom,
  foldedTrainDays,
  historyForWeek,
} from './startHistoryFrom.ts';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

const TODAY = '2026-08-25';
const WEEK_NOW = new Date(2026, 7, 25, 12, 0, 0);

function log(
  over: Partial<CompletedWorkoutLog> &
    Pick<CompletedWorkoutLog, 'id' | 'workoutName' | 'startedAt' | 'completedAt'>
): CompletedWorkoutLog {
  return {
    clientId: `cid-${over.id}`,
    revision: 1,
    durationSeconds: 3600,
    totalVolume: 675,
    exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 135 }] }],
    ...over,
  };
}

function day(id: string, dateKey: string): CompletedWorkoutLog {
  const [y, m, d] = dateKey.split('-').map(Number) as [number, number, number];
  return log({
    id,
    workoutName: id,
    startedAt: new Date(y, m - 1, d, 10, 0, 0, 0).toISOString(),
    completedAt: new Date(y, m - 1, d, 11, 0, 0, 0).toISOString(),
  });
}

function yearsOfDays(count: number, lastKey: string): CompletedWorkoutLog[] {
  const [y, m, d] = lastKey.split('-').map(Number) as [number, number, number];
  const out: CompletedWorkoutLog[] = [];
  for (let i = 0; i < count; i++) {
    const date = new Date(y, m - 1, d - i);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    out.push(day(`log-${key}`, key));
  }
  return out;
}

describe('decideStartHistoryFrom (.1005)', () => {
  const history = [day('old', '2024-01-02'), day('new', '2026-08-24')];

  it('empty / missing / junk invents nothing', () => {
    assert.equal(decideStartHistoryFrom({ date: '', todayKey: TODAY, history }).kind, 'empty');
    assert.equal(decideStartHistoryFrom({ date: '   ', todayKey: TODAY, history }).kind, 'empty');
    assert.equal(decideStartHistoryFrom({ date: null, todayKey: TODAY, history }).kind, 'empty');
    assert.equal(
      decideStartHistoryFrom({ date: undefined, todayKey: TODAY, history }).kind,
      'empty'
    );
    assert.equal(
      decideStartHistoryFrom({ date: '2026-02-31', todayKey: TODAY, history }).kind,
      'empty'
    );
    assert.equal(
      decideStartHistoryFrom({ date: 'not-a-date', todayKey: TODAY, history }).kind,
      'empty'
    );
    assert.equal(
      decideStartHistoryFrom({ date: '2026-08-20', todayKey: 'nope', history }).kind,
      'empty'
    );
  });

  it('a future date invents nothing', () => {
    assert.equal(
      decideStartHistoryFrom({ date: '2026-08-26', todayKey: TODAY, history }).kind,
      'empty'
    );
    assert.equal(
      decideStartHistoryFrom({ date: '2027-01-01', todayKey: TODAY, history }).kind,
      'empty'
    );
  });

  it('same as the stored fold is a noop', () => {
    assert.equal(
      decideStartHistoryFrom({
        date: '2026-08-20',
        todayKey: TODAY,
        history,
        current: '2026-08-20',
      }).kind,
      'noop'
    );
  });

  it('a small fold applies without confirm', () => {
    assert.deepEqual(
      decideStartHistoryFrom({ date: ' 2026-08-20 ', todayKey: TODAY, history }),
      { kind: 'apply', dateKey: '2026-08-20', foldedDays: 1 }
    );
  });

  it('hiding a lot of days needs confirm', () => {
    const dump = [...yearsOfDays(START_HISTORY_CONFIRM_DAYS, '2026-01-14'), day('now', '2026-08-24')];
    const decision = decideStartHistoryFrom({
      date: '2026-08-20',
      todayKey: TODAY,
      history: dump,
    });
    assert.equal(decision.kind, 'needs-confirm');
    if (decision.kind !== 'needs-confirm') return;
    assert.equal(decision.dateKey, '2026-08-20');
    assert.ok(decision.foldedDays >= START_HISTORY_CONFIRM_DAYS);
  });

  it('thirteen folded days apply; fourteen need confirm', () => {
    const fourteen = [...yearsOfDays(14, '2026-01-14'), day('now', TODAY)];
    assert.equal(
      decideStartHistoryFrom({ date: TODAY, todayKey: TODAY, history: fourteen }).kind,
      'needs-confirm'
    );

    const thirteen = [...yearsOfDays(13, '2026-01-13'), day('now', TODAY)];
    assert.equal(
      decideStartHistoryFrom({ date: TODAY, todayKey: TODAY, history: thirteen }).kind,
      'apply'
    );
  });
});

describe('decideClearStartHistoryFrom (.1005)', () => {
  it('clearing with no fold invents nothing', () => {
    assert.equal(decideClearStartHistoryFrom({ current: '' }).kind, 'empty');
    assert.equal(decideClearStartHistoryFrom({ current: null }).kind, 'empty');
    assert.equal(decideClearStartHistoryFrom({}).kind, 'empty');
  });

  it('clearing a stored fold restores the diary', () => {
    assert.equal(decideClearStartHistoryFrom({ current: '2026-08-01' }).kind, 'clear');
  });
});

describe('foldHistoryFrom (.1005)', () => {
  const old = day('old', '2024-01-02');
  const mid = day('mid', '2026-08-20');
  const neu = day('new', '2026-08-24');
  const history = [old, mid, neu];

  it('empty / missing fold returns the full diary — does not erase', () => {
    assert.deepEqual(
      foldHistoryFrom(history, '').map((row) => row.id),
      ['old', 'mid', 'new']
    );
    assert.deepEqual(
      foldHistoryFrom(history, null).map((row) => row.id),
      ['old', 'mid', 'new']
    );
    assert.equal(foldHistoryFrom(null, '2026-08-20').length, 0);
  });

  it('tombs are not week-1 — restore is History (.1006)', () => {
    const tomb = { ...mid, id: 'gone', deletedAt: '2026-08-25T12:00:00.000Z' };
    assert.deepEqual(
      foldHistoryFrom([old, tomb, neu], null).map((row) => row.id),
      ['old', 'new']
    );
    assert.deepEqual(
      foldHistoryFrom([old, tomb, neu], '2026-08-20').map((row) => row.id),
      ['new']
    );
  });

  it('folds older logs out of week surfaces and keeps History detail', () => {
    const week = foldHistoryFrom(history, '2026-08-20');
    assert.deepEqual(
      week.map((row) => row.id),
      ['mid', 'new']
    );
    assert.deepEqual(
      listSessionHistoryRows(history).map((row) => row.id),
      ['old', 'mid', 'new']
    );
    assert.equal(findFinishedSession(history, 'old')?.id, 'old');
    assert.equal(history.length, 3);
    assert.equal(old.deletedAt, undefined);
  });

  it('week strip / streak / habit week start at the chosen date', () => {
    const dump = [
      day('y1', '2024-08-19'),
      day('y2', '2025-08-20'),
      day('mon', '2026-08-24'),
      day('tue', '2026-08-25'),
    ];
    const week = foldHistoryFrom(dump, '2026-08-25');
    const glance = quietWeekGlance({ history: week, now: WEEK_NOW });
    const mon = glance.days.find((d) => d.dateKey === '2026-08-24');
    const tue = glance.days.find((d) => d.dateKey === '2026-08-25');
    assert.equal(mon?.done, false);
    assert.equal(tue?.done, true);
    assert.equal(countTrainDaysThisWeek(dump, WEEK_NOW), 2);
    assert.equal(countTrainDaysThisWeek(week, WEEK_NOW), 1);
    assert.ok(getTrainingStreak(dump) >= getTrainingStreak(week));
  });

  it('does not mutate the source history', () => {
    const src = [day('old', '2024-01-02'), day('new', '2026-08-24')];
    const folded = foldHistoryFrom(src, '2026-08-01');
    assert.equal(src.length, 2);
    assert.notEqual(folded, src);
    assert.equal(folded.length, 1);
  });

  it('historyForWeek with no stored date is the full diary', () => {
    assert.deepEqual(
      historyForWeek(history, null).map((row) => row.id),
      ['old', 'mid', 'new']
    );
  });

  it('tombstones do not count as folded days', () => {
    const gone = { ...day('gone', '2024-01-02'), deletedAt: '2026-08-25T12:00:00.000Z' };
    assert.equal(foldedTrainDays([gone, day('new', '2026-08-24')], '2026-08-20'), 0);
  });
});

describe('startHistoryFrom wiring', () => {
  it('stays one home — no store / delete / paywall / wipe / live cancel', () => {
    const src = read('src/lib/workout/startHistoryFrom.ts');
    assert.match(src, /decideStartHistoryFrom/);
    assert.match(src, /foldHistoryFrom/);
    assert.match(src, /needs-confirm/);
    assert.doesNotMatch(src, /from '@\/store\/workoutStore'/);
    assert.doesNotMatch(src, /applyDeleteFinishedSession|decideDeleteFinishedSession/);
    assert.doesNotMatch(src, /decideBackfillSession|decideEditSave|decideMergeExercises/);
    assert.doesNotMatch(src, /startWorkout|protectLiveStart|decideThisDeviceResume/);
    assert.doesNotMatch(src, /cancelActiveWorkout|tombstoneFromActive/);
    assert.doesNotMatch(src, /isPremium|UnlockButton|\/bundle|permalink/);
    assert.doesNotMatch(src, /workoutHistory\s*=\s*\[\]|savedWorkouts\s*=\s*\[\]/);
    assert.doesNotMatch(src, /discord\.com|WeChat|four-scene|Force Sync|Session Expired/i);
    assert.doesNotMatch(src, /fieldTest|pregnancy|pt-safety/i);
  });
});
