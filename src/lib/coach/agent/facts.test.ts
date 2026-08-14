import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  countTrainDays14,
  slimCoachLogFacts,
  slimCoachWeekSessions,
} from '@/lib/coach/agent/facts';
import type { CompletedWorkoutLog } from '@/types';

function daysAgoIso(days: number, now: Date): string {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
}

function log(partial: Partial<CompletedWorkoutLog> & { completedAt: string }): CompletedWorkoutLog {
  return {
    id: partial.id ?? `w-${partial.completedAt}`,
    workoutName: partial.workoutName ?? 'Session',
    startedAt: partial.startedAt ?? partial.completedAt,
    completedAt: partial.completedAt,
    durationSeconds: partial.durationSeconds ?? 1800,
    totalVolume: partial.totalVolume ?? 100,
    deletedAt: partial.deletedAt,
    exercises: partial.exercises ?? [],
  };
}

describe('slimCoachLogFacts', () => {
  it('quotes the last working set per exercise and skips warmup / tombstones / zero-rep', () => {
    const now = new Date();
    const history = [
      log({
        completedAt: daysAgoIso(1, now),
        exercises: [
          {
            exerciseId: 'squats',
            sets: [
              { reps: 8, weight: 40, kind: 'warmup' },
              { reps: 5, weight: 80 },
              { reps: 0, weight: 90 },
            ],
          },
        ],
      }),
      log({
        completedAt: daysAgoIso(3, now),
        exercises: [{ exerciseId: 'squats', sets: [{ reps: 5, weight: 70 }] }],
      }),
      log({
        completedAt: daysAgoIso(2, now),
        deletedAt: daysAgoIso(1, now),
        exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 60 }] }],
      }),
      log({
        completedAt: daysAgoIso(4, now),
        exercises: [{ exerciseId: 'deadlift', sets: [{ reps: 3, weight: 120 }] }],
      }),
    ];
    const facts = slimCoachLogFacts(history, { now });
    assert.equal(facts[0]?.exerciseId, 'squats');
    assert.equal(facts[0]?.weight, 80);
    assert.equal(facts[0]?.reps, 5);
    assert.ok(facts.every((f) => f.exerciseId !== 'bench-press'));
    assert.equal(facts.find((f) => f.exerciseId === 'deadlift')?.weight, 120);
  });

  it('caps at the limit and ignores empty history', () => {
    const now = new Date();
    const history = Array.from({ length: 20 }, (_, i) =>
      log({
        completedAt: daysAgoIso(i + 1, now),
        exercises: [{ exerciseId: `ex-${i}`, sets: [{ reps: 5, weight: 10 + i }] }],
      })
    );
    assert.equal(slimCoachLogFacts(history, { limit: 8, now }).length, 8);
    assert.deepEqual(slimCoachLogFacts([]), []);
  });
});

describe('countTrainDays14', () => {
  it('counts unique local days inside the window and ignores tombstones', () => {
    const now = new Date();
    const history = [
      log({ completedAt: daysAgoIso(0, now) }),
      log({ id: 'same-day', completedAt: daysAgoIso(0, now) }),
      log({ completedAt: daysAgoIso(2, now) }),
      log({ completedAt: daysAgoIso(20, now) }),
      log({ completedAt: daysAgoIso(1, now), deletedAt: daysAgoIso(0, now) }),
    ];
    assert.equal(countTrainDays14(history, now), 2);
    assert.equal(countTrainDays14([], now), 0);
  });
});

describe('slimCoachWeekSessions', () => {
  it('projects plan sessions and caps the list', () => {
    assert.deepEqual(slimCoachWeekSessions(null), []);
    const plan = {
      sessions: Array.from({ length: 10 }, (_, i) => ({
        name: `Day ${i}`,
        kind: 'strength',
        status: i === 0 ? 'done' : 'planned',
        exercises: [{ exerciseId: 'squats' }],
      })),
    };
    const slim = slimCoachWeekSessions(plan, 3);
    assert.equal(slim.length, 3);
    assert.equal(slim[0]?.status, 'done');
    assert.deepEqual(slim[0]?.exerciseIds, ['squats']);
  });
});
