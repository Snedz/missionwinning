/**
 * Open set-row type (`.994`).
 *
 * Mutants: custom name "plank" becoming duration; adding profile
 * bodyweight into vest volume; assist kg × reps as volume.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';
import {
  formatSetRowLine,
  formatSetRowPrev,
  parseDurationSeconds,
  resolveSetRowType,
  setRowHasWork,
  setRowVolume,
} from './setRowType.ts';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

describe('resolveSetRowType', () => {
  it('bench / unknown / null stay weight × reps', () => {
    assert.equal(resolveSetRowType({ id: 'bench-press', equipment: 'Barbell' }), 'weight');
    assert.equal(resolveSetRowType({ id: 'goblet-squat', equipment: 'Dumbbells' }), 'weight');
    assert.equal(resolveSetRowType({ id: 'custom-move' }), 'weight');
    assert.equal(resolveSetRowType({}), 'weight');
    assert.equal(resolveSetRowType(null), 'weight');
    assert.equal(resolveSetRowType(undefined), 'weight');
  });

  it('pull-ups / push-ups / dips are bodyweight reps', () => {
    assert.equal(resolveSetRowType({ id: 'pull-ups', equipment: 'Bodyweight' }), 'bodyweight');
    assert.equal(resolveSetRowType({ id: 'push-ups', equipment: 'bodyweight-only' }), 'bodyweight');
    assert.equal(resolveSetRowType({ id: 'dips-chair', equipment: 'Chair/Bench' }), 'bodyweight');
    assert.equal(resolveSetRowType({ id: 'bench-dips', equipment: 'Bench' }), 'bodyweight');
  });

  it('plank / holds / finish-time cues are duration', () => {
    assert.equal(resolveSetRowType({ id: 'plank', equipment: 'Bodyweight' }), 'duration');
    assert.equal(resolveSetRowType({ id: 'side-plank', equipment: 'Bodyweight' }), 'duration');
    assert.equal(resolveSetRowType({ id: 'wall-sit', equipment: 'Bodyweight' }), 'duration');
    assert.equal(resolveSetRowType({ id: 'hollow-hold', equipment: 'Bodyweight' }), 'duration');
    assert.equal(
      resolveSetRowType({
        id: 'two-mile-run',
        equipment: 'Bodyweight',
        cues: 'Road or treadmill. Log finish time in seconds.',
      }),
      'duration'
    );
  });

  it('mountain-climbers stay reps — plank in the cue is not the type', () => {
    assert.equal(
      resolveSetRowType({
        id: 'mountain-climbers',
        equipment: 'Bodyweight',
        cues: 'Fast knee drives in plank. Keep hips low.',
      }),
      'bodyweight'
    );
  });

  it('Assisted name or id is assisted — not a vest row', () => {
    assert.equal(
      resolveSetRowType({
        id: 'shrimp-squat-reg',
        name: 'Shrimp Squat Regression (Assisted)',
        equipment: 'Bodyweight',
      }),
      'assisted'
    );
    assert.equal(
      resolveSetRowType({ id: 'assisted-pull-up', name: 'Assisted Pull-up' }),
      'assisted'
    );
  });

  it('explicit logType wins; junk logType is ignored', () => {
    assert.equal(
      resolveSetRowType({ id: 'bench-press', equipment: 'Barbell', logType: 'duration' }),
      'duration'
    );
    assert.equal(
      resolveSetRowType({ id: 'plank', equipment: 'Bodyweight', logType: 'weight' }),
      'weight'
    );
    assert.equal(
      resolveSetRowType({ id: 'plank', equipment: 'Bodyweight', logType: 'hold' }),
      'duration'
    );
  });

  it('custom leftover stays weight — do not guess from the typed name', () => {
    assert.equal(
      resolveSetRowType({ id: 'custom-aaaa', name: 'My plank hold' }),
      'weight'
    );
    assert.equal(
      resolveSetRowType({ id: 'custom-bbbb', name: 'Assisted pull-ups' }),
      'weight'
    );
  });
});

describe('setRowVolume — vest is extra only', () => {
  it('bodyweight vest is vest × reps; 0 vest is 0 — never a profile kg', () => {
    assert.equal(setRowVolume({ reps: 8, weight: 20 }, 'bodyweight'), 160);
    assert.equal(setRowVolume({ reps: 8, weight: 0 }, 'bodyweight'), 0);
    assert.equal(setRowVolume({ reps: 8, weight: 100 }, 'weight'), 800);
  });

  it('duration and assisted invent no kg volume', () => {
    assert.equal(setRowVolume({ reps: 8, weight: 20 }, 'assisted'), 0);
    assert.equal(setRowVolume({ reps: 0, weight: 0 }, 'duration'), 0);
    assert.equal(setRowVolume({ reps: 45, weight: 0 }, 'duration'), 0);
  });

  it('helper never reads Track / profile bodyweight', () => {
    const src = read('src/lib/workout/setRowType.ts');
    assert.doesNotMatch(src, /loadBodyMetrics|bodyweightKg|bodyMetrics/);
    assert.doesNotMatch(src, /from\s+['"]@\/lib\/(?:premium|rewards|identity|social|wearables|speech)/);
  });
});

describe('parseDurationSeconds + work + format', () => {
  it('accepts seconds or m:ss; blank invents nothing', () => {
    assert.equal(parseDurationSeconds(45), 45);
    assert.equal(parseDurationSeconds('45'), 45);
    assert.equal(parseDurationSeconds('1:30'), 90);
    assert.equal(parseDurationSeconds('01:05'), 65);
    assert.equal(parseDurationSeconds(''), 0);
    assert.equal(parseDurationSeconds('  '), 0);
    assert.equal(parseDurationSeconds(null), 0);
  });

  it('duration-only set is work; empty is not', () => {
    assert.equal(setRowHasWork({ reps: 0, durationSeconds: 45 }), true);
    assert.equal(setRowHasWork({ reps: 8 }), true);
    assert.equal(setRowHasWork({ reps: 0, durationSeconds: 0 }), false);
    assert.equal(setRowHasWork({ reps: 8, durationSeconds: 30, kind: 'warmup' }), false);
  });

  it('lines speak the type — plank is time, not 45 × 0', () => {
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
        type: 'assisted',
        reps: 8,
        weight: 20,
        unitLabel: 'kg',
      }),
      '8 × −20 kg'
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
    assert.equal(
      formatSetRowPrev({ type: 'duration', reps: 0, weight: 0, durationSeconds: 90 }),
      '1:30'
    );
  });
});
