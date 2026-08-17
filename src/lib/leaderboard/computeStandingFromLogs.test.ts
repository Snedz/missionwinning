import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeWinScore } from '@/lib/score';
import { computeStandingFromLogs } from '@/lib/leaderboard/computeStandingFromLogs';
import { isLocalDateKey } from '@/lib/time/localDate';

test('nutrition YYYY-MM-DD keys are accepted, never sliced as ISO instants', () => {
  const standing = computeStandingFromLogs({
    workouts: [],
    nutrition: [{ date: '2026-08-17', protein: 130 }],
    todayKey: '2026-08-17',
    weekStartKey: '2026-08-17',
    dateKeyOf: () => '',
    hourOf: () => null,
  });
  assert.equal(standing.fuelDays, 1);
});

test('a date that is not a local key does not become a protein day', () => {
  const sliced = '2026-08-17T22:00:00.000Z'.slice(0, 10);
  assert.equal(isLocalDateKey('2026-08-17T22:00:00.000Z'), false);
  const standing = computeStandingFromLogs({
    workouts: [],
    nutrition: [{ date: '2026-08-17T22:00:00.000Z', protein: 200 }],
    todayKey: '2026-08-17',
    weekStartKey: '2026-08-17',
    dateKeyOf: () => '',
    hourOf: () => null,
  });
  assert.equal(standing.fuelDays, 0);
  assert.equal(sliced, '2026-08-17');
});

test('Train + Fuel match computeWinScore for the same week logs', () => {
  const standing = computeStandingFromLogs({
    workouts: [
      { completedAt: '2026-08-17T14:00:00.000Z', totalVolume: 2000 },
      { completedAt: '2026-08-18T14:00:00.000Z', totalVolume: 1500 },
    ],
    nutrition: [
      { date: '2026-08-17', protein: 130 },
      { date: '2026-08-18', protein: 80 },
    ],
    todayKey: '2026-08-18',
    weekStartKey: '2026-08-17',
    dateKeyOf: (iso) => iso.slice(0, 10),
    hourOf: () => 14,
  });
  const expected = computeWinScore({
    streak: 2,
    highProteinDays: 1,
    sessionsThisWeek: 2,
    volumeThisWeek: 3500,
    trainDaysThisWeek: 2,
    moveFlows: 0,
    mindSessions: 0,
    trackActivities: 0,
    learnLessons: 0,
  });
  assert.equal(standing.missionScore, expected.total);
  assert.equal(standing.weeklyVolume, 3500);
  assert.equal(standing.fuelDays, 1);
  assert.equal(standing.trainingStreak, 2);
});

test('deleted workouts and hours outside night/dawn do not count', () => {
  const standing = computeStandingFromLogs({
    workouts: [
      { completedAt: '2026-08-17T02:00:00.000Z', totalVolume: 100, deletedAt: '2026-08-17T03:00:00.000Z' },
      { completedAt: '2026-08-17T02:00:00.000Z', totalVolume: 100 },
    ],
    nutrition: [],
    todayKey: '2026-08-17',
    weekStartKey: '2026-08-17',
    dateKeyOf: () => '2026-08-17',
    hourOf: () => 2,
  });
  assert.equal(standing.weeklyVolume, 100);
  assert.equal(standing.nightSessions, 1);
  assert.equal(standing.dawnSessions, 0);
});

