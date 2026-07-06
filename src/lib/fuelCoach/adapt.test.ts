import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { adaptDailyTargets, synergyCarbBump } from '@/lib/fuelCoach/adapt';

const base = { cals: 2200, protein: 160, carbs: 200, fat: 70 };

describe('fuelCoach adapt', () => {
  it('bumps carbs on heavy training days', () => {
    const { targets } = adaptDailyTargets(base, 'heavy');
    assert.equal(targets.carbs, base.carbs + 40);
    assert.equal(targets.cals, base.cals + 200);
  });

  it('trims on rest days', () => {
    const { targets } = adaptDailyTargets(base, 'rest');
    assert.ok(targets.carbs < base.carbs);
    assert.ok(targets.cals < base.cals);
  });

  it('reports synergy carb bump', () => {
    assert.equal(synergyCarbBump('heavy'), 40);
    assert.equal(synergyCarbBump('rest'), 0);
  });
});
