import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  relatedExercises,
  muscleFromSlug,
  muscleHubSlug,
  enrichExerciseForPublic,
  exercisesForMuscle,
  equipmentHubFromSlug,
} from '@/lib/exerciseSeo';
import { EXERCISES } from '@/data/exercises';

describe('exerciseSeo', () => {
  it('maps muscle hub slugs', () => {
    assert.equal(muscleHubSlug('Chest'), 'chest');
    assert.equal(muscleFromSlug('chest'), 'Chest');
    assert.equal(muscleFromSlug('nope'), null);
  });

  it('returns related exercises for same muscle', () => {
    const bench = EXERCISES.find((e) => e.id === 'bench-press') ?? EXERCISES[0];
    const related = relatedExercises(bench, 4);
    assert.ok(related.length > 0);
    assert.ok(related.every((e) => e.id !== bench.id));
  });

  it('enriches thin exercises with alternatives', () => {
    const squat = EXERCISES.find((e) => e.id === 'squats');
    assert.ok(squat);
    const enriched = enrichExerciseForPublic(squat!);
    assert.ok((enriched.alternatives?.length ?? 0) > 0 || squat!.alternatives?.length);
  });

  it('lists chest and bodyweight hubs', () => {
    assert.ok(exercisesForMuscle('Chest').length > 5);
    assert.ok(equipmentHubFromSlug('bodyweight'));
  });
});
