import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildTodayTrends,
  gatherJournalEntries,
  lastDayBuckets,
} from '@/lib/todayTrends';
import type { CompletedWorkoutLog } from '@/types';

function isoDaysAgo(days: number, hour = 10): string {
  const d = new Date();
  d.setHours(hour, 0, 0, 0);
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

describe('todayTrends', () => {
  it('lastDayBuckets returns ordered day keys', () => {
    const buckets = lastDayBuckets(3, 'en');
    assert.equal(buckets.length, 3);
    assert.ok(buckets[0].key <= buckets[2].key);
  });

  it('buildTodayTrends aggregates volume and sessions', () => {
    const workouts: CompletedWorkoutLog[] = [
      {
        id: 'w1',
        workoutName: 'Push Day',
        startedAt: isoDaysAgo(0),
        completedAt: isoDaysAgo(0),
        durationSeconds: 3600,
        exercises: [],
        totalVolume: 5000,
      },
      {
        id: 'w2',
        workoutName: 'Pull Day',
        startedAt: isoDaysAgo(1),
        completedAt: isoDaysAgo(1),
        durationSeconds: 3600,
        exercises: [],
        totalVolume: 4200,
      },
    ];
    const trends = buildTodayTrends(workouts, 'en', 7);
    assert.equal(trends.series.length, 4);
    const volume = trends.series.find((s) => s.id === 'volume');
    assert.ok(volume);
    assert.equal(volume!.weekTotal, 9200);
    const sessions = trends.series.find((s) => s.id === 'sessions');
    assert.equal(sessions!.weekTotal, 2);
  });

  it('gatherJournalEntries includes workouts sorted newest first', () => {
    const workouts: CompletedWorkoutLog[] = [
      {
        id: 'w1',
        workoutName: 'Push Day',
        startedAt: isoDaysAgo(0),
        completedAt: isoDaysAgo(0),
        durationSeconds: 3600,
        exercises: [],
        totalVolume: 5000,
      },
      {
        id: 'w2',
        workoutName: 'Pull Day',
        startedAt: isoDaysAgo(1),
        completedAt: isoDaysAgo(1),
        durationSeconds: 3600,
        exercises: [],
        totalVolume: 4200,
      },
    ];
    const entries = gatherJournalEntries(workouts, 5);
    assert.ok(entries.length >= 2);
    assert.equal(entries[0].pillar, 'train');
    assert.ok(entries[0].at >= entries[1].at);
  });
});
