import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculatePlatesPerSide,
  IMPERIAL_BAR_LBS,
  IMPERIAL_PLATES_LBS,
  METRIC_BAR_KG,
  METRIC_PLATES_KG,
} from '@/lib/plateCalculator';

describe('plateCalculator', () => {
  it('loads metric plates for 100kg barbell', () => {
    const r = calculatePlatesPerSide(100, METRIC_BAR_KG, METRIC_PLATES_KG);
    assert.equal(r.achievedWeight, 100);
    assert.equal(r.remainder, 0);
    assert.ok(r.perSide.length >= 2);
  });

  it('loads imperial plates for 225lb barbell', () => {
    const r = calculatePlatesPerSide(225, IMPERIAL_BAR_LBS, IMPERIAL_PLATES_LBS);
    assert.equal(r.achievedWeight, 225);
    assert.equal(r.remainder, 0);
  });

  it('reports remainder when exact load impossible', () => {
    const r = calculatePlatesPerSide(102.5, METRIC_BAR_KG, METRIC_PLATES_KG);
    assert.ok(r.remainder >= 0);
    assert.ok(r.achievedWeight <= 102.5);
  });
});
