import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { exerciseCraftBlurb } from './exerciseCraftBlurb';
import type { Exercise } from '@/types';

const base: Exercise = {
  id: 'test-lift',
  name: 'Test Lift',
  muscleGroups: ['Legs', 'Core'],
  equipment: 'Barbell',
};

describe('exerciseCraftBlurb', () => {
  it('uses the first cue sentence when present', () => {
    const blurb = exerciseCraftBlurb({
      ...base,
      cues: 'Hips back first. Bar stays close.',
    });
    assert.equal(blurb, 'Hips back first');
  });

  it('falls back to pattern · muscles · equipment without cues', () => {
    const blurb = exerciseCraftBlurb({
      ...base,
      id: 'deadlift',
      name: 'Deadlift',
    });
    assert.match(blurb, /Hinge/i);
    assert.match(blurb, /Legs/);
    assert.match(blurb, /Barbell/);
  });

  it('truncates very long cue lines', () => {
    const long = `${'a'.repeat(130)}. more`;
    const blurb = exerciseCraftBlurb({ ...base, cues: long });
    assert.ok(blurb.length <= 120);
    assert.ok(blurb.endsWith('…'));
  });
});
