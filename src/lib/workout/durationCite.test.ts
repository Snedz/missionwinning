/**
 * Next/Last/after-complete cite a hold as 0:45 (`.1014`).
 * Grammar already exists. Cites still dropped durationSeconds.
 * Do not invent time from reps.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatSetRowLine, formatSetRowPrev } from './setRowType.ts';
import { formatAfterCompleteParts, resolveAfterCompleteCite } from './setRowAdjacency.ts';
import type { AfterCompleteCite } from './setRowAdjacency.ts';
import { resolveExerciseNextTarget } from './activeWorkoutHelpers.ts';
import { resolveLastSetGhost, shouldOfferLastSetGhost } from './lastSetGhost.ts';
import type { CompletedWorkoutLog } from '@/types';

const t = (key: string, opts?: Record<string, unknown>) =>
  String(opts?.defaultValue ?? key);

function loadCite(
  reps: number,
  weight: number,
  durationSeconds?: number
): AfterCompleteCite {
  return {
    suggestion: {
      kind: 'load',
      reps,
      weight,
      ...(durationSeconds && durationSeconds > 0 ? { durationSeconds } : {}),
    },
    cite: { kind: 'session', setFrom: 1, setTo: 1 },
  };
}

function plankLog(over: Partial<CompletedWorkoutLog> = {}): CompletedWorkoutLog {
  return {
    id: over.id ?? 'p1',
    workoutName: over.workoutName ?? 'Core',
    startedAt: over.startedAt ?? '2026-08-17T10:00:00.000Z',
    completedAt: over.completedAt ?? '2026-08-17T11:00:00.000Z',
    durationSeconds: 3600,
    totalVolume: 0,
    deletedAt: over.deletedAt,
    exercises: [
      {
        exerciseId: 'plank',
        sets: [{ reps: 0, weight: 0, durationSeconds: 45, kind: 'normal' }],
      },
    ],
    ...over,
  };
}

describe('duration cite (.1014)', () => {
  it('missing durationSeconds does not invent 0:45 from reps', () => {
    assert.equal(
      formatSetRowLine({
        type: 'duration',
        reps: 45,
        weight: 0,
        unitLabel: 'kg',
      }),
      ''
    );
    assert.equal(
      formatSetRowPrev({ type: 'duration', reps: 45, weight: 0 }),
      '—'
    );
  });

  it('after-complete duration cite prints 0:45, not — or 45 × 0', () => {
    const parts = formatAfterCompleteParts(loadCite(0, 0, 45), t, undefined, null, {
      rowType: 'duration',
    });
    assert.equal(parts.target, '0:45');
    assert.doesNotMatch(parts.target, /45 × 0/);
  });

  it('after-complete duration without a hold stays mute — does not invent', () => {
    const parts = formatAfterCompleteParts(loadCite(0, 0), t, undefined, null, {
      rowType: 'duration',
    });
    assert.equal(parts.target, '—');
  });

  it('header grammar prints Next: 0:45 when seconds are passed', () => {
    assert.equal(
      formatSetRowLine({
        type: 'duration',
        reps: 0,
        weight: 0,
        unitLabel: 'kg',
        durationSeconds: 45,
      }),
      '0:45'
    );
  });

  it('ghost grammar prints Last: 0:45 when seconds are passed', () => {
    assert.equal(
      formatSetRowPrev({
        type: 'duration',
        reps: 0,
        weight: 0,
        durationSeconds: 45,
      }),
      '0:45'
    );
  });

  it('last ghost of a plank hold is 45s, not first-ever', () => {
    const ghost = resolveLastSetGhost([plankLog()], 'plank');
    assert.deepEqual(ghost, { reps: 0, weight: 0, durationSeconds: 45 });
  });

  it('0-rep without a hold is still first-ever', () => {
    const empty = plankLog({
      exercises: [{ exerciseId: 'plank', sets: [{ reps: 0, weight: 0, kind: 'normal' }] }],
    });
    assert.equal(resolveLastSetGhost([empty], 'plank'), null);
  });

  it('ghost offer compares the hold, not only reps × weight', () => {
    assert.equal(
      shouldOfferLastSetGhost(
        { reps: 0, weight: 0, durationSeconds: 45 },
        { reps: 0, weight: 0, durationSeconds: 45 }
      ),
      false
    );
    assert.equal(
      shouldOfferLastSetGhost(
        { reps: 0, weight: 0, durationSeconds: 45 },
        { reps: 0, weight: 0, durationSeconds: 0 }
      ),
      true
    );
  });

  it('Next copies last hold — does not add a second or invent from reps', () => {
    const out = resolveExerciseNextTarget({
      sets: [{ reps: 0, weight: 0, completed: false }],
      prescribed: false,
      lastSets: [{ reps: 0, weight: 0, durationSeconds: 45 }],
      units: 'metric',
    });
    assert.equal(out?.durationSeconds, 45);
    assert.equal(out?.reps, 0);
    assert.notEqual(out?.durationSeconds, 46);
  });

  it('Next stays quiet when last has no hold', () => {
    assert.equal(
      resolveExerciseNextTarget({
        sets: [{ reps: 0, weight: 0, completed: false }],
        prescribed: false,
        lastSets: [{ reps: 0, weight: 0 }],
        units: 'metric',
      }),
      null
    );
  });

  it('after-complete from last plank session cites 0:45', () => {
    const out = resolveAfterCompleteCite({
      workoutHistory: [plankLog()],
      exerciseId: 'plank',
      sessionSets: [
        { reps: 0, weight: 0, durationSeconds: 45, completed: true, kind: 'normal' },
        { reps: 0, weight: 0, completed: false, kind: 'normal' },
      ],
      completedSetIdx: 0,
      units: 'metric',
      lastRestSeconds: null,
    });
    assert.ok(out);
    assert.equal(out?.suggestion.kind, 'load');
    if (out?.suggestion.kind !== 'load') return;
    assert.equal(out.suggestion.durationSeconds, 45);
    const parts = formatAfterCompleteParts(out, t, undefined, null, {
      rowType: 'duration',
    });
    assert.equal(parts.target, '0:45');
  });
});
