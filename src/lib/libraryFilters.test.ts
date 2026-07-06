import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { MuscleGroup } from '@/types';
import { EXERCISES } from '@/data/exercises';
import {
  countExerciseHistory,
  filterExercises,
  uniqueMuscleGroups,
} from './libraryFilters';

describe('libraryFilters', () => {
  it('filters by query on name', () => {
    const result = filterExercises(EXERCISES, {
      query: 'squat',
      equipment: '',
      tag: '',
      level: '',
      muscle: '',
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
    });
    assert.ok(result.length > 0);
    assert.ok(
      result.every((e) => (e.equipment || '').toLowerCase().includes('bodyweight'))
    );
  });

  it('filters by muscle chip', () => {
    const muscles = uniqueMuscleGroups(EXERCISES);
    assert.ok(muscles.length > 0);
    const muscle = muscles[0] as MuscleGroup;
    const result = filterExercises(EXERCISES, {
      query: '',
      equipment: '',
      tag: '',
      level: '',
      muscle,
    });
    assert.ok(result.every((e) => e.muscleGroups.includes(muscle)));
  });

  it('counts exercise history appearances', () => {
    const history = [
      { exercises: [{ exerciseId: 'squats' }, { exerciseId: 'push-ups' }] },
      { exercises: [{ exerciseId: 'squats' }] },
    ];
    assert.equal(countExerciseHistory(history, 'squats'), 2);
    assert.equal(countExerciseHistory(history, 'deadlift'), 0);
  });
});
