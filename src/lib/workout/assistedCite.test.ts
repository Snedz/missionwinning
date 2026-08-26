/**
 * Next cite is BW, not 8 × 0 kg, on assisted 0 (`.1015`).
 * BW cite `.1009` closed the vest-0 path. Assisted 0 still printed 0 kg.
 * Help still prints minus. Missing invents no kg.
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

describe('assisted cite is BW, not 0 kg (.1015)', () => {
  it('assisted 0 does not invent 8 × 0 kg', () => {
    assert.equal(
      formatSetRowLine({
        type: 'assisted',
        reps: 8,
        weight: 0,
        unitLabel: 'kg',
        bodyweightLabel: 'BW',
      }),
      '8 × BW'
    );
    assert.doesNotMatch(
      formatSetRowLine({
        type: 'assisted',
        reps: 8,
        weight: 0,
        unitLabel: 'kg',
        bodyweightLabel: 'BW',
      }),
      /0 kg/
    );
    assert.equal(
      formatSetRowPrev({
        type: 'assisted',
        reps: 8,
        weight: 0,
        bodyweightLabel: 'BW',
      }),
      '8 × BW'
    );
  });

  it('help still prints minus — 20 kg of help is not BW', () => {
    assert.equal(
      formatSetRowLine({
        type: 'assisted',
        reps: 8,
        weight: 20,
        unitLabel: 'kg',
        bodyweightLabel: 'BW',
      }),
      '8 × −20 kg'
    );
    assert.equal(
      formatSetRowPrev({
        type: 'assisted',
        reps: 8,
        weight: 20,
        bodyweightLabel: 'BW',
      }),
      '8 × −20'
    );
  });

  it('after-complete assisted 0 prints BW, not 0', () => {
    const parts = formatAfterCompleteParts(loadCite(8, 0), t, undefined, null, {
      rowType: 'assisted',
    });
    assert.equal(parts.target, '8 × BW');
    assert.doesNotMatch(parts.target, /0/);
  });

  it('after-complete help stays minus', () => {
    const parts = formatAfterCompleteParts(loadCite(8, 20), t, undefined, null, {
      rowType: 'assisted',
    });
    assert.equal(parts.target, '8 × −20');
  });

  it('loaded cite stays reps × weight — this hop is not a barbell rewrite', () => {
    const parts = formatAfterCompleteParts(loadCite(5, 100), t);
    assert.equal(parts.target, '5 × 100');
  });
});
