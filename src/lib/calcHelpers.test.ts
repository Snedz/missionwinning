import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  defaultCalcInputs,
  defaultStrengthDemo,
  epley1rm,
  brzycki1rm,
  mifflinBmr,
  proteinTargetGrams,
  macroTargetsFromStats,
} from './calcHelpers';

describe('calcHelpers', () => {
  it('computes epley 1RM', () => {
    assert.equal(epley1rm(225, 5), 263);
  });

  it('computes brzycki 1RM', () => {
    const brz = brzycki1rm(225, 5);
    assert.ok(brz > 250 && brz < 280);
  });

  it('applies sex offset in BMR', () => {
    const male = mifflinBmr(82, 178, 28, 'metric', 'male');
    const female = mifflinBmr(82, 178, 28, 'metric', 'female');
    assert.equal(male - female, 166);
  });

  it('uses metric vs imperial BMR inputs', () => {
    const metric = mifflinBmr(82, 178, 28, 'metric');
    const imperial = mifflinBmr(180, 70, 28, 'imperial');
    assert.ok(metric > 1500 && metric < 2200);
    assert.ok(Math.abs(metric - imperial) < 50);
  });

  it('returns unit-appropriate defaults', () => {
    assert.equal(defaultCalcInputs('metric').weight, 100);
    assert.equal(defaultCalcInputs('imperial').weight, 225);
  });

  it('uses female-typical seeds when sex is female', () => {
    const f = defaultCalcInputs('metric', 'female');
    const m = defaultCalcInputs('metric', 'male');
    assert.ok(f.bw < m.bw);
    assert.ok(f.weight < m.weight);
    const demoF = defaultStrengthDemo('female');
    const demoM = defaultStrengthDemo('male');
    assert.ok(demoF.bodyweightKg < demoM.bodyweightKg);
    assert.ok(demoF.weightKg < demoM.weightKg);
  });

  it('protein target scales by units', () => {
    assert.ok(proteinTargetGrams(82, 'metric') > proteinTargetGrams(180, 'imperial') * 0.4);
  });

  it('macroTargetsFromStats adjusts by goal', () => {
    const m = macroTargetsFromStats({ bw: 82, units: 'metric', goal: 'maintain' });
    const c = macroTargetsFromStats({ bw: 82, units: 'metric', goal: 'cut' });
    const b = macroTargetsFromStats({ bw: 82, units: 'metric', goal: 'bulk' });
    assert.ok(c.cals < m.cals && b.cals > m.cals);
    assert.equal(m.protein, c.protein);
  });
});
