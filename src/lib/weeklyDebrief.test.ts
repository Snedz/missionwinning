import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildWeeklyDebrief } from './weeklyDebrief.ts';
import type { CompletedWorkoutLog } from '@/types';

function log(daysAgo: number): CompletedWorkoutLog {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return {
    id: `l-${daysAgo}`,
    workoutName: 'Test',
    startedAt: d.toISOString(),
    completedAt: d.toISOString(),
    durationSeconds: 600,
    totalVolume: 1000,
    exercises: [{ exerciseId: 'squat', sets: [{ reps: 5, weight: 100 }] }],
  };
}

describe('buildWeeklyDebrief', () => {
  it('builds train stats from history', () => {
    // Force a Monday for full debrief
    const monday = new Date('2026-07-20T12:00:00'); // Monday
    const d = buildWeeklyDebrief({
      history: [log(0), log(1)],
      now: monday,
      proteinDaysThisWeek: 2,
      fuelLogDays: 3,
      moveFlows: 1,
      mindSessions: 2,
    });
    assert.equal(d.isFullDebrief, true);
    assert.ok(d.train.sessions >= 1);
    assert.equal(d.fuel.proteinDays, 2);
    assert.ok(d.focusKey);
  });

  it('suggests get one session when empty week', () => {
    const monday = new Date('2026-07-20T12:00:00');
    const d = buildWeeklyDebrief({ history: [], now: monday });
    assert.equal(d.focusKey, 'debriefFocusGetOneSession');
  });

  it('includes body weight delta when metrics provided', () => {
    const monday = new Date('2026-07-20T12:00:00');
    const d = buildWeeklyDebrief({
      history: [log(1)],
      now: monday,
      bodyMetrics: [
        { date: '2026-07-01', weightKg: 80 },
        { date: '2026-07-18', weightKg: 78.5 },
      ],
    });
    assert.equal(d.body?.weightDelta, -1.5);
  });
});
