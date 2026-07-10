import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { estimateMealFromDescription } from '@/lib/nlMealLog';

describe('nlMealLog', () => {
  it('sums chicken rice broccoli', () => {
    const e = estimateMealFromDescription('chicken rice broccoli');
    assert.ok(e);
    assert.equal(e.confidence, 'high');
    assert.ok(e.matched.includes('Chicken'));
    assert.ok(e.matched.includes('Rice'));
    assert.ok(e.matched.includes('Broccoli'));
    assert.equal(e.protein, 35 + 4 + 3);
    assert.equal(e.cals, 220 + 200 + 40);
  });

  it('scales large portions', () => {
    const base = estimateMealFromDescription('chicken');
    const large = estimateMealFromDescription('large chicken');
    assert.ok(base && large);
    assert.ok(large.protein > base.protein);
  });

  it('returns low-confidence fallback for unknown text', () => {
    const e = estimateMealFromDescription('mystery platter');
    assert.ok(e);
    assert.equal(e.confidence, 'low');
    assert.equal(e.matched.length, 0);
  });

  it('returns null for empty input', () => {
    assert.equal(estimateMealFromDescription('  '), null);
  });
});
