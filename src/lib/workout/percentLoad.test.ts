/**
 * TrainHeroic-style percent-of-max load — resolve e1RM, prescribe weight from loadPct.
 * Free forever. See docs/DESIGN_RESEARCH.md § Wave 6.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  loadPctFromWeight,
  resolveStartingLoadPct,
  scaleLoadPct,
  suggestLoadPct,
  weightFromLoadPct,
  workingMaxFromHistory,
} from '@/lib/workout/percentLoad';
import type { CompletedWorkoutLog } from '@/types';

function log(
  exerciseId: string,
  sets: { reps: number; weight: number; kind?: 'warmup' | 'normal' | 'drop' | 'failure' }[]
): CompletedWorkoutLog {
  return {
    id: 'l1',
    workoutName: 'T',
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    durationSeconds: 600,
    totalVolume: 100,
    exercises: [{ exerciseId, sets }],
  };
}

describe('percentLoad', () => {
  it('workingMaxFromHistory uses the one shared estimator', () => {
    // 60 × 8 → Brzycki 74 (was uncapped Epley 76 before `.174`). Prescriptions,
    // /benchmarks, the PR chip and the debrief now all quote this number.
    const max = workingMaxFromHistory('bench-press', [
      log('bench-press', [{ reps: 8, weight: 60 }]),
    ]);
    assert.equal(max, 74);
  });

  it('a deleted session cannot inflate the working max', () => {
    const heavy = log('bench-press', [{ reps: 5, weight: 200 }]);
    heavy.deletedAt = new Date().toISOString();
    const max = workingMaxFromHistory('bench-press', [
      heavy,
      log('bench-press', [{ reps: 8, weight: 60 }]),
    ]);
    assert.equal(max, 74, 'the tombstoned 200 kg session must not count');
  });

  it('an endurance-only history yields null rather than a fabricated max', () => {
    // No 1RM formula is fitted above 12 reps; null tells nextTargets to prescribe
    // from the last session instead, which is correct for this athlete.
    const max = workingMaxFromHistory('bench-press', [
      log('bench-press', [{ reps: 20, weight: 40 }]),
    ]);
    assert.equal(max, null);
  });

  it('workingMaxFromHistory prefers true 1RM when present', () => {
    const max = workingMaxFromHistory('bench-press', [
      log('bench-press', [
        { reps: 5, weight: 70 },
        { reps: 1, weight: 100 },
      ]),
    ]);
    assert.equal(max, 100);
  });

  it('workingMaxFromHistory ignores warmup and bodyweight zeros', () => {
    const max = workingMaxFromHistory('squat', [
      log('squat', [
        { reps: 5, weight: 40, kind: 'warmup' },
        { reps: 8, weight: 0 },
      ]),
    ]);
    assert.equal(max, null);
  });

  it('suggestLoadPct clamps by experience and goal', () => {
    assert.equal(suggestLoadPct('beginner', 'general'), 70);
    assert.equal(suggestLoadPct('advanced', 'strength'), 85);
    assert.equal(suggestLoadPct('intermediate', 'fat_loss'), 70);
  });

  it('weightFromLoadPct rounds to unit step', () => {
    assert.equal(weightFromLoadPct(100, 80, 'metric'), 80);
    assert.equal(weightFromLoadPct(76, 80, 'metric'), 60); // 60.8 → 60
    assert.equal(weightFromLoadPct(127, 81, 'imperial'), 105); // 102.87 → 105
  });

  it('loadPctFromWeight rounds percent', () => {
    assert.equal(loadPctFromWeight(100, 80), 80);
    assert.equal(loadPctFromWeight(76, 60), 79);
    assert.equal(loadPctFromWeight(0, 60), null);
  });

  it('resolveStartingLoadPct prefers last weight ratio in band', () => {
    const pct = resolveStartingLoadPct({
      workingMax: 100,
      lastWeight: 80,
      experience: 'beginner',
      goalId: 'general',
    });
    assert.equal(pct, 80);
  });

  it('resolveStartingLoadPct falls back outside band', () => {
    const pct = resolveStartingLoadPct({
      workingMax: 100,
      lastWeight: 30,
      experience: 'intermediate',
      goalId: 'strength',
    });
    assert.equal(pct, 80); // 75+5
  });

  it('scaleLoadPct rounds and clamps', () => {
    assert.equal(scaleLoadPct(80, 0.9), 72);
    assert.equal(scaleLoadPct(undefined, 0.9), undefined);
  });
});
