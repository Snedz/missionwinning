import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeReentry,
  daysSinceLastSession,
  doseScaleForMissedSessions,
  doseScaleForShortSession,
  doseScalePercent,
  easedSetCount,
  formatReentryQuietLine,
  REENTRY_MIN_DAYS,
  REENTRY_SHORT_MINUTES,
  scaleExercisesByDose,
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

  await t.test('one rest day is not a missed day', () => {
    for (let d = 0; d < REENTRY_MIN_DAYS; d++) {
      const r = computeReentry([log(d)], NOW);
      assert.equal(r.show, false, `${d} days off must not trigger re-entry`);
      assert.equal(r.doseScale, 1);
    }
  });

  await t.test('two calendar days off is the quiet short session', () => {
    const r = computeReentry([log(2)], NOW);
    assert.equal(r.show, true);
    assert.equal(r.tone, 'gap');
    assert.equal(r.daysSince, 2);
    assert.equal(
      formatReentryQuietLine(r),
      "Back from push-ups. Here's the 20-minute version."
    );
    assert.equal(r.doseScale, doseScaleForShortSession(30));
  });

  await t.test('a few days off eases toward twenty minutes without a fuss', () => {
    const r = computeReentry([log(5)], NOW);
    assert.equal(r.show, true);
    assert.equal(r.tone, 'gap');
    assert.ok(r.doseScale < 1, 'a gap should not start the full session');
    assert.equal(r.doseScale, doseScaleForShortSession(30));
  });

  await t.test('two weeks off is long-gap, still the short session', () => {
    const r = computeReentry([log(20)], NOW);
    assert.equal(r.tone, 'long-gap');
    assert.equal(r.show, true);
    assert.equal(r.doseScale, doseScaleForShortSession(30));
  });

  await t.test('months off is treated as lapsed, not a continuing plan', () => {
    const r = computeReentry([log(200)], NOW);
    assert.equal(r.tone, 'lapsed');
    assert.equal(r.show, true);
    assert.equal(r.doseScale, doseScaleForShortSession(30));
    assert.equal(
      formatReentryQuietLine(r),
      "Back from push-ups. Here's the 20-minute version.",
      'lapsed copy quotes the last set, not the absence'
    );
  });

  await t.test('the most recent session wins regardless of array order', () => {
    const history = [log(30), log(1), log(90)];
    assert.equal(daysSinceLastSession(history, NOW), 1);
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

  await t.test('calendar days, not elapsed 24h blocks', () => {
    // Monday 22:00 → Wednesday 08:00 is two local calendar days and ~34 hours.
    const wednesdayMorning = new Date(2026, 6, 22, 8, 0, 0).getTime();
    const mondayEvening = new Date(2026, 6, 20, 22, 0, 0).toISOString();
    const history = [{ ...log(0), completedAt: mondayEvening, startedAt: mondayEvening }];
    assert.equal(daysSinceLastSession(history, wednesdayMorning), 2);
    assert.equal(computeReentry(history, wednesdayMorning).show, true);
  });

  await t.test('doseScaleForMissedSessions eases per stored miss and never grows', () => {
    assert.equal(doseScaleForMissedSessions(0), 1);
    assert.equal(doseScaleForMissedSessions(1), 0.9);
    assert.equal(doseScaleForMissedSessions(4), 0.6);
    assert.equal(doseScaleForMissedSessions(8), 0.4);
    assert.equal(doseScaleForMissedSessions(20), 0.4, 'floor so the session does not vanish');
  });

  await t.test('doseScaleForShortSession never grows the ask', () => {
    assert.equal(doseScaleForShortSession(15), 1, 'already short stays full');
    assert.equal(doseScaleForShortSession(40), 0.5);
    assert.equal(doseScaleForShortSession(100), 0.4, 'floor so the session does not vanish');
    assert.equal(doseScaleForShortSession(0), 0.5);
  });

  await t.test('a log with no duration falls back to a typical session', () => {
    const r = computeReentry(
      [
        {
          ...log(8),
          durationSeconds: 0,
          exercises: [],
        },
      ],
      NOW
    );
    assert.equal(r.show, true);
    assert.equal(r.doseScale, 0.5, '40 min assumed → 20/40');
  });

  await t.test('quiet line never uses streak or missed-you copy', () => {
    for (const days of [2, 3, 5, 11, 20]) {
      const line = formatReentryQuietLine({
        daysSince: days,
        tone: days >= 14 ? 'long-gap' : 'gap',
      });
      assert.doesNotMatch(line, /streak|missed|failed|guilt|quit/i, line);
      assert.match(line, new RegExp(`${REENTRY_SHORT_MINUTES}-minute version`));
    }
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

  await t.test('scaleExercisesByDose trims sets when returning', () => {
    const exercises = [
      {
        exerciseId: 'bench',
        sets: [
          { reps: 5, weight: 100 },
          { reps: 5, weight: 100 },
          { reps: 5, weight: 100 },
          { reps: 5, weight: 100 },
        ],
      },
    ];
    const scaled = scaleExercisesByDose(exercises, 0.5);
    assert.equal(scaled[0].sets.length, 2);
    assert.equal(scaleExercisesByDose(exercises, 1)[0].sets.length, 4);
    assert.equal(doseScalePercent(0.7), 70);
  });
});
