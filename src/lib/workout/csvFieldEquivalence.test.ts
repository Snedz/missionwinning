import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  compareRows,
  claimsByteForByteRoundTrip,
  CORE_FIELDS,
  type NormRow,
} from './csvFieldEquivalence';

describe('compareRows', () => {
  it('identical core fields → equal true, mismatches [], unverified []', () => {
    const left: NormRow = {
      exercise: 'squat',
      sets: 3,
      reps: 5,
      weight_value: 100,
      weight_unit: 'kg',
      timestamp: '2024-01-01',
    };
    const right: NormRow = {
      exercise: 'squat',
      sets: 3,
      reps: 5,
      weight_value: 100,
      weight_unit: 'kg',
      timestamp: '2024-01-01',
    };

    const result = compareRows(left, right);

    assert.equal(result.equal, true);
    assert.deepEqual(result.mismatches, []);
    assert.deepEqual(result.unverified, []);
  });

  it('reps differs → equal false, one mismatch on reps', () => {
    const left: NormRow = {
      exercise: 'squat',
      sets: 3,
      reps: 5,
      weight_value: 100,
      weight_unit: 'kg',
      timestamp: '2024-01-01',
    };
    const right: NormRow = {
      exercise: 'squat',
      sets: 3,
      reps: 6,
      weight_value: 100,
      weight_unit: 'kg',
      timestamp: '2024-01-01',
    };

    const result = compareRows(left, right);

    assert.equal(result.equal, false);
    assert.equal(result.mismatches.length, 1);
    assert.equal(result.mismatches[0].field, 'reps');
    assert.equal(result.mismatches[0].left, 5);
    assert.equal(result.mismatches[0].right, 6);
  });

  it('missing weight_value on right counts as null mismatch when left has a number', () => {
    const left: NormRow = {
      exercise: 'squat',
      sets: 3,
      reps: 5,
      weight_value: 100,
      weight_unit: 'kg',
      timestamp: '2024-01-01',
    };
    const right: NormRow = {
      exercise: 'squat',
      sets: 3,
      reps: 5,
      weight_unit: 'kg',
      timestamp: '2024-01-01',
    };

    const result = compareRows(left, right);

    assert.equal(result.equal, false);
    assert.equal(result.mismatches.length, 1);
    assert.equal(result.mismatches[0].field, 'weight_value');
    assert.equal(result.mismatches[0].left, 100);
    assert.equal(result.mismatches[0].right, null);
  });

  it('extra key notes on left → unverified includes notes, equal still true when cores match', () => {
    const left: NormRow = {
      exercise: 'squat',
      sets: 3,
      reps: 5,
      weight_value: 100,
      weight_unit: 'kg',
      timestamp: '2024-01-01',
      notes: 'felt good',
    };
    const right: NormRow = {
      exercise: 'squat',
      sets: 3,
      reps: 5,
      weight_value: 100,
      weight_unit: 'kg',
      timestamp: '2024-01-01',
    };

    const result = compareRows(left, right);

    assert.equal(result.equal, true);
    assert.deepEqual(result.unverified, ['notes']);
  });

  it('both sides empty objects → all core fields missing → equal true (both null)', () => {
    const left: NormRow = {};
    const right: NormRow = {};

    const result = compareRows(left, right);

    assert.equal(result.equal, true);
    assert.deepEqual(result.mismatches, []);
    assert.deepEqual(result.unverified, []);
  });
});

describe('claimsByteForByteRoundTrip', () => {
  it('returns true for text containing byte-for-byte', () => {
    assert.equal(claimsByteForByteRoundTrip('byte-for-byte after normalization'), true);
    assert.equal(claimsByteForByteRoundTrip('byte for byte round trip'), true);
    assert.equal(claimsByteForByteRoundTrip('byte-for-byte round trip'), true);
  });

  it('returns false for text not containing byte-for-byte', () => {
    assert.equal(claimsByteForByteRoundTrip('field-level match'), false);
    assert.equal(claimsByteForByteRoundTrip('equivalence'), false);
    assert.equal(claimsByteForByteRoundTrip(''), false);
  });
});

describe('CORE_FIELDS constant', () => {
  it('contains the six required fields', () => {
    assert.deepEqual(CORE_FIELDS, [
      'exercise',
      'sets',
      'reps',
      'weight_value',
      'weight_unit',
      'timestamp',
    ]);
  });
});
