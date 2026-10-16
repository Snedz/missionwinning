import { test } from 'node:test';
import assert from 'node:assert/strict';
import { feedDisplay, type FeedReading } from './feedDisplay.ts';

test('null reading → no_feed, label NO FEED, value null, dimmed true', () => {
  const result = feedDisplay(null, Date.now(), 60000);
  assert.strictEqual(result.state, 'no_feed');
  assert.strictEqual(result.label, 'NO FEED');
  assert.strictEqual(result.value, null);
  assert.strictEqual(result.dimmed, true);
});

test('reading with value: null → no_feed (no invented number)', () => {
  const reading: FeedReading = { value: null, source: 'garmin', observedAt: new Date().toISOString() };
  const result = feedDisplay(reading, Date.now(), 60000);
  assert.strictEqual(result.state, 'no_feed');
  assert.strictEqual(result.label, 'NO FEED');
  assert.strictEqual(result.value, null);
  assert.strictEqual(result.dimmed, true);
});

test('reading older than maxAgeMs → stale, label STALE, dimmed, value kept', () => {
  const oldTime = Date.now() - 120000; // 2 minutes ago
  const reading: FeedReading = {
    value: 150,
    source: 'garmin',
    observedAt: new Date(oldTime).toISOString(),
  };
  const result = feedDisplay(reading, Date.now(), 60000); // 1 minute maxAge
  assert.strictEqual(result.state, 'stale');
  assert.strictEqual(result.label, 'STALE');
  assert.strictEqual(result.dimmed, true);
  assert.strictEqual(result.value, 150);
});

test('fresh reading, loggedValue differs → disagrees, label DIFFERS FROM LOG, dimmed', () => {
  const reading: FeedReading = {
    value: 150,
    source: 'garmin',
    observedAt: new Date().toISOString(),
  };
  const result = feedDisplay(reading, Date.now(), 60000, 145);
  assert.strictEqual(result.state, 'disagrees');
  assert.strictEqual(result.label, 'DIFFERS FROM LOG');
  assert.strictEqual(result.dimmed, true);
  assert.strictEqual(result.value, 150);
});

test('fresh reading, loggedValue equal → live, label null, dimmed false', () => {
  const reading: FeedReading = {
    value: 150,
    source: 'garmin',
    observedAt: new Date().toISOString(),
  };
  const result = feedDisplay(reading, Date.now(), 60000, 150);
  assert.strictEqual(result.state, 'live');
  assert.strictEqual(result.label, null);
  assert.strictEqual(result.dimmed, false);
  assert.strictEqual(result.value, 150);
});

test('fresh reading, loggedValue null → live, label null, dimmed false', () => {
  const reading: FeedReading = {
    value: 150,
    source: 'garmin',
    observedAt: new Date().toISOString(),
  };
  const result = feedDisplay(reading, Date.now(), 60000, null);
  assert.strictEqual(result.state, 'live');
  assert.strictEqual(result.label, null);
  assert.strictEqual(result.dimmed, false);
  assert.strictEqual(result.value, 150);
});

test('invalid observedAt string → no_feed', () => {
  const reading: FeedReading = {
    value: 150,
    source: 'garmin',
    observedAt: 'not-a-date',
  };
  const result = feedDisplay(reading, Date.now(), 60000);
  assert.strictEqual(result.state, 'no_feed');
  assert.strictEqual(result.label, 'NO FEED');
  assert.strictEqual(result.value, null);
  assert.strictEqual(result.dimmed, true);
});
