import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  computeReadiness,
  getRecommendedFocus,
  computeWinScore,
  computeBodyScores,
  getCoachInsight,
} from '@/lib/score';
import {
  countSessionsThisWeek,
  sumHistoryVolume,
  sumVolumeThisWeek,
} from '@/lib/workout/historyVolume';
import type { CompletedWorkoutLog } from '@/types';

function chestWorkout(daysAgo: number): CompletedWorkoutLog {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return {
    id: `log-${daysAgo}`,
    workoutName: 'Chest',
    startedAt: d.toISOString(),
    completedAt: d.toISOString(),
    durationSeconds: 1800,
    totalVolume: 500,
    exercises: [
      {
        exerciseId: 'bench-press',
        sets: [{ reps: 8, weight: 135 }],
        muscleGroups: ['Chest', 'Arms'],
      },
    ],
  };
}

describe('computeReadiness', () => {
  it('returns prime status when no history', () => {
    const r = computeReadiness([]);
    assert.equal(r.Chest.days, 99);
    assert.equal(r.Chest.statusKey, 'todayReadinessPrime');
  });

  it('marks recently trained group as recovering', () => {
    const r = computeReadiness([chestWorkout(0)]);
    assert.equal(r.Chest.days, 0);
    assert.equal(r.Chest.statusKey, 'todayReadinessRecovering');
  });
});

describe('getRecommendedFocus', () => {
  it('picks the longest-rested major group', () => {
    const readiness = computeReadiness([chestWorkout(0)]);
    const focus = getRecommendedFocus(readiness);
    assert.notEqual(focus.group, 'Chest');
    assert.ok(readiness[focus.group].days >= readiness.Chest.days);
  });
});

describe('computeWinScore', () => {
  it('caps total at 100', () => {
    const score = computeWinScore({
      streak: 30,
      highProteinDays: 30,
      sessionsThisWeek: 20,
      volumeThisWeek: 50000,
      moveFlows: 10,
      mindSessions: 10,
      trackActivities: 10,
      learnLessons: 10,
      trainDaysThisWeek: 7,
    });
    assert.equal(score.total, 100);
  });

  it('adds Fuel Coach synergy bonus when plan is active and protein is logged', () => {
    const base = {
      streak: 0,
      highProteinDays: 3,
      sessionsThisWeek: 0,
      volumeThisWeek: 0,
    };
    const without = computeWinScore({ ...base, fuelCoachActive: 0 });
    const withCoach = computeWinScore({ ...base, fuelCoachActive: 1 });
    assert.ok(withCoach.pillars.fuel > without.pillars.fuel);
    assert.equal(withCoach.pillars.fuel - without.pillars.fuel, 3);
  });
});

/**
 * `.606` — the Mission Score is a weekly grade, so a quiet week must read as one.
 *
 * It did not. `totalSessions` and `totalVolume` were lifetime at both call sites,
 * `savedCount` counted templates saved ever, and the Learn term came from three
 * undated id sets — **≈32 of 100 points that never decayed.** Someone who trained
 * twenty times months ago and nothing this week scored about what someone mid-way
 * through a hard week scored.
 *
 * The guard runs **end to end from a history array**, not from pre-aggregated
 * numbers. Asserting `computeWinScore({sessionsThisWeek: 0, ...}) === 0` on its own
 * is vacuous — it only says zero in, zero out, and would have passed happily
 * throughout the defect, because the defect was never in the arithmetic. It was in
 * *what the callers handed it*. So the fixture is a rich career and the assertion
 * is about what this week extracts from it.
 *
 * No date literals: every timestamp is an offset from now, or the test acquires an
 * expiry date (§6).
 */
