import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSubscriptionRow } from '@/lib/pushSubscriptionRow';

const identity = {
  userId: null,
  deviceId: 'dev-1',
  endpoint: 'https://push.example/abc',
  p256dh: 'key',
  auth: 'auth',
};

test('a device that says nothing about cadence writes no cadence columns', () => {
  const row = buildSubscriptionRow(identity);
  // The bug this replaces: `?? null` turned "I did not mention it" into "set it to
  // NULL", so a Profile mount on a device with empty local history erased the
  // athlete's real last_session_at and their comeback nudge stopped firing.
  assert.equal('last_session_at' in row, false);
  assert.equal('days_per_week' in row, false);
  assert.equal('time_zone' in row, false);
  assert.equal('last_session_high' in row, false);
});

test('identity columns are always written, including a null user', () => {
  const row = buildSubscriptionRow(identity);
  assert.equal(row.user_id, null);
  assert.equal(row.device_id, 'dev-1');
  assert.equal(row.endpoint, 'https://push.example/abc');
});

test('a partial sync updates only what it sent', () => {
  const row = buildSubscriptionRow({ ...identity, timeZone: 'Europe/London' });
  assert.equal(row.time_zone, 'Europe/London');
  assert.equal('last_session_at' in row, false);
});

test('false and zero survive — they are values, not absence', () => {
  // `lastSessionHigh: false` is how a steady session disarms the wind-down. If an
  // emptiness check ever replaces the `!== undefined` test, the bit would stick on
  // `true` forever and every evening would look hot.
  const row = buildSubscriptionRow({ ...identity, lastSessionHigh: false, daysPerWeek: 0 });
  assert.equal(row.last_session_high, false);
  assert.equal(row.days_per_week, 0);
});

test('the post-session twofer writes the timestamp and the bit together', () => {
  const row = buildSubscriptionRow({
    ...identity,
    userId: 'u1',
    lastSessionAt: '2026-07-29T18:00:00.000Z',
    lastSessionHigh: true,
  });
  assert.equal(row.last_session_at, '2026-07-29T18:00:00.000Z');
  assert.equal(row.last_session_high, true);
});

/**
 * `.194` — the privacy contract, asserted as a column allowlist.
 *
 * The row may carry timestamps, a cadence integer, an IANA zone and one-bit
 * results of device-side computation. It may never carry a behavior count, a
 * sleep figure, a session load or any part of a review. The 20260730 migration
 * already refused a three-value load zone on that reasoning; anything from the
 * behavior journal is categorically worse.
 */
test('the row can only ever contain allowlisted columns', () => {
  const row = buildSubscriptionRow({
    userId: null,
    deviceId: 'dev-1',
    endpoint: 'https://push.example/abc',
    p256dh: 'key',
    auth: 'auth',
    lastSessionAt: '2026-07-30T18:00:00.000Z',
    daysPerWeek: 4,
    timeZone: 'America/New_York',
    lastSessionHigh: true,
    dayReviewHour: 20,
  });
  const allowed = new Set([
    'user_id',
    'device_id',
    'endpoint',
    'p256dh',
    'auth',
    'last_session_at',
    'days_per_week',
    'time_zone',
    'last_session_high',
    'day_review_hour',
  ]);
  for (const key of Object.keys(row)) {
    assert.ok(allowed.has(key), `unallowlisted column reached the push row: ${key}`);
  }
});

test('no behavior-shaped field can be serialized onto the row', () => {
  const row = buildSubscriptionRow({
    userId: null,
    deviceId: 'dev-1',
    endpoint: 'https://push.example/abc',
    p256dh: 'key',
    auth: 'auth',
    dayReviewHour: 20,
    // Fields a future careless caller might try to pass through.
    ...({
      caffeineServings: 4,
      bedTime: '23:00',
      alcoholServings: 2,
      sleepDebtMinutes: 127,
      reviewText: 'four days under your strain floor',
    } as Record<string, unknown>),
  });
  const serialized = JSON.stringify(row);
  for (const leak of ['caffeine', 'bedTime', 'alcohol', 'sleepDebt', 'strain floor', '127']) {
    assert.ok(!serialized.includes(leak), `behavior data leaked to the server: ${leak}`);
  }
});
