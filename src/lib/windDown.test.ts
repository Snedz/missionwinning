import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ASK_INTERVAL_DAYS,
  WIND_DOWN_END_HOUR,
  WIND_DOWN_START_HOUR,
  isSameLocalDay,
  localHourFor,
  mayOfferWindDown,
  windDownDue,
  type WindDownRow,
} from '@/lib/windDown';

/** London, 20:30 local on a summer evening (BST = UTC+1). */
const EVENING = new Date('2026-07-29T19:30:00Z');

function row(over: Partial<WindDownRow> = {}): WindDownRow {
  return {
    lastSessionAt: '2026-07-29T17:00:00Z',
    lastSessionHigh: true,
    lastWindDownAt: null,
    timeZone: 'Europe/London',
    ...over,
  };
}

test('local hour is the athlete\'s, not the server\'s', () => {
  assert.equal(localHourFor(EVENING, 'Europe/London'), 20, 'BST is UTC+1');
  assert.equal(localHourFor(EVENING, 'UTC'), 19);
  assert.equal(localHourFor(EVENING, 'America/New_York'), 15, 'EDT is UTC-4');
  assert.equal(localHourFor(EVENING, 'Australia/Sydney'), 5, 'already tomorrow morning');
});

test('an unusable time zone yields null rather than a guess', () => {
  assert.equal(localHourFor(EVENING, 'Not/AZone'), null);
  assert.equal(localHourFor(EVENING, ''), null);
});

test('the happy path: hard session today, evening, never sent', () => {
  assert.equal(windDownDue(row(), EVENING), true);
});

test('no time zone means no push — silence beats a 3am notification', () => {
  assert.equal(windDownDue(row({ timeZone: null }), EVENING), false);
  assert.equal(windDownDue(row({ timeZone: 'Not/AZone' }), EVENING), false);
});

test('a steady session is not a wind-down', () => {
  assert.equal(windDownDue(row({ lastSessionHigh: false }), EVENING), false);
});

test('yesterday\'s hard session is not tonight\'s story', () => {
  assert.equal(windDownDue(row({ lastSessionAt: '2026-07-28T17:00:00Z' }), EVENING), false);
});

test('the window is closed before 19:00 and from 22:00 local', () => {
  const tz = 'UTC';
  const at = (h: number) => new Date(`2026-07-29T${String(h).padStart(2, '0')}:30:00Z`);
  const r = row({ timeZone: tz, lastSessionAt: '2026-07-29T12:00:00Z' });

  assert.equal(windDownDue(r, at(WIND_DOWN_START_HOUR - 1)), false, '18:30 is too early');
  assert.equal(windDownDue(r, at(WIND_DOWN_START_HOUR)), true, '19:30 is in');
  assert.equal(windDownDue(r, at(WIND_DOWN_END_HOUR - 1)), true, '21:30 is the last hour');
  assert.equal(windDownDue(r, at(WIND_DOWN_END_HOUR)), false, '22:30 is past it');
  assert.equal(windDownDue(r, at(2)), false, 'never after midnight');
});

test('a session finished at 23:30 gets no push, not a delayed one', () => {
  const r = row({ timeZone: 'UTC', lastSessionAt: '2026-07-29T23:30:00Z' });
  assert.equal(windDownDue(r, new Date('2026-07-29T23:45:00Z')), false);
});

/** The marker comparison is the whole idempotency mechanism. */
test('once sent, later runs that evening skip', () => {
  const sent = row({ lastWindDownAt: '2026-07-29T19:05:00Z' });
  assert.equal(windDownDue(sent, EVENING), false, 'marker is newer than the session');
});

test('a new hard session re-arms it without any expiry job', () => {
  const r = row({
    lastWindDownAt: '2026-07-28T19:05:00Z', // yesterday's send
    lastSessionAt: '2026-07-29T17:00:00Z', // today's session
  });
  assert.equal(windDownDue(r, EVENING), true);
});

test('DST does not shift the window', () => {
  // 2026-03-29 is the UK spring-forward. 20:30 local = 19:30 UTC either side.
  const beforeDst = new Date('2026-03-28T20:30:00Z'); // GMT: 20:30 local
  const afterDst = new Date('2026-03-29T19:30:00Z'); // BST: 20:30 local
  assert.equal(localHourFor(beforeDst, 'Europe/London'), 20);
  assert.equal(localHourFor(afterDst, 'Europe/London'), 20);
});

test('same-local-day is judged in the athlete\'s zone, not UTC', () => {
  // The case where the two answers differ, which is the only case worth asserting:
  //   session 22:00Z = Jul 29, 18:00 in New York
  //   check    03:30Z = Jul 30 in UTC, but still Jul 29, 23:30 in New York
  // A UTC comparison would call this "yesterday's session" and stay silent on an
  // athlete who trained five hours ago.
  const session = new Date('2026-07-29T22:00:00Z');
  const check = new Date('2026-07-30T03:30:00Z');

  assert.equal(isSameLocalDay(session, check, 'America/New_York'), true, 'same evening for them');
  assert.equal(isSameLocalDay(session, check, 'UTC'), false, 'and UTC would disagree');
});

test('garbage timestamps are refused, not coerced', () => {
  assert.equal(windDownDue(row({ lastSessionAt: 'nonsense' }), EVENING), false);
  assert.equal(windDownDue(row({ lastSessionAt: null }), EVENING), false);
});

test('the opt-in is offered to a device that has never been asked', () => {
  assert.equal(mayOfferWindDown(null, Date.parse('2026-07-29T19:30:00Z')), true);
});

test('a decline is respected for a fortnight, then the offer may return', () => {
  const asked = Date.parse('2026-07-01T12:00:00Z');
  const day = 86_400_000;
  assert.equal(mayOfferWindDown(String(asked), asked + 13 * day), false, 'day 13: still nagging');
  assert.equal(mayOfferWindDown(String(asked), asked + ASK_INTERVAL_DAYS * day), true, 'day 14: a new moment');
});

test('an unreadable marker asks rather than falls silent forever', () => {
  // The failure direction matters. Treating garbage as "asked recently" would exclude
  // a device with broken storage from ever being offered notifications again, and
  // nothing would ever report it. Offering once too often is the recoverable error.
  const now = Date.parse('2026-07-29T19:30:00Z');
  assert.equal(mayOfferWindDown('not-a-number', now), true);
  assert.equal(mayOfferWindDown('', now), true);
});
