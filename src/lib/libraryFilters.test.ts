import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import type { MuscleGroup } from '@/types';
import { EXERCISES, ensureFullExerciseCatalog } from '@/data/exercises';
import {
  countExerciseHistory,
  libraryExerciseVolumeSpark,
  filterExercises,
  uniqueMuscleGroups,
} from './libraryFilters';
import { inferFormPattern } from './formPatterns';

describe('libraryFilters', () => {
  before(async () => {
    await ensureFullExerciseCatalog();
  });
  it('filters by query on name', () => {
    const result = filterExercises(EXERCISES, {
      query: 'squat',
      equipment: '',
      tag: '',
      level: '',
      muscle: '',
      pattern: '',
    });
    assert.ok(result.length > 0);
    assert.ok(result.every((e) => e.name.toLowerCase().includes('squat')));
  });

  it('filters by equipment', () => {
    const result = filterExercises(EXERCISES, {
      query: '',
      equipment: 'bodyweight',
      tag: '',
      level: '',
      muscle: '',
      pattern: '',
    });
    assert.ok(result.length > 0);
    assert.ok(
      result.every((e) => (e.equipment || '').toLowerCase().includes('bodyweight'))
    );
  });

  it('filters by muscle chip', () => {
    const muscles = uniqueMuscleGroups(EXERCISES, 'en');
    assert.ok(muscles.length > 0);
    const muscle = muscles[0] as MuscleGroup;
    const result = filterExercises(EXERCISES, {
      query: '',
      equipment: '',
      tag: '',
      level: '',
      muscle,
      pattern: '',
    });
    assert.ok(result.every((e) => e.muscleGroups.includes(muscle)));
  });

  it('filters by movement pattern (hinge)', () => {
    const result = filterExercises(EXERCISES, {
      query: '',
      equipment: '',
      tag: '',
      level: '',
      muscle: '',
      pattern: 'hinge',
    });
    assert.ok(result.length > 0, 'expected hinge-family movements');
    assert.ok(result.every((e) => inferFormPattern(e.id, e) === 'hinge'));
    assert.ok(
      result.some((e) => e.id === 'deadlift' || e.name.toLowerCase().includes('deadlift')),
      'deadlift should appear under hinge'
    );
  });

  it('counts exercise history appearances', () => {
    const history = [
      { exercises: [{ exerciseId: 'squats' }, { exerciseId: 'push-ups' }] },
      { exercises: [{ exerciseId: 'squats' }] },
    ];
    assert.equal(countExerciseHistory(history, 'squats'), 2);
    assert.equal(countExerciseHistory(history, 'deadlift'), 0);
  });

  it('skips tombstones — deleted Monday is not a library session (.1010)', () => {
    const history = [
      {
        deletedAt: '2026-08-25T12:00:00.000Z',
        exercises: [
          {
            exerciseId: 'squats',
            sets: [{ reps: 5, weight: 100, kind: 'normal' as const }],
          },
        ],
      },
      {
        exercises: [
          {
            exerciseId: 'squats',
            sets: [{ reps: 5, weight: 80, kind: 'normal' as const }],
          },
        ],
      },
    ];
    assert.equal(countExerciseHistory(history, 'squats'), 1);
    assert.deepEqual(libraryExerciseVolumeSpark(history, 'squats'), [400]);
    assert.deepEqual(libraryExerciseVolumeSpark([], 'squats'), []);
  });
});
