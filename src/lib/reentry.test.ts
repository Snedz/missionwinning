import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeReentry,
  daysSinceLastSession,
  easedSetCount,
  REENTRY_MIN_DAYS,
} from '@/lib/reentry';
import type { CompletedWorkoutLog } from '@/types';

const NOW = Date.UTC(2026, 6, 24, 12, 0, 0);
const DAY = 86_400_000;

function log(daysAgo: number, extra: Partial<CompletedWorkoutLog> = {}): CompletedWorkoutLog {
  const completedAt = new Date(NOW - daysAgo * DAY).toISOString();
  return {
    id: `log-${daysAgo}`,
    workoutName: 'Push',
    startedAt: completedAt,
    completedAt,
    durationSeconds: 1800,
    totalVolume: 1000,
    exercises: [{ exerciseId: 'push-ups', sets: [{ reps: 10, weight: 0 }] }],
    ...extra,
  };
}

test('reentry', async (t) => {
  await t.test('a brand new user is onboarding, not returning', () => {
    const r = computeReentry([], NOW);
    assert.equal(r.daysSince, null);
    assert.equal(r.show, false, 'I-Day owns the never-logged story');
  });

  await t.test('rest days are not a missed day', () => {
    for (let d = 0; d < REENTRY_MIN_DAYS; d++) {
      const r = computeReentry([log(d)], NOW);
      assert.equal(r.show, false, `${d} days off must not trigger re-entry`);
      assert.equal(r.doseScale, 1);
    }
  });

  await t.test('a few days off eases the dose without making a fuss', () => {
    const r = computeReentry([log(5)], NOW);
    assert.equal(r.show, true);
    assert.equal(r.tone, 'gap');
    assert.ok(r.doseScale < 1 && r.doseScale > 0.5, 'a small gap should not halve the session');
  });

  await t.test('two weeks off halves the dose', () => {
    const r = computeReentry([log(20)], NOW);
    assert.equal(r.tone, 'long-gap');
    assert.equal(r.doseScale, 0.5);
  });

  await t.test('months off is treated as lapsed, not a continuing plan', () => {
    const r = computeReentry([log(200)], NOW);
    assert.equal(r.tone, 'lapsed');
    assert.equal(r.show, true);
    assert.equal(r.doseScale, 0.5);
  });

  await t.test('the most recent session wins regardless of array order', () => {
    const history = [log(30), log(2), log(90)];
    assert.equal(daysSinceLastSession(history, NOW), 2);
    assert.equal(computeReentry(history, NOW).show, false);
  });

  await t.test('a tombstoned session does not count as training', () => {
    const history = [log(2, { deletedAt: new Date(NOW).toISOString() }), log(10)];
    assert.equal(daysSinceLastSession(history, NOW), 10);
    assert.equal(computeReentry(history, NOW).show, true);
  });

  await t.test('a session earlier today reads as zero days', () => {
    assert.equal(daysSinceLastSession([log(0)], NOW), 0);
  });

  await t.test('a corrupt timestamp is ignored rather than crashing', () => {
    const bad = { ...log(1), completedAt: 'not a date' };
    assert.equal(daysSinceLastSession([bad], NOW), null);
    const mixed = [bad, log(6)];
    assert.equal(daysSinceLastSession(mixed, NOW), 6);
  });

  await t.test('a future timestamp never produces a negative gap', () => {
    assert.equal(daysSinceLastSession([log(-3)], NOW), 0);
  });

  await t.test('easedSetCount always leaves something to do', () => {
    assert.equal(easedSetCount(4, 0.5), 2);
    assert.equal(easedSetCount(3, 0.7), 2);
    assert.equal(easedSetCount(1, 0.5), 1, 'never ease below a single set');
    assert.equal(easedSetCount(2, 0.5), 1);
    assert.equal(easedSetCount(0, 0.5), 0);
    assert.equal(easedSetCount(5, 1), 5, 'no easing means no change');
    assert.ok(easedSetCount(5, 1.5) <= 5, 'easing must never increase the ask');
  });
});
