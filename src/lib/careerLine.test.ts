import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeCareerLine, hasCareer, careerSignature, EMPTY_CAREER_LINE } from './careerLine';
import type { CompletedWorkoutLog } from '@/types';

/**
 * Dates are built relative to a fixed anchor rather than written as literals —
 * CLAUDE.md §6: *"a test with a date literal in it is a test with an expiry
 * date"*. The anchor is a Monday so week bucketing is unambiguous.
 */
const MONDAY = new Date(2024, 0, 1, 12, 0, 0);
const dayAt = (offset: number, hour = 12) =>
  new Date(2024, 0, 1 + offset, hour, 0, 0).toISOString();

function log(over: Partial<CompletedWorkoutLog> = {}): CompletedWorkoutLog {
  return {
    id: Math.random().toString(36).slice(2),
    workoutName: 'Session',
    startedAt: dayAt(0, 11),
    completedAt: dayAt(0),
    durationSeconds: 1800,
    exercises: [{ exerciseId: 'squat', sets: [{ reps: 5, weight: 100 }] }],
    ...over,
  } as CompletedWorkoutLog;
}

test('an athlete who has never trained gets zeroes, not NaN', () => {
  const line = computeCareerLine([]);
  assert.deepEqual(line, EMPTY_CAREER_LINE);
  assert.equal(hasCareer(line), false);
  // Every field must be a real number — a NaN would render as "NaN" on the page.
  for (const [k, v] of Object.entries(line)) {
    if (typeof v === 'number') assert.ok(Number.isFinite(v), `${k} is not finite`);
  }
});

test('counts sessions, tonnage, distinct exercises and days', () => {
  const line = computeCareerLine([
    log({ completedAt: dayAt(0), exercises: [{ exerciseId: 'squat', sets: [{ reps: 5, weight: 100 }] }] }),
    log({ completedAt: dayAt(1), exercises: [{ exerciseId: 'bench', sets: [{ reps: 10, weight: 50 }] }] }),
  ]);
  assert.equal(line.sessions, 2);
  assert.equal(line.tonnage, 5 * 100 + 10 * 50);
  assert.equal(line.distinctExercises, 2);
  assert.equal(line.daysTrained, 2);
  assert.equal(hasCareer(line), true);
});

test('a tombstoned session is gone from the total, not merely hidden', () => {
  // History and the career line must agree: benchmarks.ts and dayReview.ts both
  // skip `deletedAt`, and a number that still counts it resurrects a session the
  // athlete deleted on another device.
  const line = computeCareerLine([
    log({ completedAt: dayAt(0) }),
    log({ completedAt: dayAt(1), deletedAt: dayAt(2) }),
  ]);
  assert.equal(line.sessions, 1);
  assert.equal(line.daysTrained, 1);
  assert.equal(line.tonnage, 500);
});

test('two sessions on one day is two sessions but one day', () => {
  const line = computeCareerLine([
    log({ completedAt: dayAt(0, 7) }),
    log({ completedAt: dayAt(0, 19) }),
  ]);
  assert.equal(line.sessions, 2);
  assert.equal(line.daysTrained, 1);
  assert.ok(line.daysTrained <= line.sessions, 'days trained can never exceed sessions');
});

test('best week is the busiest local week, not the most recent', () => {
  const line = computeCareerLine([
    // Week 1 — three sessions.
    log({ completedAt: dayAt(0) }),
    log({ completedAt: dayAt(1) }),
    log({ completedAt: dayAt(2) }),
    // Week 2 — one.
    log({ completedAt: dayAt(8) }),
  ]);
  assert.equal(line.bestWeek, 3);
});

test('the first session date is the earliest, whatever order history arrives in', () => {
  // Sync merges do not guarantee order, so this must not depend on it.
  const line = computeCareerLine([
    log({ completedAt: dayAt(5) }),
    log({ completedAt: dayAt(0) }),
    log({ completedAt: dayAt(3) }),
  ]);
  assert.equal(line.firstSessionOn, computeCareerLine([log({ completedAt: dayAt(0) })]).firstSessionOn);
});

test('a malformed set costs its own volume, never the whole session', () => {
  // A log synced from another device can carry junk. The athlete still trained;
  // dropping the session would under-count the one thing this block promises.
  const line = computeCareerLine([
    log({
      completedAt: dayAt(0),
      exercises: [
        { exerciseId: 'squat', sets: [{ reps: 5, weight: 100 }, { reps: NaN, weight: 50 }] },
        // @ts-expect-error deliberately malformed — this is the defensive path
        { exerciseId: 'bench', sets: undefined },
      ],
    }),
  ]);
  assert.equal(line.sessions, 1, 'the session still counts');
  assert.equal(line.tonnage, 500, 'only the good set contributes');
  assert.equal(line.distinctExercises, 2, 'both exercises were touched');
});

test('a log with no completedAt is skipped rather than crashing', () => {
  const line = computeCareerLine([log({ completedAt: undefined }), log({ completedAt: dayAt(0) })]);
  assert.equal(line.sessions, 1);
});

test('negative and zero loads do not subtract from tonnage', () => {
  // Bodyweight sets log weight 0 and are real training; they must not reduce a
  // total, and a negative can only be corrupt data.
  const line = computeCareerLine([
    log({
      completedAt: dayAt(0),
      exercises: [{ exerciseId: 'pushup', sets: [{ reps: 20, weight: 0 }, { reps: 5, weight: -100 }] }],
    }),
  ]);
  assert.equal(line.tonnage, 0);
  assert.equal(line.sessions, 1, 'a bodyweight session is still a session');
});

test('the anchor really is a Monday, so the week assertions mean what they say', () => {
  assert.equal(MONDAY.getDay(), 1);
});

test('signature is null before any session and carries counts after', () => {
  assert.equal(careerSignature(EMPTY_CAREER_LINE), null);
  const line = computeCareerLine([
    log({ completedAt: dayAt(0) }),
    log({ completedAt: dayAt(1) }),
  ]);
  const sig = careerSignature(line);
  assert.ok(sig);
  assert.equal(sig.sessions, 2);
  assert.equal(sig.daysTrained, 2);
  assert.equal(sig.bestWeek, line.bestWeek);
  assert.equal(sig.distinctExercises, line.distinctExercises);
});
