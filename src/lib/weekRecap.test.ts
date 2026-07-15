import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildWeekRecap } from './weekRecap.ts';
import type { CompletedWorkoutLog } from '@/types';

function log(daysAgo: number, volume = 1000): CompletedWorkoutLog {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return {
    id: `l-${daysAgo}`,
    workoutName: 'Test',
    startedAt: d.toISOString(),
    completedAt: d.toISOString(),
    durationSeconds: 1800,
    totalVolume: volume,
    exercises: [{ exerciseId: 'push-ups', sets: [{ reps: 10, weight: 0 }] }],
  };
}

describe('buildWeekRecap', () => {
  it('counts sessions in the current local week', () => {
    const recap = buildWeekRecap([log(0), log(1), log(20)]);
    assert.ok(recap.sessions >= 1);
    assert.ok(recap.sessions <= 2);
    assert.equal(typeof recap.weekStart, 'string');
    assert.ok(recap.hasActivity);
  });

  it('returns empty activity when history is empty', () => {
    const recap = buildWeekRecap([]);
    assert.equal(recap.sessions, 0);
    assert.equal(recap.hasActivity, false);
  });
});
