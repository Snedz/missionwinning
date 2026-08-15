/**
 * Re-entry athlete copy must stay shame-free (Horizon W criterion 4 / S7).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { formatReentryQuietLine, computeReentry } from '@/lib/reentry';
import type { CompletedWorkoutLog } from '@/types';

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
  assert.doesNotMatch(src, /line-clamp/);
  assert.doesNotMatch(src, /streak/i);
});

test('the quiet line is not an outbound nudge', () => {
  const src = readFileSync(join(import.meta.dirname, 'nudgeCopy.ts'), 'utf8');
  assert.doesNotMatch(src, /formatReentryQuietLine/);
  assert.doesNotMatch(src, /20-minute version/);
  assert.doesNotMatch(src, /days off/);
});

function logDaysAgo(days: number): CompletedWorkoutLog {
  const now = Date.UTC(2026, 6, 22, 12, 0, 0);
  const then = now - days * 86_400_000;
  return {
    id: `r-${days}`,
    workoutName: 'S',
    startedAt: new Date(then - 3_600_000).toISOString(),
    completedAt: new Date(then).toISOString(),
    durationSeconds: 1800,
    exercises: [],
    totalVolume: 0,
  };
}

const NOW = Date.UTC(2026, 6, 22, 12, 0, 0);

test('3 / 7 / 14 calendar days off stay shame-free and keep the short session', () => {
  const expectLine: Record<number, { tone: 'gap' | 'long-gap'; line: string }> = {
    3: { tone: 'gap', line: "Three days off. Here's the 20-minute version." },
    7: { tone: 'gap', line: "Seven days off. Here's the 20-minute version." },
    14: { tone: 'long-gap', line: "14 days off. Here's the 20-minute version." },
  };
  for (const days of [3, 7, 14] as const) {
    const r = computeReentry([logDaysAgo(days)], NOW);
    assert.equal(r.show, true, `${days}d should show`);
    assert.equal(r.tone, expectLine[days].tone, `${days}d tone`);
    const line = formatReentryQuietLine(r);
    assert.equal(line, expectLine[days].line);
    for (const re of FORBIDDEN) {
      assert.doesNotMatch(line, re, line);
    }
  }
});
