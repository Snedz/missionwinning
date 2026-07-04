import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { computeReadiness } from '@/lib/score';
import { pickExercises } from '@/lib/coach/selector';
import { mulberry32 } from '@/lib/coach/rng';
import type { CoachContext, SplitDay } from '@/lib/coach/types';
import type { CompletedWorkoutLog } from '@/types';

function baseCtx(overrides: Partial<CoachContext> = {}): CoachContext {
  return {
    experience: 'beginner',
    equipment: 'bodyweight',
    goalId: 'general',
    daysPerWeek: 3,
    preferredDays: [],
    history: [],
    readiness: computeReadiness([]),
    bodyScores: {
      readiness: 70,
      strain: 40,
      recovery: 70,
      readinessLabelKey: 'todayBodyTrainSmart',
      strainLabelKey: 'todayBodyLightWeek',
      recoveryLabelKey: 'todayBodyFullyRecovered',
    },
    units: 'metric',
    seedId: 'test-seed',
    ...overrides,
  };
}

const strengthDay: SplitDay = {
  kind: 'strength',
  focusGroups: ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'],
  nameKey: 'coachSessionFullBody',
};

describe('pickExercises', () => {
  it('respects bodyweight equipment', () => {
    const ctx = baseCtx({ equipment: 'bodyweight' });
    const { exercises } = pickExercises(strengthDay, ctx, mulberry32(42));
    for (const ex of exercises) {
      assert.ok(
        !['bench-press', 'barbell-row', 'deadlift'].includes(ex.exerciseId),
        `barbell exercise ${ex.exerciseId} should not appear`
      );
    }
  });

  it('ranks history exercises higher (deterministic seed)', () => {
    const history: CompletedWorkoutLog[] = [
      {
        id: '1',
        workoutName: 'A',
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        durationSeconds: 600,
        totalVolume: 100,
        exercises: [{ exerciseId: 'push-ups', sets: [{ reps: 10, weight: 0 }] }],
      },
    ];
    const ctx = baseCtx({ history });
    const { exercises } = pickExercises(strengthDay, ctx, mulberry32(99));
    assert.ok(exercises.some((e) => e.exerciseId === 'push-ups'));
  });

  it('recovery day uses loggable mobility ids', () => {
    const recovery: SplitDay = {
      kind: 'recovery',
      focusGroups: ['Core'],
      nameKey: 'coachSessionRecovery',
    };
    const { exercises } = pickExercises(recovery, baseCtx(), mulberry32(1));
    assert.equal(exercises.length, 4);
    const allowed = new Set(['cat-camel', 'bird-dog', 'dead-bug', 'glute-bridge', 'worlds-greatest-stretch', 'thread-needle', 'wall-angels', 'couch-stretch']);
    for (const ex of exercises) {
      assert.ok(allowed.has(ex.exerciseId), ex.exerciseId);
    }
  });

  it('same seed produces same picks', () => {
    const ctx = baseCtx({ seedId: 'determinism' });
    const a = pickExercises(strengthDay, ctx, mulberry32(12345));
    const b = pickExercises(strengthDay, ctx, mulberry32(12345));
    assert.deepEqual(
      a.exercises.map((e) => e.exerciseId),
      b.exercises.map((e) => e.exerciseId)
    );
  });
});
