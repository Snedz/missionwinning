import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildTodayCandidates } from '@/lib/today/buildTodayCandidates';

test('dashboard candidates include continuity after first sessions', () => {
  const keys = buildTodayCandidates({
    phase: 'commissioned',
    firstStepsDismissed: true,
    reentryShow: false,
    showDashboard: true,
    belowFoldReady: true,
    totalSessions: 3,
    streak: 1,
    hour: 12,
    weekRecap: null,
    reflectInvite: false,
    hasActiveWorkout: false,
  }).map((s) => s.key);
  assert.ok(keys.includes('continuity'));
});

test('no continuity before first session', () => {
  const keys = buildTodayCandidates({
    phase: 'basic',
    firstStepsDismissed: true,
    reentryShow: false,
    showDashboard: false,
    belowFoldReady: true,
    totalSessions: 0,
    streak: 0,
    hour: 12,
    weekRecap: null,
    reflectInvite: false,
    hasActiveWorkout: false,
  }).map((s) => s.key);
  assert.ok(!keys.includes('continuity'));
});

test('HomeTodayDashboard wires ContinuityStrip', () => {
  const src = readFileSync(
    join(import.meta.dirname, '..', '..', 'page-components', 'HomeTodayDashboard.tsx'),
    'utf8'
  );
  assert.match(src, /ContinuityStrip/);
  assert.match(src, /buildContinuitySuggestions/);
  assert.match(src, /continuity:/);
});
