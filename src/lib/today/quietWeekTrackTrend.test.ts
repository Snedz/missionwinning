/**
 * Quiet last-vs-this on a week-strip Track day.
 *
 * Injected dates so fixtures do not expire. Mutants: invent a last
 * from one row, prefer body fat, paint a shame slope, reuse delta().
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { BodyMetricEntry } from '@/lib/bodyMetrics.ts';
import { quietWeekGlance } from './quietWeekGlance.ts';
import {
  decideQuietWeekTrackTrend,
  formatQuietWeekTrackTrend,
  trackQuietDateKeys,
} from './quietWeekTrackTrend.ts';
import type { CompletedWorkoutLog } from '@/types';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

const DAY_LAST = '2026-08-05';
const DAY_THIS = '2026-08-13';
const DAY_MID = '2026-08-10';
const GLANCE_NOW = new Date(2026, 7, 12, 15, 0, 0);

function row(date: string, extra: Partial<BodyMetricEntry> = {}): BodyMetricEntry {
  return { date, ...extra };
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

describe('decideQuietWeekTrackTrend', () => {
  it('zero / one / date-only invents nothing', () => {
    assert.equal(decideQuietWeekTrackTrend({ entries: [], date: DAY_THIS }), null);
    assert.equal(
      decideQuietWeekTrackTrend({ entries: [row(DAY_THIS, { weightKg: 81 })], date: DAY_THIS }),
      null
    );
    assert.equal(
      decideQuietWeekTrackTrend({
        entries: [row(DAY_LAST), row(DAY_THIS, { weightKg: 80 })],
        date: DAY_THIS,
      }),
      null
    );
  });

  it('two weights are last → this on the later date only', () => {
    const entries = [row(DAY_THIS, { weightKg: 80 }), row(DAY_LAST, { weightKg: 81 })];
    assert.deepEqual(decideQuietWeekTrackTrend({ entries, date: DAY_THIS }), {
      date: DAY_THIS,
      metric: 'weightKg',
      last: 81,
      thisValue: 80,
    });
    assert.equal(decideQuietWeekTrackTrend({ entries, date: DAY_LAST }), null);
  });

  it('two waists with no weight use tape', () => {
    const trend = decideQuietWeekTrackTrend({
      entries: [row(DAY_THIS, { waistCm: 83 }), row(DAY_LAST, { waistCm: 84 })],
      date: DAY_THIS,
    });
    assert.deepEqual(trend, {
      date: DAY_THIS,
      metric: 'waistCm',
      last: 84,
      thisValue: 83,
    });
  });

  it('this weight + last waist only is no overlap', () => {
    assert.equal(
      decideQuietWeekTrackTrend({
        entries: [row(DAY_THIS, { weightKg: 80 }), row(DAY_LAST, { waistCm: 84 })],
        date: DAY_THIS,
      }),
      null
    );
  });

  it('prefers weight when both days have it, and walks back past a non-overlap', () => {
    const both = decideQuietWeekTrackTrend({
      entries: [
        row(DAY_THIS, { weightKg: 80, waistCm: 83 }),
        row(DAY_LAST, { weightKg: 81, waistCm: 84 }),
      ],
      date: DAY_THIS,
    });
    assert.equal(both?.metric, 'weightKg');
    assert.equal(both?.last, 81);
    const walked = decideQuietWeekTrackTrend({
      entries: [
        row(DAY_THIS, { weightKg: 80 }),
        row(DAY_MID, { waistCm: 84 }),
        row(DAY_LAST, { weightKg: 81 }),
      ],
      date: DAY_THIS,
    });
    assert.deepEqual(walked, {
      date: DAY_THIS,
      metric: 'weightKg',
      last: 81,
      thisValue: 80,
    });
  });

  it('two body-fat rows are not tape and invent nothing', () => {
    assert.equal(
      decideQuietWeekTrackTrend({
        entries: [row(DAY_THIS, { bodyFatPct: 14 }), row(DAY_LAST, { bodyFatPct: 15 })],
        date: DAY_THIS,
      }),
      null
    );
  });

  it('flat two-log is honest; 0 / junk / bad date invent nothing', () => {
    const flat = decideQuietWeekTrackTrend({
      entries: [row(DAY_THIS, { weightKg: 81 }), row(DAY_LAST, { weightKg: 81 })],
      date: DAY_THIS,
    });
    assert.equal(flat?.last, 81);
    assert.equal(flat?.thisValue, 81);
    assert.equal(
      decideQuietWeekTrackTrend({
        entries: [row(DAY_THIS, { weightKg: 0 }), row(DAY_LAST, { weightKg: 81 })],
        date: DAY_THIS,
      }),
      null
    );
    assert.equal(decideQuietWeekTrackTrend({ entries: [row(DAY_THIS, { weightKg: 80 })], date: '' }), null);
    assert.equal(
      decideQuietWeekTrackTrend({ entries: [row(DAY_THIS, { weightKg: 80 })], date: '13 Aug' }),
      null
    );
  });

  it('format is muted last → this; imperial converts weight only', () => {
    const trend = {
      date: DAY_THIS,
      metric: 'weightKg' as const,
      last: 80,
      thisValue: 79,
    };
    assert.equal(formatQuietWeekTrackTrend(trend, 'metric'), '80 → 79');
    assert.equal(formatQuietWeekTrackTrend(trend, 'imperial'), '176.4 → 174.2');
    assert.equal(
      formatQuietWeekTrackTrend({ date: DAY_THIS, metric: 'waistCm', last: 84, thisValue: 83 }),
      '84 → 83'
    );
    assert.doesNotMatch(formatQuietWeekTrackTrend(trend), /lost|gained|↓|↑|%/);
  });
});

describe('trackQuietDateKeys', () => {
  it('keeps dates with a logged number and drops date-only', () => {
    const keys = trackQuietDateKeys([
      row(DAY_THIS, { weightKg: 80 }),
      row(DAY_LAST),
      row('nope', { waistCm: 84 }),
    ]);
    assert.equal(keys.has(DAY_THIS), true);
    assert.equal(keys.has(DAY_LAST), false);
  });
});

describe('glance folds diary last-vs-this', () => {
  it('diary-only rest day paints Scale; two weights attach trend on the later day', () => {
    const glance = quietWeekGlance({
      history: [],
      trackEntries: [row('2026-08-13', { weightKg: 80 }), row('2026-08-05', { weightKg: 81 })],
      now: GLANCE_NOW,
    });
    assert.equal(glance.days[3]?.dateKey, '2026-08-13');
    assert.equal(glance.days[3]?.quiet, 'track');
    assert.deepEqual(glance.days[3]?.trackTrend, {
      date: '2026-08-13',
      metric: 'weightKg',
      last: 81,
      thisValue: 80,
    });
    assert.equal('trackTrend' in (glance.days[0] ?? {}), false);
    assert.equal(glance.thin, true);
  });

  it('Train Done swallows quiet + trend; Fuel that day swallows trend', () => {
    const done = quietWeekGlance({
      history: [trainLog(1)],
      trackEntries: [row('2026-08-13', { weightKg: 80 }), row('2026-08-05', { weightKg: 81 })],
      now: GLANCE_NOW,
    });
    assert.equal(done.days[3]?.done, true);
    assert.equal('quiet' in (done.days[3] ?? {}), false);
    assert.equal('trackTrend' in (done.days[3] ?? {}), false);

    const fuel = quietWeekGlance({
      history: [],
      quietRows: [{ id: 'qr-1', date: '2026-08-13', kind: 'fuel', createdAt: '2026-08-13T12:00:00.000Z' }],
      trackEntries: [row('2026-08-13', { weightKg: 80 }), row('2026-08-05', { weightKg: 81 })],
      now: GLANCE_NOW,
    });
    assert.equal(fuel.days[3]?.quiet, 'fuel');
    assert.equal('trackTrend' in (fuel.days[3] ?? {}), false);
  });

  it('one diary log paints Scale without a trend; empty days keep four keys', () => {
    const glance = quietWeekGlance({
      history: [trainLog(-2), trainLog(-1)],
      trackEntries: [row('2026-08-13', { weightKg: 80 })],
      now: GLANCE_NOW,
    });
    assert.equal(glance.thin, true);
    assert.equal(glance.days[3]?.quiet, 'track');
    assert.equal('trackTrend' in (glance.days[3] ?? {}), false);
    assert.equal('streak' in glance, false);
    assert.equal('onTrack' in glance, false);
    assert.equal('consistency' in glance, false);
    const empty = glance.days[2];
    assert.deepEqual(Object.keys(empty ?? {}).sort(), ['dateKey', 'done', 'isToday', 'offset']);
  });
});

describe('quiet week track trend source', () => {
  it('does not reuse delta(), Date.now, shame, Health, or a shop', () => {
    const src = read('src/lib/today/quietWeekTrackTrend.ts');
    assert.match(src, /entryHasLoggedNumber/);
    assert.doesNotMatch(src, /\bdelta\s*\(/);
    assert.doesNotMatch(src, /Date\.now|toISOString\(/);
    assert.doesNotMatch(src, /lost|gained|strain|recovery/i);
    assert.doesNotMatch(src, /shame slope|body photo/i);
    assert.doesNotMatch(src, /recharts|Sparkline|ScoreNumeral|ProgressPhotos/);
    assert.doesNotMatch(src, /HealthKit|health\.connect|getCurrentPosition/i);
    assert.doesNotMatch(src, /discord\.com|wechat|marketplace/i);
    assert.doesNotMatch(src, /from ['"]@\/lib\/(premium|rewards|coach)/);
  });

  it('strip paints last-vs-this — no sparkline, no card, no second Start', () => {
    const strip = read('src/components/today/TodayQuietWeekStrip.tsx');
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.match(strip, /data-testid="quiet-week-track-trend"/);
    assert.match(strip, /formatQuietWeekTrackTrend|trackTrend/);
    assert.doesNotMatch(strip, /Sparkline|recharts|LineChart|BodyMetricsCard|ProgressPhotos/);
    assert.doesNotMatch(strip, /primary-action|bg-primary-fill|ScoreNumeral/);
    assert.doesNotMatch(strip, /lost|gained|Health permission|Allow Health/i);
    assert.doesNotMatch(strip, /Mind|Learn|WeChat|six-pillar|Top 8|Feed|discord\.com/i);
    assert.match(lean, /dock="start"/);
    assert.match(lean, /loadBodyMetrics/);
    assert.match(lean, /trackEntries/);
    assert.doesNotMatch(lean, /BodyMetricsCard|QuietMoveLogCard|FuelRestockCard/);
    assert.doesNotMatch(lean, /primary-action/);
  });
});
