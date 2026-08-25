/**
 * Quiet week-strip rest-day row — one optional Fuel / Move / Track log.
 *
 * Injected dates so fixtures do not expire. Mutants: require Fuel/Move
 * numbers, save a blank Track, mark Train Done, score thin history,
 * accept a second row, invent checkout filler.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { quietWeekGlance } from './quietWeekGlance.ts';
import {
  appendQuietWeekRow,
  decideQuietWeekRow,
  parseQuietWeekRows,
  quietKindForDate,
  type QuietWeekRow,
  type QuietWeekRowInput,
} from './quietWeekRow.ts';
import type { CompletedWorkoutLog } from '@/types';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

const TODAY = '2026-08-12';
const NOW = '2026-08-12T15:00:00.000Z';
const GLANCE_NOW = new Date(2026, 7, 12, 15, 0, 0);

function input(partial: Partial<QuietWeekRowInput> = {}): QuietWeekRowInput {
  return {
    kind: 'fuel',
    todayIso: TODAY,
    nowIso: NOW,
    id: 'qr-1',
    ...partial,
  };
}

function trainLog(dayOffset: number): CompletedWorkoutLog {
  const d = new Date(2026, 7, 12 + dayOffset, 12, 0, 0);
  return {
    id: `l-${dayOffset}`,
    workoutName: 'Push',
    startedAt: d.toISOString(),
    completedAt: d.toISOString(),
    durationSeconds: 1800,
    totalVolume: 100,
    exercises: [{ exerciseId: 'push-ups', sets: [{ reps: 10, weight: 0 }] }],
  };
}

describe('decideQuietWeekRow', () => {
  it('Fuel kind-only is a valid rest-day row', () => {
    const row = decideQuietWeekRow(input());
    assert.deepEqual(row, {
      id: 'qr-1',
      date: TODAY,
      kind: 'fuel',
      createdAt: NOW,
    });
    assert.equal('fuelItem' in (row ?? {}), false);
  });

  it('Fuel keeps one typed item and drops checkout filler', () => {
    assert.equal(decideQuietWeekRow(input({ fuelItem: 'oats' }))?.fuelItem, 'oats');
    assert.equal('fuelItem' in (decideQuietWeekRow(input({ fuelItem: '' })) ?? {}), false);
    assert.equal('fuelItem' in (decideQuietWeekRow(input({ fuelItem: 'checkout' })) ?? {}), false);
    assert.equal('fuelItem' in (decideQuietWeekRow(input({ fuelItem: 'order now' })) ?? {}), false);
  });

  it('Move kind-only walk is valid; 0 / junk invent no number', () => {
    const row = decideQuietWeekRow(input({ kind: 'move', moveKind: 'walk' }));
    assert.equal(row?.kind, 'move');
    assert.equal(row?.moveKind, 'walk');
    assert.equal('minutes' in (row ?? {}), false);
    const empty = decideQuietWeekRow(
      input({ kind: 'move', moveKind: 'easy', minutes: '', distanceKm: 0 })
    );
    assert.equal(empty?.moveKind, 'easy');
    assert.equal('minutes' in (empty ?? {}), false);
    assert.equal('distanceKm' in (empty ?? {}), false);
    assert.equal(decideQuietWeekRow(input({ kind: 'move', moveKind: 'run' })), null);
  });

  it('Move keeps minutes or distance when they were given', () => {
    assert.equal(
      decideQuietWeekRow(input({ kind: 'move', minutes: 25 }))?.minutes,
      25
    );
    assert.equal(
      decideQuietWeekRow(input({ kind: 'move', distanceKm: '2.5' }))?.distanceKm,
      2.5
    );
  });

  it('Track weight or waist is enough; blank / 0 invent nothing', () => {
    assert.equal(decideQuietWeekRow(input({ kind: 'track', weightKg: 81.2 }))?.weightKg, 81.2);
    assert.equal(decideQuietWeekRow(input({ kind: 'track', waistCm: 84 }))?.waistCm, 84);
    assert.equal(decideQuietWeekRow(input({ kind: 'track' })), null);
    assert.equal(decideQuietWeekRow(input({ kind: 'track', weightKg: '' })), null);
    assert.equal(decideQuietWeekRow(input({ kind: 'track', weightKg: 0 })), null);
    assert.equal(decideQuietWeekRow(input({ kind: 'track', waistCm: 'nope' })), null);
  });

  it('Train done day and a second row that day invent nothing', () => {
    const first: QuietWeekRow = {
      id: 'qr-1',
      date: TODAY,
      kind: 'fuel',
      createdAt: NOW,
    };
    assert.equal(decideQuietWeekRow(input({ done: true })), null);
    assert.equal(decideQuietWeekRow(input({ kind: 'move', existing: [first] })), null);
  });

  it('invalid kind / date / id invents nothing', () => {
    assert.equal(decideQuietWeekRow(input({ kind: 'mind' })), null);
    assert.equal(decideQuietWeekRow(input({ kind: 'learn' })), null);
    assert.equal(decideQuietWeekRow(input({ todayIso: '', date: '' })), null);
    assert.equal(decideQuietWeekRow(input({ todayIso: '12 Aug' })), null);
    assert.equal(decideQuietWeekRow(input({ id: '' })), null);
    assert.equal(decideQuietWeekRow(input({ nowIso: '' })), null);
  });
});

describe('parse / append / list', () => {
  const fuel: QuietWeekRow = {
    id: 'qr-1',
    date: TODAY,
    kind: 'fuel',
    createdAt: NOW,
  };

  it('drops junk and keeps a well-shaped row', () => {
    assert.deepEqual(parseQuietWeekRows(null), []);
    assert.deepEqual(parseQuietWeekRows('nope'), []);
    assert.deepEqual(
      parseQuietWeekRows([
        fuel,
        { id: 'x', kind: 'mind', date: TODAY, createdAt: NOW },
        { kind: 'fuel', date: TODAY, createdAt: NOW },
      ]),
      [fuel]
    );
  });

  it('append refuses a second row on the same date', () => {
    const move: QuietWeekRow = {
      id: 'qr-2',
      date: TODAY,
      kind: 'move',
      moveKind: 'walk',
      createdAt: NOW,
    };
    const next = appendQuietWeekRow([fuel], move);
    assert.equal(next.length, 1);
    assert.equal(quietKindForDate(next, TODAY), 'fuel');
    assert.equal(quietKindForDate(next, '2026-08-10'), undefined);
  });
});

describe('quiet week glance + quiet row', () => {
  it('a quiet row does not mark Train Done and does not score thin history', () => {
    const rows: QuietWeekRow[] = [
      { id: 'qr-1', date: '2026-08-13', kind: 'fuel', createdAt: NOW },
    ];
    const glance = quietWeekGlance({
      history: [trainLog(-2), trainLog(-1)],
      quietRows: rows,
      now: GLANCE_NOW,
    });
    assert.equal(glance.thin, true);
    assert.equal(glance.days[0]?.done, true);
    assert.equal(glance.days[1]?.done, true);
    assert.equal(glance.days[3]?.done, false);
    assert.equal(glance.days[3]?.quiet, 'fuel');
    assert.equal('quiet' in (glance.days[2] ?? {}), false);
    assert.equal('streak' in glance, false);
    assert.equal('onTrack' in glance, false);
    assert.equal('consistency' in glance, false);
    for (const day of glance.days) {
      assert.equal('missed' in day, false);
    }
  });

  it('Train Done wins — quiet is not painted on a logged session day', () => {
    const glance = quietWeekGlance({
      history: [trainLog(0)],
      quietRows: [{ id: 'qr-1', date: TODAY, kind: 'track', createdAt: NOW, weightKg: 80 }],
      now: GLANCE_NOW,
    });
    assert.equal(glance.days[2]?.done, true);
    assert.equal('quiet' in (glance.days[2] ?? {}), false);
  });
});

describe('quiet week row source', () => {
  it('does not write Train history, activity feed, wins, GPS, or a shop', () => {
    const src = read('src/lib/today/quietWeekRow.ts');
    assert.match(src, /STORAGE_KEYS.quietWeekRows/);
    assert.doesNotMatch(src, /workoutHistory|workout-tracker-storage|activityLog|pillarWins|logPillarWin/);
    assert.doesNotMatch(src, /geolocation|getCurrentPosition|HealthKit|health.connect/i);
    assert.doesNotMatch(src, /discord\.com|amazon\.com|wechat|whole foods|gp\/cart/i);
    assert.doesNotMatch(src, /generateWeek|from ['"]@\/lib\/coach/);
  });

  it('Today lean stays one Start — no pillar card, no six-pillar dock', () => {
    const lean = read('src/page-components/HomeTodayLean.tsx');
    const strip = read('src/components/today/TodayQuietWeekStrip.tsx');
    assert.match(lean, /dock="start"/);
    assert.match(lean, /TodayQuietWeekStrip/);
    assert.doesNotMatch(lean, /FuelRestockCard|QuietMoveLogCard|BodyMetricsCard/);
    assert.doesNotMatch(lean, /primary-action/);
    assert.doesNotMatch(strip, /primary-action|bg-primary-fill|bg-accent-poster/);
    assert.doesNotMatch(strip, /Mind|Learn|WeChat|six-pillar|Top 8|Feed|discord\.com/i);
    assert.doesNotMatch(strip, /✕|✗|&times;|Missed|line-through|todayDayStreak/);
    assert.match(strip, /data-testid="today-quiet-week"/);
    assert.match(strip, /data-testid="quiet-week-offer"/);
    assert.match(strip, /data-testid="quiet-week-log"/);
  });
});
