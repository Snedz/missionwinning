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

/**
 * `.212` — the week the athlete *shares* must be the week they trained.
 *
 * `weekStart` was `weekStart.toISOString().slice(0, 10)` applied to a correct
 * **local** Monday from `startOfLocalWeek()`. East of UTC, local Monday 00:00 is
 * still Sunday in UTC, so the field named "Local Monday as YYYY-MM-DD" in its own
 * JSDoc reported a Sunday — and it is not an internal value: it reaches
 * `weeklyDebrief` → `TodayWeekRecapCard`'s **shared text** and the share-card
 * title, while `useCoachPlan().weekStart` said the correct Monday. Two answers
 * for the same week, in the same product, in the same evening.
 *
 * The old assertion here was `typeof recap.weekStart === 'string'`, which is why
 * `.199` — the PR about exactly this class of bug — did not catch it.
 *
 * `.199`'s guard could not see it either: it matched `split('T')[0]` and this
 * site used `.slice(0, 10)`. A guard keyed to one spelling of a defect has only
 * ever tested that spelling.
 */
describe('weekStart is a local calendar date', () => {
  const ZONES = [
    'Asia/Tokyo', // UTC+9 — local Monday 00:00 is Sunday 15:00 UTC
    'Pacific/Kiritimati', // UTC+14, the worst case
    'Europe/London',
    'America/New_York', // UTC-4/-5, the other direction
    'Pacific/Midway', // UTC-11
    'UTC',
  ];

  it('names the local Monday in every timezone, at every hour', () => {
    const original = process.env.TZ;
    try {
      for (const zone of ZONES) {
        process.env.TZ = zone;
        for (const hour of [0, 1, 12, 23]) {
          // A Wednesday, so the week's Monday is unambiguous in local terms.
          const now = new Date(2026, 6, 29, hour, 30, 0);
          const recap = buildWeekRecap([], now);
          const monday = new Date(now);
          monday.setHours(0, 0, 0, 0);
          monday.setDate(monday.getDate() + (monday.getDay() === 0 ? -6 : 1 - monday.getDay()));
          const expected = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;

          assert.equal(
            recap.weekStart,
            expected,
            `${zone} at ${hour}:30 — weekStart must be the local Monday the athlete trained in, ` +
              `not the UTC instant that Monday began`
          );
          assert.equal(new Date(`${recap.weekStart}T12:00:00`).getDay(), 1, `${zone}: not a Monday`);
        }
      }
    } finally {
      if (original === undefined) delete process.env.TZ;
      else process.env.TZ = original;
    }
  });
});
