import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatPlusLoadWeightCell,
  formatPrevPlusLoadLabel,
  formatSetLoadLine,
  isPlusLoadExercise,
} from './bodyweightLoad.ts';

describe('isPlusLoadExercise', () => {
  it('marks bodyweight catalog rows and dips', () => {
    assert.equal(isPlusLoadExercise({ id: 'pull-ups', equipment: 'Bodyweight' }), true);
    assert.equal(isPlusLoadExercise({ id: 'push-ups', equipment: 'bodyweight-only' }), true);
    assert.equal(isPlusLoadExercise({ id: 'dips-chair', equipment: 'Chair/Bench' }), true);
    assert.equal(isPlusLoadExercise({ id: 'bench-dips', equipment: 'Bench' }), true);
  });

  it('leaves loaded-bar work alone', () => {
    assert.equal(isPlusLoadExercise({ id: 'bench-press', equipment: 'Barbell' }), false);
    assert.equal(isPlusLoadExercise({ id: 'goblet-squat', equipment: 'Dumbbells' }), false);
    assert.equal(isPlusLoadExercise({ id: 'lat-pulldown', equipment: 'Cable' }), false);
    assert.equal(isPlusLoadExercise(null), false);
    assert.equal(isPlusLoadExercise({ id: 'custom-move' }), false);
  });
});

describe('formatSetLoadLine', () => {
  it('prints BW, BW + belt, and a barbell set', () => {
    assert.equal(
      formatSetLoadLine({ reps: 8, weight: 0, unitLabel: 'kg', plusLoad: true }),
      '8 × BW'
    );
    assert.equal(
      formatSetLoadLine({
        reps: 8,
        weight: 20,
        unitLabel: 'kg',
        bodyweightLabel: 'BW',
        plusLoad: true,
      }),
      '8 × BW + 20 kg'
    );
    assert.equal(
      formatSetLoadLine({ reps: 5, weight: 100, unitLabel: 'kg' }),
      '5 × 100 kg'
    );
  });

  it('does not paint BW+ on a barbell just because weight is positive', () => {
    assert.equal(
      formatSetLoadLine({ reps: 5, weight: 100, unitLabel: 'kg', plusLoad: false }),
      '5 × 100 kg'
    );
  });
});

describe('formatPlusLoadWeightCell', () => {
  it('is the weight-column token', () => {
    assert.equal(formatPlusLoadWeightCell(0), 'BW');
    assert.equal(formatPlusLoadWeightCell(20), 'BW+20');
  });
});

describe('formatPrevPlusLoadLabel', () => {
  it('stays compact for the prev slot', () => {
    assert.equal(formatPrevPlusLoadLabel(8, 0), '8 × BW');
    assert.equal(formatPrevPlusLoadLabel(8, 20), '8 × BW+20');
  });
});
