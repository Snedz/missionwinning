/**
 * Session dial wiring — prescribed must not see freestyle history; template
 * defaults must not invent weight as 0 while ignoring set.weight.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  planExerciseTargetPatches,
  resolveSessionSetDial,
  setDialTemplateDefaults,
} from './activeSetDial.ts';
import type { CompletedWorkoutLog } from '@/types';

const root = path.join(import.meta.dirname, '..', '..', '..');

function historyWith(
  exerciseId: string,
  sets: { reps: number; weight: number }[]
): CompletedWorkoutLog[] {
  return [
    {
      id: 'h1',
      workoutName: 'Prior',
      startedAt: '2099-01-01T00:00:00.000Z',
      completedAt: '2099-01-01T01:00:00.000Z',
      durationSeconds: 3600,
      totalVolume: 1000,
      exercises: [{ exerciseId, sets: sets.map((s) => ({ ...s, completed: true })) }],
    },
  ];
}

describe('setDialTemplateDefaults', () => {
  it('falls back to 10 / 0 when the set is missing', () => {
    assert.deepEqual(setDialTemplateDefaults(undefined), {
      defaultReps: 10,
      defaultWeight: 0,
    });
  });

  it('keeps the set\'s own numbers (the .206 spelling)', () => {
    assert.deepEqual(setDialTemplateDefaults({ reps: 5, weight: 100 }), {
      defaultReps: 5,
      defaultWeight: 100,
    });
  });

  it('fills only the missing field', () => {
    assert.deepEqual(setDialTemplateDefaults({ reps: 8 }), {
      defaultReps: 8,
      defaultWeight: 0,
    });
  });
});

describe('resolveSessionSetDial', () => {
  it('returns template defaults when the exercise slot is missing', () => {
    assert.deepEqual(
      resolveSessionSetDial({
        exLog: undefined,
        setIdx: 0,
        defaultReps: 10,
        defaultWeight: 0,
        workoutHistory: [],
        units: 'metric',
        goalId: 'strength',
      }),
      { reps: 10, weight: 0 }
    );
  });

  it('prescribed ignores history that would otherwise suggest different numbers', () => {
    const history = historyWith('squat', [{ reps: 12, weight: 60 }]);
    const dial = resolveSessionSetDial({
      exLog: {
        exerciseId: 'squat',
        prescribed: true,
        sets: [{ completed: false, reps: 5, weight: 100 }],
      },
      setIdx: 0,
      defaultReps: 5,
      defaultWeight: 100,
      workoutHistory: history,
      units: 'metric',
      goalId: 'strength',
    });
    assert.equal(dial.reps, 5);
    assert.equal(dial.weight, 100);
  });

  it('manual wins over prescription', () => {
    const dial = resolveSessionSetDial({
      exLog: {
        exerciseId: 'squat',
        prescribed: true,
        sets: [{ completed: false, reps: 5, weight: 100 }],
      },
      setIdx: 0,
      defaultReps: 5,
      defaultWeight: 100,
      manual: { reps: 3, weight: 110 },
      workoutHistory: [],
      units: 'metric',
      goalId: 'strength',
    });
    assert.deepEqual(dial, { reps: 3, weight: 110 });
  });
});

describe('planExerciseTargetPatches', () => {
  it('prescribed open sets echo the prescription as reps-then-weight patches', () => {
    const patches = planExerciseTargetPatches({
      prescribed: true,
      sets: [
        { completed: false, reps: 5, weight: 100 },
        { completed: true, reps: 5, weight: 100 },
        { completed: false, reps: 5, weight: 100 },
      ],
      lastSets: [{ reps: 12, weight: 60 }],
      units: 'metric',
      goalId: 'strength',
    });
    assert.deepEqual(patches, [
      {
        setIdx: 0,
        patches: [
          { field: 'reps', value: 5 },
          { field: 'weight', value: 100 },
        ],
      },
      {
        setIdx: 2,
        patches: [
          { field: 'reps', value: 5 },
          { field: 'weight', value: 100 },
        ],
      },
    ]);
  });

  it('freestyle with no lastSets yields nothing', () => {
    assert.deepEqual(
      planExerciseTargetPatches({
        prescribed: false,
        sets: [{ completed: false, reps: 10, weight: 0 }],
        lastSets: null,
        units: 'metric',
        goalId: 'general',
      }),
      []
    );
  });
});

describe('ActiveWorkoutPage pins', () => {
  const page = readFileSync(
    path.join(root, 'src/page-components/ActiveWorkoutPage.tsx'),
    'utf8'
  );

  it('uses resolveSessionSetDial — not a page-local resolveActiveSetDial call', () => {
    assert.match(page, /resolveSessionSetDial\(/);
    assert.doesNotMatch(
      page,
      /resolveActiveSetDial\(/,
      'dial wiring must live in activeSetDial — page must not call resolveActiveSetDial'
    );
  });

  it('uses planExerciseTargetPatches — not inline planApplyTargets on the page', () => {
    assert.match(page, /planExerciseTargetPatches\(/);
    assert.doesNotMatch(
      page,
      /planApplyTargets\(/,
      'Apply-targets patches must come from planExerciseTargetPatches'
    );
    assert.doesNotMatch(page, /patchesForApplyTargets\(/);
  });

  it('uses setDialTemplateDefaults for missing-set fallbacks', () => {
    assert.match(page, /setDialTemplateDefaults\(/);
    assert.doesNotMatch(
      page,
      /set\?\.reps \?\? 10,\s*set\?\.weight \?\? 0/,
      'hardcoded 10,0 next to set? is the .206 defect class'
    );
  });
});
