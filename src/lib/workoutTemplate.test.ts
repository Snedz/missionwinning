import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { templateSetsToLogged } from '@/lib/workoutTemplate';

describe('templateSetsToLogged', () => {
  it('honors per-set reps and weight from template', () => {
    const sets = templateSetsToLogged(
      {
        exerciseId: 'bench-press',
        sets: [
          { reps: 8, weight: 60 },
          { reps: 6, weight: 70 },
          { reps: 4, weight: 80 },
        ],
      },
      1000
    );
    assert.equal(sets.length, 3);
    assert.equal(sets[0].reps, 8);
    assert.equal(sets[0].weight, 60);
    assert.equal(sets[1].reps, 6);
    assert.equal(sets[1].weight, 70);
    assert.equal(sets[2].reps, 4);
    assert.equal(sets[2].weight, 80);
    assert.equal(sets[0].completed, false);
    assert.equal(sets[0].kind, 'normal');
  });
});