describe('the Mission Score decays — a quiet week scores like a quiet week', () => {
  const daysAgo = (n: number): string => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString();
  };

  /** A long, heavy career — every session comfortably outside the current week. */
  const lapsedCareer: CompletedWorkoutLog[] = Array.from({ length: 25 }, (_, i) => ({
    id: `old-${i}`,
    workoutName: 'Full body',
    startedAt: daysAgo(30 + i * 3),
    completedAt: daysAgo(30 + i * 3),
    durationSeconds: 3600,
    totalVolume: 6000,
    exercises: [],
  }));

  it('a career of work contributes nothing to this week', () => {
    // Precondition, asserted rather than assumed: the fixture really is rich, so a
    // zero below means "the week is empty", not "the history was".
    assert.equal(lapsedCareer.length, 25, 'fixture must hold a real career');
    assert.ok(
      sumHistoryVolume(lapsedCareer) >= 100_000,
      `fixture lifetime volume ${sumHistoryVolume(lapsedCareer)} — far above any weekly cap`
    );

    assert.equal(countSessionsThisWeek(lapsedCareer), 0, 'no session falls in the current week');
    assert.equal(sumVolumeThisWeek(lapsedCareer), 0, 'no volume falls in the current week');
  });

  it('scores 0 for a lapsed athlete, from the history rather than from zeros', () => {
    const score = computeWinScore({
      streak: 0,
      highProteinDays: 0,
      sessionsThisWeek: countSessionsThisWeek(lapsedCareer),
      volumeThisWeek: sumVolumeThisWeek(lapsedCareer),
      // Every pillar quiet too — this is the whole point: nothing done, nothing scored.
      moveFlows: 0,
      mindSessions: 0,
      trackActivities: 0,
      learnLessons: 0,
      trainDaysThisWeek: 0,
    });
    assert.equal(
      score.total,
      0,
      'a lapsed athlete scored ~32/100 before .606 — every permanent term must be gone'
    );
    assert.equal(score.pillars.train, 0);
    assert.equal(score.pillars.learn, 0);
  });

  it('this week’s sessions do count, so the guard is not just asserting zero', () => {
    const active = [
      ...lapsedCareer,
      { ...lapsedCareer[0], id: 'new-1', startedAt: daysAgo(0), completedAt: daysAgo(0) },
      { ...lapsedCareer[0], id: 'new-2', startedAt: daysAgo(1), completedAt: daysAgo(1) },
    ];
    // `>= 1`, not `=== 2`: on a Monday, "yesterday" belongs to last week. Asserting 2
    // would be a test that fails one day in seven for a reason that is not a defect.
    assert.ok(countSessionsThisWeek(active) >= 1, 'today is always in the current week');
    assert.ok(sumVolumeThisWeek(active) > 0, 'recent volume counts');

    const score = computeWinScore({
      streak: 2,
      highProteinDays: 0,
      sessionsThisWeek: countSessionsThisWeek(active),
      volumeThisWeek: sumVolumeThisWeek(active),
      trainDaysThisWeek: countSessionsThisWeek(active),
    });
    assert.ok(score.pillars.train > 0, 'training this week must move the Train pillar');
  });

  it('deleted sessions are not this week’s work either', () => {
    const withTombstone: CompletedWorkoutLog[] = [
      { ...lapsedCareer[0], id: 'del-1', startedAt: daysAgo(0), completedAt: daysAgo(0), deletedAt: daysAgo(0) },
    ];
    assert.equal(countSessionsThisWeek(withTombstone), 0, 'a tombstoned log is not a session');
    assert.equal(sumVolumeThisWeek(withTombstone), 0);
  });

  /**
   * Equipment neutrality, from `docs/CLUB_PLAN.md`: *"a bodyweight athlete in a
   * Lagos park earns exactly what a barbell athlete earns for the same
   * consistency. Effort is counted in sessions, not kilograms."*
   *
   * This is why the rebalance did **not** answer "effort should outrank taps" by
   * raising the volume weight — that would price the ICP out of its own score. Days
   * and sessions carry Train; tonnage is a 4-point bonus.
   */
  it('a bodyweight week scores close to a barbell week at equal consistency', () => {
    const common = { streak: 4, highProteinDays: 0, sessionsThisWeek: 4, trainDaysThisWeek: 4 };
    const bodyweight = computeWinScore({ ...common, volumeThisWeek: 0 });
    const barbell = computeWinScore({ ...common, volumeThisWeek: 8000 });
    assert.ok(
      barbell.pillars.train - bodyweight.pillars.train <= 4,
      `tonnage swung Train by ${barbell.pillars.train - bodyweight.pillars.train} — it may not decide the grade`
    );
    assert.ok(bodyweight.pillars.train >= 20, 'four consistent bodyweight sessions is a real week');
  });

  /** Training must outrank tapping through timers — the property the rebalance wanted. */
  it('three training days beat a week of mobility flows', () => {
    const training = computeWinScore({
      streak: 3, highProteinDays: 0, sessionsThisWeek: 3, volumeThisWeek: 0, trainDaysThisWeek: 3,
    });
    const tapping = computeWinScore({
      streak: 0, highProteinDays: 0, sessionsThisWeek: 0, volumeThisWeek: 0, moveFlows: 4,
    });
    assert.ok(
      training.total > tapping.total,
      `training ${training.total} must beat ${tapping.total} from four ~6-minute flows`
    );
  });
});

describe('getCoachInsight', () => {
  it('returns high-risk insight when assessment is high', () => {
    const scores = computeBodyScores([]);
    const focus = getRecommendedFocus(computeReadiness([]));
    const insight = getCoachInsight(scores, focus, { assessmentRisk: 'high' });
    assert.equal(insight.messageKey, 'coachInsightHighRisk');
    assert.equal(insight.actionPath, '/move');
  });
});

describe('computeBodyScores check-in modifiers', () => {
  it('does not change scores when checkIn omitted', () => {
    const a = computeBodyScores([]);
    const b = computeBodyScores([], {});
    assert.equal(a.readiness, b.readiness);
  });

  it('lowers readiness for poor sleep and high soreness', () => {
    const base = computeBodyScores([]);
    const adj = computeBodyScores([], {
      checkIn: { sleep: 1, mood: 3, stress: 3, energy: 3, soreness: 5 },
    });
    assert.ok(adj.readiness < base.readiness);
    assert.ok(base.readiness - adj.readiness <= 15);
  });

  it('raises readiness for good sleep and energy', () => {
    const base = computeBodyScores([]);
    const adj = computeBodyScores([], {
      checkIn: { sleep: 5, mood: 4, stress: 2, energy: 5, soreness: 1 },
    });
    assert.ok(adj.readiness > base.readiness);
    assert.ok(adj.readiness - base.readiness <= 15);
  });
});
