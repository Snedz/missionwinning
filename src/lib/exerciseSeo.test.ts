import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  relatedExercises,
  relatedExercisesByPattern,
  muscleFromSlug,
  muscleHubSlug,
  enrichExerciseForPublic,
  exercisesForMuscle,
  equipmentHubFromSlug,
} from '@/lib/exerciseSeo';
import { EXERCISES } from '@/data/exercises';
import { inferFormPattern } from '@/lib/formPatterns';

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

  it('prefers same movement pattern for related mesh', () => {
    const deadlift = EXERCISES.find((e) => e.id === 'deadlift');
    assert.ok(deadlift);
    const related = relatedExercisesByPattern(deadlift!, 6, inferFormPattern);
    assert.ok(related.length > 0);
    assert.ok(related.every((e) => e.id !== 'deadlift'));
    const samePattern = related.filter(
      (e) => inferFormPattern(e.id, e) === inferFormPattern(deadlift!.id, deadlift!)
    );
    assert.ok(
      samePattern.length >= 1,
      'at least one related should share the hinge pattern'
    );
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
