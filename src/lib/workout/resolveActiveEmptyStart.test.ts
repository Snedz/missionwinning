import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resolveActiveEmptyStart } from './resolveActiveEmptyStart.ts';
import type { CompletedWorkoutLog } from '@/types';
import type { MuscleGroup } from '@/lib/muscleGroups';
import { MAJOR_GROUPS } from '@/lib/muscleGroups';
import type { ReadinessInfo, RecommendedFocus } from '@/lib/score';

const focus: RecommendedFocus = { group: 'Legs', statusKey: 'todayReadinessPrime' };
const readiness = Object.fromEntries(
  MAJOR_GROUPS.map((g) => [g, { days: 99, statusKey: 'todayReadinessPrime' }])
) as Record<MuscleGroup, ReadinessInfo>;

function logDaysAgo(days: number): CompletedWorkoutLog {
  const d = new Date();
  d.setDate(d.getDate() - days);
  const iso = d.toISOString();
  return {
    id: `log-${days}`,
    workoutName: 'Past',
    startedAt: iso,
    completedAt: iso,
    exercises: [
      {
        exerciseId: 'bodyweight-squat',
        sets: [
          { reps: 10, weight: 0 },
          { reps: 10, weight: 0 },
          { reps: 10, weight: 0 },
          { reps: 10, weight: 0 },
        ],
      },
    ],
    durationSeconds: 2400,
    totalVolume: 0,
  };
}

describe('resolveActiveEmptyStart', () => {
  it('cold history → empty freestyle', () => {
    const r = resolveActiveEmptyStart({
      history: [],
      units: 'metric',
      equipment: 'bodyweight',
      focus,
      readiness,
    });
    assert.equal(r.kind, 'empty');
    assert.equal(r.doseScale, 1);
  });

  it('with history → Just Go seeded exercises', () => {
    const r = resolveActiveEmptyStart({
      history: [logDaysAgo(1)],
      units: 'metric',
      equipment: 'bodyweight',
      focus,
      readiness,
    });
    assert.equal(r.kind, 'just_go');
    if (r.kind !== 'just_go') return;
    assert.ok(r.exercises.length >= 1);
    assert.equal(r.doseScale, 1);
  });

  it('long gap → doseScale < 1 and fewer sets than full Just Go', () => {
    const full = resolveActiveEmptyStart({
      history: [logDaysAgo(1)],
      units: 'metric',
      equipment: 'bodyweight',
      focus,
      readiness,
    });
    const eased = resolveActiveEmptyStart({
      history: [logDaysAgo(20)],
      units: 'metric',
      equipment: 'bodyweight',
      focus,
      readiness,
    });
    assert.equal(eased.kind, 'just_go');
    if (eased.kind !== 'just_go' || full.kind !== 'just_go') return;
    assert.ok(eased.doseScale < 1);
    const fullSets = full.exercises.reduce((n, e) => n + e.sets.length, 0);
    const easedSets = eased.exercises.reduce((n, e) => n + e.sets.length, 0);
    assert.ok(
      easedSets <= fullSets,
      `eased ${easedSets} should not exceed full ${fullSets}`
    );
  });
});
