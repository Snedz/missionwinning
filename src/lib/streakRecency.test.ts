/**
 * A streak that cannot go down is not a measurement.
 *
 * `.217` — two streak modules, one correct half each, and both read paths
 * overstating. The guards here split in two:
 *
 *   1. **the rule**, tested purely — `streakFromDates` and `isStreakLive` take
 *      "today" as an argument rather than fetching it, so every boundary is
 *      assertable without mocking the clock. `.212` is the standing reminder
 *      that a date bug hides comfortably inside a function that fetches its own
 *      now;
 *   2. **the consumers**, tested as reachability — the number is read four ways,
 *      and a fix that only reaches the chip on Today leaves the share card and
 *      the leaderboard lying.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { isStreakLive, streakFromDates } from '@/lib/streakRecency';
import { previousLocalDateKey } from '@/lib/time/localDate';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
}

/* ── previousLocalDateKey ────────────────────────────────────────────────── */

test('the previous day is a local-field operation', () => {
  assert.equal(previousLocalDateKey('2026-07-31'), '2026-07-30');
  assert.equal(previousLocalDateKey('2026-08-01'), '2026-07-31', 'month boundary');
  assert.equal(previousLocalDateKey('2026-01-01'), '2025-12-31', 'year boundary');
  assert.equal(previousLocalDateKey('2028-03-01'), '2028-02-29', 'leap year');
  assert.equal(previousLocalDateKey(''), '', 'garbage in, empty out — never a wrong date');
});

test('the previous day survives a DST spring-forward', () => {
  /*
   * The reason this is built from parts rather than `Date.parse(key)`. A bare
   * `YYYY-MM-DD` parses as **UTC midnight**, so in Berlin `new Date('2026-03-29')`
   * is 01:00 local on the very day the clocks jump — subtract 24h from that and
   * the answer can land back on the same date.
   */
  const prevTZ = process.env.TZ;
  try {
    process.env.TZ = 'Europe/Berlin';
    assert.equal(previousLocalDateKey('2026-03-29'), '2026-03-28');
    assert.equal(previousLocalDateKey('2026-03-30'), '2026-03-29');
    process.env.TZ = 'America/Santiago';
    assert.equal(previousLocalDateKey('2026-09-07'), '2026-09-06');
  } finally {
    process.env.TZ = prevTZ;
  }
});

/* ── The rule ────────────────────────────────────────────────────────────── */

test('live means today or yesterday, and nothing else', () => {
  assert.equal(isStreakLive('2026-07-31', '2026-07-31'), true, 'today');
  assert.equal(isStreakLive('2026-07-30', '2026-07-31'), true, 'yesterday');
  assert.equal(isStreakLive('2026-07-29', '2026-07-31'), false, 'two days ago');
  assert.equal(isStreakLive('2026-05-01', '2026-07-31'), false, 'three months ago');
  assert.equal(isStreakLive('', '2026-07-31'), false);
});

test('yesterday counts, because morning is not a broken streak', () => {
  // The only grace in the definition. Someone who trained last night and opens
  // the app at 07:00 has broken nothing — and a rule that punished them would
  // make the number depend on what time you looked at it.
  assert.equal(streakFromDates(['2026-07-29', '2026-07-30'], '2026-07-31'), 2);
});

test('a run that stopped is zero, not its old length', () => {
  /*
   * The defect, at its root. The old loop walked backwards from `dates[0]`
   * correctly — it simply never asked when `dates[0]` was. Five consecutive days
   * in May still read as "5-day streak" in August.
   */
  const may = ['2026-05-01', '2026-05-02', '2026-05-03', '2026-05-04', '2026-05-05'];
  assert.equal(streakFromDates(may, '2026-08-01'), 0);
  // Same data, asked on the right day, is still a real 5.
  assert.equal(streakFromDates(may, '2026-05-05'), 5);
});

