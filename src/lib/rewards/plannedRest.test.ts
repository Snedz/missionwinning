import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  isPlannedRest,
  streakFromDatesAllowingRest,
} from './plannedRest.ts';

const root = path.join(import.meta.dirname, '..', '..', '..');

test('planned rest is a date membership check', () => {
  assert.equal(isPlannedRest('2026-08-12', ['2026-08-12']), true);
  assert.equal(isPlannedRest('2026-08-13', ['2026-08-12']), false);
  assert.equal(isPlannedRest('', ['2026-08-12']), false);
});

test('rest bridges a streak and does not count as a session', () => {
  const workouts = ['2026-08-10', '2026-08-12'];
  const rest = ['2026-08-11'];
  assert.equal(streakFromDatesAllowingRest(workouts, rest, '2026-08-12'), 2);
});

test('rest today after yesterday train stays live at 1', () => {
  assert.equal(
    streakFromDatesAllowingRest(['2026-08-11'], ['2026-08-12'], '2026-08-12'),
    1
  );
});

test('a gap that is not rest is zero', () => {
  assert.equal(streakFromDatesAllowingRest(['2026-08-10'], [], '2026-08-12'), 0);
});

test('rest-only is zero — weekly goal still needs sessions', () => {
  assert.equal(streakFromDatesAllowingRest([], ['2026-08-11', '2026-08-12'], '2026-08-12'), 0);
});

test('weekly goal stays the boss; rest is not a session', () => {
  const summary = readFileSync(path.join(root, 'src/lib/rewards/summary.ts'), 'utf8');
  assert.match(summary, /weeklyTrainCurrent = workoutHistory/);
  assert.doesNotMatch(summary, /plannedRest/);
});

test('Today rewards can mark rest without a second red', () => {
  const card = readFileSync(
    path.join(root, 'src/components/rewards/TodayRewardsCard.tsx'),
    'utf8'
  );
  assert.match(card, /rest-today/);
  assert.match(card, /variant=\"ghost\"/);
  assert.doesNotMatch(card, /primary-action/);
});
