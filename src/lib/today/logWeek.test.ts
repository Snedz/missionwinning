import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildLogWeek } from '@/lib/today/logWeek';
import { localDateKey, startOfLocalWeek } from '@/lib/time/localDate';

/** Fixtures derive from the injected clock — never from date literals. */
const none = new Set<string>();

function dayKeyOffset(from: Date, days: number): string {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return localDateKey(d);
}

describe('buildLogWeek', () => {
  it('returns exactly seven Monday-first days', () => {
    const now = new Date();
    const week = buildLogWeek({ trainedKeys: none, loggedKeys: none }, now);
    assert.equal(week.length, 7);
    const monday = startOfLocalWeek(now);
    for (let i = 0; i < 7; i++) {
      assert.equal(week[i].dateKey, dayKeyOffset(monday, i));
      assert.equal(week[i].weekdayIndex, i);
    }
  });

  it('flags exactly one cell as today', () => {
    const now = new Date();
    const week = buildLogWeek({ trainedKeys: none, loggedKeys: none }, now);
    const todays = week.filter((d) => d.isToday);
    assert.equal(todays.length, 1);
    assert.equal(todays[0].dateKey, localDateKey(now));
  });

  it('marks trained over logged when a day is in both sets', () => {
    const now = new Date();
    const todayKey = localDateKey(now);
    const week = buildLogWeek(
      { trainedKeys: new Set([todayKey]), loggedKeys: new Set([todayKey]) },
      now
    );
    assert.equal(week.find((d) => d.isToday)?.mark, 'trained');
  });

  it('marks logged days that have no session', () => {
    // Anchor on the week's Monday so the probed day is never in the future.
    const monday = startOfLocalWeek(new Date());
    const mondayKey = localDateKey(monday);
    const week = buildLogWeek({ trainedKeys: none, loggedKeys: new Set([mondayKey]) }, monday);
    assert.equal(week[0].mark, 'logged');
  });

  it('forces future days to none, whatever the sets claim', () => {
    // With "now" pinned to Monday, days 1–6 are all in the future.
    const monday = startOfLocalWeek(new Date());
    const futureKeys = Array.from({ length: 6 }, (_, i) => dayKeyOffset(monday, i + 1));
    const week = buildLogWeek(
      { trainedKeys: new Set(futureKeys), loggedKeys: new Set(futureKeys) },
      monday
    );
    for (let i = 1; i < 7; i++) {
      assert.equal(week[i].isFuture, true);
      assert.equal(week[i].mark, 'none', `future day ${i} must claim nothing`);
    }
    assert.equal(week[0].isFuture, false);
  });

  it('never produces a missed mark', () => {
    const monday = startOfLocalWeek(new Date());
    const week = buildLogWeek({ trainedKeys: none, loggedKeys: none }, monday);
    for (const day of week) {
      assert.ok(['trained', 'logged', 'none'].includes(day.mark));
    }
  });
});
