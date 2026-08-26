/**
 * Last cite is BW, not 0, on empty load (`.1017`).
 * Next already uses formatSetLoadLine (8 × BW). Prev still interpolated 8 × 0.
 * Custom stays type weight. Do not smash duration / assisted.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatAfterCompleteParts } from './setRowAdjacency.ts';
import { formatPrevSetLabels } from './activeWorkoutHelpers.ts';
import { formatSetRowLine, formatSetRowPrev, resolveSetRowType } from './setRowType.ts';
import type { AfterCompleteCite } from './setRowAdjacency.ts';
import type { CompletedWorkoutLog } from '@/types';

const t = (key: string, opts?: Record<string, unknown>) =>
  String(opts?.defaultValue ?? key);

function loadCite(reps: number, weight: number): AfterCompleteCite {
  return {
    suggestion: { kind: 'load', reps, weight },
    cite: { kind: 'session', setFrom: 1, setTo: 1 },
  };
}

function hist(exerciseId: string, sets: { reps: number; weight: number }[]): CompletedWorkoutLog[] {
  return [
    {
      id: 'h1',
      workoutName: 'W',
      startedAt: '2026-08-17T10:00:00.000Z',
      completedAt: '2026-08-17T11:00:00.000Z',
      durationSeconds: 3600,
      totalVolume: 0,
      exercises: [{ exerciseId, sets: sets.map((s) => ({ ...s, kind: 'normal' as const })) }],
    },
  ];
}

describe('empty load cite is BW, not 0 (.1017)', () => {
  it('Next and Last agree on weight-type 0 — 8 × BW, not 8 × 0', () => {
    const line = formatSetRowLine({
      type: 'weight',
      reps: 8,
      weight: 0,
      unitLabel: 'kg',
      bodyweightLabel: 'BW',
    });
    const prev = formatSetRowPrev({
      type: 'weight',
      reps: 8,
      weight: 0,
      bodyweightLabel: 'BW',
    });
    assert.equal(line, '8 × BW');
    assert.equal(prev, '8 × BW');
    assert.doesNotMatch(prev, /8 × 0/);
  });

  it('loaded stays reps × weight — not BW+100', () => {
    assert.equal(
      formatSetRowPrev({ type: 'weight', reps: 5, weight: 100, bodyweightLabel: 'BW' }),
      '5 × 100'
    );
    assert.equal(
      formatSetRowLine({
        type: 'weight',
        reps: 5,
        weight: 100,
        unitLabel: 'kg',
        bodyweightLabel: 'BW',
      }),
      '5 × 100 kg'
    );
  });

  it('after-complete empty load prints BW, not 0', () => {
    const parts = formatAfterCompleteParts(loadCite(8, 0), t, undefined, null, {
      rowType: 'weight',
    });
    assert.equal(parts.target, '8 × BW');
    assert.doesNotMatch(parts.target, /0/);
  });

  it('Prev column fallback without rowType still not 8 × 0', () => {
    const labels = formatPrevSetLabels(hist('unknown-move', [{ reps: 8, weight: 0 }]), 'unknown-move', 1);
    assert.equal(labels[0], '8 × BW');
  });

  it('custom id stays weight — do not guess assisted from the name', () => {
    assert.equal(
      resolveSetRowType({ id: 'custom-bbbb', name: 'Assisted pull-ups' }),
      'weight'
    );
  });
});
