import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  computeReadiness,
  getRecommendedFocus,
  computeWinScore,
  computeBodyScores,
  getCoachInsight,
} from '@/lib/score';
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
      totalSessions: 100,
      totalVolume: 50000,
      savedCount: 10,
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
      totalSessions: 0,
      totalVolume: 0,
      savedCount: 0,
    };
    const without = computeWinScore({ ...base, fuelCoachActive: 0 });
    const withCoach = computeWinScore({ ...base, fuelCoachActive: 1 });
    assert.ok(withCoach.pillars.fuel > without.pillars.fuel);
    assert.equal(withCoach.pillars.fuel - without.pillars.fuel, 3);
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

  it('applies optional educational cycle readinessBias after check-in', () => {
    const base = computeBodyScores([]);
    const adj = computeBodyScores([], { readinessBias: -8 });
    assert.equal(adj.readiness, Math.max(0, base.readiness - 8));
  });
});
