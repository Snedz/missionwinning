import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatWorkoutVolumeDisplay, sumWorkingReps } from '@/lib/workout/volumeDisplay';

describe('formatWorkoutVolumeDisplay', () => {
  it('shows reps when tonnage is zero', () => {
    const out = formatWorkoutVolumeDisplay(0, 24, 'lbs', (n) => String(n));
    assert.equal(out.value, '24');
    assert.equal(out.unit, 'reps');
  });

  it('shows load when tonnage is positive', () => {
    const out = formatWorkoutVolumeDisplay(1200, 0, 'kg', (n) => String(n));
    assert.equal(out.value, '1200');
    assert.equal(out.unit, 'kg');
  });
});

describe('sumWorkingReps', () => {
  it('sums non-warmup sets', () => {
    const reps = sumWorkingReps([
      {
        sets: [
          { reps: 10, kind: 'normal' },
          { reps: 5, kind: 'warmup' },
        ],
      },
    ]);
    assert.equal(reps, 10);
  });
});
