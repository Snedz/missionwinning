import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { defaultCalcInputs, epley1rm, brzycki1rm, mifflinBmr, proteinTargetGrams } from './calcHelpers';

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

  it('protein target scales by units', () => {
    assert.ok(proteinTargetGrams(82, 'metric') > proteinTargetGrams(180, 'imperial') * 0.4);
  });
});
