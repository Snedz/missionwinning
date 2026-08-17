import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  isIanaTimeZone,
  zonedDateKey,
  zonedHour,
  zonedWeekKey,
} from '@/lib/leaderboard/athleteCalendar';

test('isIanaTimeZone accepts real zones and rejects junk', () => {
  assert.equal(isIanaTimeZone('America/New_York'), true);
  assert.equal(isIanaTimeZone('UTC'), true);
  assert.equal(isIanaTimeZone('Not/AZone'), false);
  assert.equal(isIanaTimeZone(''), false);
});

test('zonedDateKey and zonedWeekKey follow the athlete zone, not UTC', () => {
  // 2026-08-17 01:30 UTC is still Sunday evening in New York.
  const instant = new Date('2026-08-17T01:30:00.000Z');
  assert.equal(zonedDateKey(instant, 'UTC'), '2026-08-17');
  assert.equal(zonedDateKey(instant, 'America/New_York'), '2026-08-16');
  assert.equal(zonedWeekKey(instant, 'UTC'), '2026-08-17');
  assert.equal(zonedWeekKey(instant, 'America/New_York'), '2026-08-10');
});

test('zonedHour is the clock hour in the named zone', () => {
  const iso = '2026-08-17T02:15:00.000Z';
  assert.equal(zonedHour(iso, 'UTC'), 2);
  assert.equal(zonedHour(iso, 'America/New_York'), 22);
});
