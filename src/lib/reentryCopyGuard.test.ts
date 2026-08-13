/**
 * Re-entry athlete copy must stay shame-free (Horizon W criterion 4 / S7).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { formatReentryQuietLine } from '@/lib/reentry';

const FORBIDDEN = [
  /you missed/i,
  /broken streak/i,
  /failed/i,
  /guilt/i,
  /lazy/i,
  /you quit/i,
  /most people quit/i,
];

test('TodayReentryCard defaults stay shame-free', () => {
  const src = readFileSync(
    join(import.meta.dirname, '..', 'components', 'today', 'TodayReentryCard.tsx'),
    'utf8'
  );
  const defaults = [...src.matchAll(/defaultValue:\s*['`]([^'`]+)['`]/g)].map((m) => m[1]);
  assert.ok(defaults.length >= 1, 'expected reentry default copy');
  for (const d of defaults) {
    for (const re of FORBIDDEN) {
      assert.doesNotMatch(d, re, `reentry copy: ${d}`);
    }
  }
});

test('the two-day working line is the S7 sentence', () => {
  const line = formatReentryQuietLine({ daysSince: 2, tone: 'gap' });
  assert.equal(line, "Two days off. Here's the 20-minute version.");
  for (const re of FORBIDDEN) {
    assert.doesNotMatch(line, re, line);
  }
});

test('TodayReentryCard is a quiet line, not a streak card', () => {
  const src = readFileSync(
    join(import.meta.dirname, '..', 'components', 'today', 'TodayReentryCard.tsx'),
    'utf8'
  );
  assert.match(src, /role="status"/);
  assert.doesNotMatch(src, /border-2/);
  assert.doesNotMatch(src, /todayReentryEyebrow/);
});

test('the quiet line is not an outbound nudge', () => {
  const src = readFileSync(join(import.meta.dirname, 'nudgeCopy.ts'), 'utf8');
  assert.doesNotMatch(src, /formatReentryQuietLine/);
  assert.doesNotMatch(src, /20-minute version/);
  assert.doesNotMatch(src, /days off/);
});
