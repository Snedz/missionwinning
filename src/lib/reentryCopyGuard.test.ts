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
  const defaults = [...src.matchAll(/defaultValue:\s*(["'`])((?:(?!\1).)*)\1/g)].map((m) => m[2]);
  assert.ok(defaults.length >= 1, 'expected reentry default copy');
  for (const d of defaults) {
    for (const re of FORBIDDEN) {
      assert.doesNotMatch(d, re, `reentry copy: ${d}`);
    }
  }
});

test('the two-day working line quotes a stored set, not the gap', () => {
  const line = formatReentryQuietLine({
    daysSince: 2,
    tone: 'gap',
    witness: { exerciseId: 'squat' },
  });
  assert.equal(line, "Back from squat. Here's the 20-minute version.");
  assert.doesNotMatch(line, /days off/i);
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
    exercises: [{ exerciseId: 'squat', sets: [{ reps: 5, weight: 100 }] }],
    totalVolume: 0,
  };
}

const NOW = Date.UTC(2026, 6, 22, 12, 0, 0);

test('3 / 7 / 14 days: line cites the stored set and never the gap length', () => {
  const expectTone: Record<number, 'gap' | 'long-gap'> = {
    3: 'gap',
    7: 'gap',
    14: 'long-gap',
  };
  for (const days of [3, 7, 14] as const) {
    const r = computeReentry([logDaysAgo(days)], NOW);
    assert.equal(r.show, true, `${days}d should show`);
    assert.equal(r.tone, expectTone[days], `${days}d tone`);
    const line = formatReentryQuietLine(r);
    assert.equal(line, "Back from squat. Here's the 20-minute version.");
    assert.doesNotMatch(line, /days off|\b\d+\s+day/i, line);
    assert.doesNotMatch(line, /xp|rank|tier|leaderboard|badge|squad/i, line);
    for (const re of FORBIDDEN) {
      assert.doesNotMatch(line, re, line);
    }
  }
});
