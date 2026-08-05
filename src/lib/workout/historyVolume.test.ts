import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { sumHistoryVolume } from '@/lib/workout/historyVolume';
import type { CompletedWorkoutLog } from '@/types';

function log(volume: number, deleted = false): CompletedWorkoutLog {
  return {
    id: `w-${volume}-${deleted ? 'd' : 'a'}`,
    workoutName: 't',
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    durationSeconds: 60,
    exercises: [],
    totalVolume: volume,
    ...(deleted ? { deletedAt: new Date().toISOString() } : {}),
  };
}

describe('sumHistoryVolume', () => {
  it('sums finite volumes and skips deleted', () => {
    assert.equal(sumHistoryVolume([log(10), log(5, true), log(2)]), 12);
  });
  it('treats empty as 0', () => {
    assert.equal(sumHistoryVolume([]), 0);
  });
});