test('order, duplicates and unparseable days do not change the count', () => {
  assert.equal(
    streakFromDates(['2026-07-29', '2026-07-31', '2026-07-30', '2026-07-31'], '2026-07-31'),
    3,
    'input arrives unsorted and duplicated straight from the history'
  );
  /*
   * `localDateKeyFromIso` returns '' for a timestamp it cannot parse. The walk
   * is safe from those by construction rather than by the `.filter(Boolean)`:
   * '' sorts before every real date, so after the reverse it is always last and
   * can only ever terminate the walk — which it would do anyway, never matching
   * an expected key. The filter stays as belt-and-braces; a mutant removing it
   * survives, and saying otherwise here would be a claim no test backs.
   */
  assert.equal(streakFromDates(['', '2026-07-31', '', '2026-07-30'], '2026-07-31'), 2);
  assert.equal(streakFromDates([], '2026-07-31'), 0);
  assert.equal(streakFromDates(['', ''], '2026-07-31'), 0);
});

test('the walk stops at the first gap and counts a run across a month boundary', () => {
  assert.equal(streakFromDates(['2026-07-28', '2026-07-30', '2026-07-31'], '2026-07-31'), 2);
  assert.equal(streakFromDates(['2026-07-31', '2026-08-01'], '2026-08-01'), 2);
});

/* ── The consumers ───────────────────────────────────────────────────────── */

/**
 * One number, read four ways. `.195`'s question — was it built, and can anyone
 * get to it? — asked of a fix rather than a feature: a decay that only reaches
 * the chip on Today leaves the share card and the leaderboard overstating.
 */
test('every consumer reads through the recency-checked reader', () => {
  const CONSUMERS: [string, string][] = [
    ['src/lib/weekRecap.ts', 'the shared debrief text and the share-card title'],
    ['src/lib/missionJourney.ts', 'the commissioning milestone (streak >= 7)'],
    ['src/lib/leaderboard/computeLocalStats.ts', 'computeWinScore and the public leaderboard'],
  ];

  for (const [file, why] of CONSUMERS) {
    const src = stripComments(read(file));
    assert.match(src, /getTrainingStreak\(/, `${file} must go through the shared reader — ${why}`);
    assert.doesNotMatch(
      src,
      /readRaw\(\s*STREAK_KEY|readRaw\(\s*STORAGE_KEYS\.streak\b/,
      `${file} must not read the raw override and bypass the decay — ${why}`
    );
  }
});

test('both streak readers apply the recency rule', () => {
  for (const file of ['src/lib/streaks.ts', 'src/lib/fuelStreak.ts']) {
    const src = stripComments(read(file));
    assert.match(
      src,
      /isStreakLive\(|streakFromDates\(/,
      `${file} must use the shared rule rather than its own idea of "consecutive"`
    );
  }

  /*
   * The specific shape that shipped: a bare parse of the stored number, returned
   * without ever consulting the date sitting in the next key.
   */
  const fuel = stripComments(read('src/lib/fuelStreak.ts'));
  const getter = fuel.slice(fuel.indexOf('export function getFuelLogStreak'));
  assert.match(
    getter.slice(0, getter.indexOf('\n}')),
    /fuelLastLogDate/,
    'the fuel reader must consult the date its own writer already records'
  );
});

test('the training writer counts days, not taps', () => {
  /*
   * `bumpTrainingStreak` had no same-day guard, so three pillar-win buttons in
   * one afternoon added +3 to a "day streak". `bumpFuelLogStreak` had guarded
   * this correctly all along — the correct writer was already in the repo, one
   * file over, and this streak just did not use it.
   */
  const src = stripComments(read('src/lib/streaks.ts'));
  const fn = src.slice(src.indexOf('export function bumpTrainingStreak'));
  const body = fn.slice(0, fn.indexOf('\n}'));
  assert.match(body, /last === today/, 'a second bump on the same day must be a no-op');
  assert.match(body, /streakLastBump/, 'and the day must be recorded, or nothing can check it');
});
