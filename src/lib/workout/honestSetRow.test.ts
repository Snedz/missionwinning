import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatSetRow, formatSetSheet, type HonestSetInput } from './honestSetRow';

describe('formatSetRow', () => {
  it('formats working set with all fields', () => {
    const result = formatSetRow({
      type: 'working',
      weightKg: 100,
      reps: 5,
      rpe: 8,
      rir: 2,
    });
    assert.equal(result.text, 'S · 100 kg · 5 reps · RPE 8 · RIR 2');
    assert.equal(result.ok, true);
  });

  it('handles missing RPE and RIR', () => {
    const result = formatSetRow({
      type: 'working',
      weightKg: 100,
      reps: 5,
      rpe: null,
      rir: undefined,
    });
    assert.equal(result.text.endsWith('RPE — · RIR —'), true);
    assert.equal(result.ok, true);
    assert.deepEqual(result.issues, []);
  });

  it('flags unknown RPE value', () => {
    const result = formatSetRow({
      type: 'working',
      weightKg: 100,
      reps: 5,
      rpe: 14,
    });
    assert.equal(result.text.includes('RPE —'), true);
    assert.equal(result.issues.includes('rpe unknown'), true);
  });

  it('flags drop set without parentIndex', () => {
    const result = formatSetRow({
      type: 'drop',
      weightKg: 80,
      reps: 5,
      parentIndex: null,
    });
    assert.equal(result.issues.includes('drop without parent'), true);
  });

  it('flags failure without reps', () => {
    const result = formatSetRow({
      type: 'failure',
      weightKg: 100,
      reps: null,
    });
    assert.equal(result.issues.includes('failure without reps'), true);
  });
});

describe('formatSetSheet', () => {
  it('detects duplicate consecutive rows', () => {
    const rows: HonestSetInput[] = [
      { type: 'working', weightKg: 100, reps: 5, rpe: 8, rir: 2 },
      { type: 'working', weightKg: 100, reps: 5, rpe: 8, rir: 2 },
    ];
    const result = formatSetSheet(rows);
    assert.equal(result.issues.includes('row 2: duplicate row'), true);
    assert.equal(result.lines[0], '1. S · 100 kg · 5 reps · RPE 8 · RIR 2');
    assert.equal(result.lines[1], '2. S · 100 kg · 5 reps · RPE 8 · RIR 2');
  });

  it('handles empty sheet', () => {
    const result = formatSetSheet([]);
    assert.deepEqual(result.lines, []);
    assert.deepEqual(result.issues, ['empty sheet']);
  });
});
