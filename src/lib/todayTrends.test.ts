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

/**
 * `.245` — the bug the rest of this file could not see.
 *
 * `buildTodayTrends` keyed its buckets with `localDateKey` and keyed the
 * workouts with `completedAt.split('T')[0]`, the **UTC** date. Every test above
 * builds its ISO strings from a local wall-clock time and then runs in UTC,
 * where the two spellings agree — so the suite proved the aggregation while
 * being structurally unable to see which day anything landed on. `.211`'s
 * lesson with the sign flipped: there a fixture drifted and went red, here it
 * agreed with the code because both were evaluated in the one zone that hides
 * the difference.
 *
 * Auckland is UTC+12/13, so **every morning session** — 00:00 to 13:00 local,
 * which is most of when people train — carried the previous UTC date and was
 * counted on yesterday's bar, leaving today's column reading zero.
 */
function inZone<T>(tz: string, fn: () => T): T {
  const previous = process.env.TZ;
  process.env.TZ = tz;
  try {
    return fn();
  } finally {
    if (previous === undefined) delete process.env.TZ;
    else process.env.TZ = previous;
  }
}

describe('todayTrends — the day a session lands on', () => {
  // East and west of UTC, plus UTC itself as the control that always passed.
  for (const tz of ['Pacific/Auckland', 'Asia/Tokyo', 'UTC', 'America/Los_Angeles', 'Pacific/Midway']) {
    it(`counts this morning's session on today, in ${tz}`, () => {
      inZone(tz, () => {
        const morning = new Date();
        morning.setHours(10, 0, 0, 0);
        const workouts: CompletedWorkoutLog[] = [
          {
            id: 'w1',
            workoutName: 'Push Day',
            startedAt: morning.toISOString(),
            completedAt: morning.toISOString(),
            durationSeconds: 3600,
            exercises: [],
            totalVolume: 5000,
          },
        ];

        const trends = buildTodayTrends(workouts, 'en', 7);
        const volume = trends.series.find((s) => s.id === 'volume');
        assert.ok(volume, 'volume series missing');

        assert.equal(
          volume.values[volume.values.length - 1],
          5000,
          `${tz}: a session logged at 10:00 today must land on today's bucket`
        );
        assert.equal(volume.weekTotal, 5000, `${tz}: it must be counted exactly once`);
      });
    });
  }

  it('a session logged late last night is not counted as today', () => {
    inZone('Pacific/Auckland', () => {
      const lastNight = new Date();
      lastNight.setDate(lastNight.getDate() - 1);
      lastNight.setHours(23, 30, 0, 0);
      const workouts: CompletedWorkoutLog[] = [
        {
          id: 'w1',
          workoutName: 'Late',
          startedAt: lastNight.toISOString(),
          completedAt: lastNight.toISOString(),
          durationSeconds: 600,
          exercises: [],
          totalVolume: 1000,
        },
      ];
      const volume = buildTodayTrends(workouts, 'en', 7).series.find((s) => s.id === 'volume');
      assert.ok(volume);
      assert.equal(volume.values[volume.values.length - 1], 0, "today's column stays empty");
      assert.equal(volume.values[volume.values.length - 2], 1000, 'it belongs to yesterday');
    });
  });
});
