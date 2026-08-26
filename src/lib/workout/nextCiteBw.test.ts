/**
 * Next cite is BW, not 0 kg (`.1009`).
 * Victory/Prev already honest. Live Next/Last still printed 0.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatAfterCompleteParts } from './setRowAdjacency.ts';
import { formatSetRowLine, formatSetRowPrev } from './setRowType.ts';
import type { AfterCompleteCite } from './setRowAdjacency.ts';

const t = (key: string, opts?: Record<string, unknown>) =>
  String(opts?.defaultValue ?? key);

function loadCite(reps: number, weight: number): AfterCompleteCite {
  return {
    suggestion: { kind: 'load', reps, weight },
    cite: { kind: 'session', setFrom: 1, setTo: 1 },
  };
}

describe('next cite is BW, not 0 kg (.1009)', () => {
  it('bodyweight after-complete cite prints BW, not 0', () => {
    const parts = formatAfterCompleteParts(loadCite(8, 0), t, undefined, null, {
      rowType: 'bodyweight',
    });
    assert.equal(parts.target, '8 × BW');
    assert.doesNotMatch(parts.target, /0/);
  });

  it('vest prints BW+load on the compact cite', () => {
    const parts = formatAfterCompleteParts(loadCite(8, 20), t, undefined, null, {
      rowType: 'bodyweight',
    });
    assert.equal(parts.target, '8 × BW+20');
  });

  it('loaded cite stays reps × weight', () => {
    const parts = formatAfterCompleteParts(loadCite(5, 100), t);
    assert.equal(parts.target, '5 × 100');
  });

  it('header grammar prints Next: 8 × BW with unit line helper', () => {
    assert.equal(
      formatSetRowLine({
        type: 'bodyweight',
        reps: 8,
        weight: 0,
        unitLabel: 'kg',
        bodyweightLabel: 'BW',
      }),
      '8 × BW'
    );
    assert.equal(
      formatSetRowLine({
        type: 'bodyweight',
        reps: 8,
        weight: 20,
        unitLabel: 'kg',
        bodyweightLabel: 'BW',
      }),
      '8 × BW + 20 kg'
    );
    assert.equal(
      formatSetRowLine({
        type: 'weight',
        reps: 5,
        weight: 100,
        unitLabel: 'kg',
      }),
      '5 × 100 kg'
    );
  });

  it('ghost grammar matches Prev, not 0 kg', () => {
    assert.equal(
      formatSetRowPrev({
        type: 'bodyweight',
        reps: 8,
        weight: 0,
        bodyweightLabel: 'BW',
      }),
      '8 × BW'
    );
  });
});
