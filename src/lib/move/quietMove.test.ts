/**
 * Quiet Move — optional walk / easy session. Not a Train day.
 *
 * Injected today / now / id so fixtures do not expire.
 * Mutants: require a number, invent 0, write workout/activity/wins,
 * mark the week strip, seed a feed.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  appendQuietMove,
  decideQuietMove,
  listQuietMoveForDate,
  parseQuietMoveDistanceKm,
  parseQuietMoveLog,
  parseQuietMoveMinutes,
  type QuietMoveInput,
  type QuietMoveRow,
} from './quietMove.ts';
import { quietWeekGlance } from '../today/quietWeekGlance.ts';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

const TODAY = '2026-08-12';
const NOW = '2026-08-12T15:00:00.000Z';

function input(partial: Partial<QuietMoveInput> = {}): QuietMoveInput {
  return {
    kind: 'walk',
    todayIso: TODAY,
    nowIso: NOW,
    id: 'qm-1',
    ...partial,
  };
}

describe('parseQuietMoveMinutes', () => {
  it('keeps a positive whole number; empty / 0 / junk invent nothing', () => {
    assert.equal(parseQuietMoveMinutes(20), 20);
    assert.equal(parseQuietMoveMinutes('20'), 20);
    assert.equal(parseQuietMoveMinutes('20.4'), 20);
    assert.equal(parseQuietMoveMinutes(''), undefined);
    assert.equal(parseQuietMoveMinutes(null), undefined);
    assert.equal(parseQuietMoveMinutes(0), undefined);
    assert.equal(parseQuietMoveMinutes(-5), undefined);
    assert.equal(parseQuietMoveMinutes('nope'), undefined);
  });
});

describe('parseQuietMoveDistanceKm', () => {
  it('keeps a positive distance; empty / 0 invent nothing', () => {
    assert.equal(parseQuietMoveDistanceKm(3.2), 3.2);
    assert.equal(parseQuietMoveDistanceKm('3,25'), 3.25);
    assert.equal(parseQuietMoveDistanceKm(''), undefined);
    assert.equal(parseQuietMoveDistanceKm(0), undefined);
    assert.equal(parseQuietMoveDistanceKm(-1), undefined);
  });
});

describe('decideQuietMove', () => {
  it('kind-only walk is a valid quiet log', () => {
    const row = decideQuietMove(input());
    assert.deepEqual(row, {
      id: 'qm-1',
      date: TODAY,
      kind: 'walk',
      createdAt: NOW,
    });
    assert.equal('minutes' in (row ?? {}), false);
    assert.equal('distanceKm' in (row ?? {}), false);
  });

  it('easy session kind-only is valid', () => {
    const row = decideQuietMove(input({ kind: 'easy', id: 'qm-2' }));
    assert.equal(row?.kind, 'easy');
    assert.equal(row?.minutes, undefined);
    assert.equal(row?.distanceKm, undefined);
  });

  it('minutes-only and distance-only and both keep the numbers they were given', () => {
    assert.equal(decideQuietMove(input({ minutes: 25 }))?.minutes, 25);
    assert.equal(decideQuietMove(input({ distanceKm: '2.5' }))?.distanceKm, 2.5);
    const both = decideQuietMove(input({ minutes: '30', distanceKm: 4 }));
    assert.equal(both?.minutes, 30);
    assert.equal(both?.distanceKm, 4);
  });

  it('empty / 0 numbers omit the field — they do not invent 0', () => {
    const row = decideQuietMove(input({ minutes: '', distanceKm: 0 }));
    assert.ok(row);
    assert.equal('minutes' in row, false);
    assert.equal('distanceKm' in row, false);
    assert.doesNotMatch(JSON.stringify(row), /"minutes":0|"distanceKm":0/);
  });

  it('invalid kind / date / id invents nothing', () => {
    assert.equal(decideQuietMove(input({ kind: 'run' })), null);
    assert.equal(decideQuietMove(input({ kind: 'feed' })), null);
    assert.equal(decideQuietMove(input({ todayIso: '', date: '' })), null);
    assert.equal(decideQuietMove(input({ todayIso: '12 Aug' })), null);
    assert.equal(decideQuietMove(input({ id: '' })), null);
    assert.equal(decideQuietMove(input({ nowIso: '' })), null);
  });

  it('explicit date wins over today when it is a local key', () => {
    const row = decideQuietMove(input({ date: '2026-08-10' }));
    assert.equal(row?.date, '2026-08-10');
  });
});

describe('parseQuietMoveLog / append / list', () => {
  const walk: QuietMoveRow = {
    id: 'qm-1',
    date: TODAY,
    kind: 'walk',
    minutes: 20,
    createdAt: NOW,
  };

  it('drops junk and keeps a well-shaped row', () => {
    assert.deepEqual(parseQuietMoveLog(null), []);
    assert.deepEqual(parseQuietMoveLog('nope'), []);
    assert.deepEqual(
      parseQuietMoveLog([
        walk,
        { id: 'x', kind: 'run', date: TODAY, createdAt: NOW },
        { kind: 'walk', date: TODAY, createdAt: NOW },
      ]),
      [walk]
    );
  });

  it('append prepends; list by date ignores other days', () => {
    const easy: QuietMoveRow = {
      id: 'qm-2',
      date: '2026-08-11',
      kind: 'easy',
      createdAt: NOW,
    };
    const next = appendQuietMove([walk], easy);
    assert.equal(next[0]?.id, 'qm-2');
    assert.deepEqual(listQuietMoveForDate(next, TODAY).map((r) => r.id), ['qm-1']);
    assert.deepEqual(listQuietMoveForDate(next, 'not-a-date'), []);
  });
});

describe('quiet week strip stays empty', () => {
  it('a quiet Move row is not a Train Done day', () => {
    const glance = quietWeekGlance({
      history: [],
      now: new Date(2026, 7, 12, 15, 0, 0),
    });
    assert.equal(glance.days.every((d) => d.done === false), true);
    assert.doesNotMatch(JSON.stringify(glance), /walk|easy|move/i);
  });

  it('glance helper still only reads workout history', () => {
    const src = read('src/lib/today/quietWeekGlance.ts');
    assert.match(src, /CompletedWorkoutLog/);
    assert.doesNotMatch(src, /quietMove|activityLog|pillarWins/);
  });
});

describe('quiet Move helper stays a closed diary', () => {
  it('does not write Train, Track, wins, GPS, or a shop', () => {
    const src = read('src/lib/move/quietMove.ts');
    assert.match(src, /STORAGE_KEYS.quietMoveLog/);
    assert.doesNotMatch(src, /workoutHistory|activityLog|pillarWins|logPillarWin/);
    assert.doesNotMatch(src, /geolocation|getCurrentPosition|HealthKit|health.connect/i);
    assert.doesNotMatch(src, /discord\.com|place order|amazon\.com|wechat/i);
    assert.doesNotMatch(src, /workout-tracker-storage/);
  });
});
