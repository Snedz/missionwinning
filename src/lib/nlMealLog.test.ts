import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { estimateMealFromDescription } from '@/lib/nlMealLog';

describe('nlMealLog', () => {
  it('sums chicken rice broccoli', () => {
    const e = estimateMealFromDescription('chicken rice broccoli');
    assert.ok(e);
    assert.equal(e.confidence, 'high');
    assert.equal(e.source, 'matched');
    assert.ok(e.matched.some((m) => m.includes('Chicken')));
    assert.ok(e.matched.some((m) => m.includes('Rice')));
    assert.ok(e.matched.some((m) => m.includes('Broccoli')));
    assert.equal(e.protein, 35 + 4 + 3);
    assert.equal(e.cals, 220 + 200 + 40);
  });

  it('scales large portions', () => {
    const base = estimateMealFromDescription('chicken');
    const large = estimateMealFromDescription('large chicken');
    assert.ok(base && large);
    assert.ok(large.protein > base.protein);
  });

  it('multiplies quantities like 3 eggs', () => {
    const one = estimateMealFromDescription('egg');
    const three = estimateMealFromDescription('3 eggs');
    assert.ok(one && three);
    assert.equal(three.protein, one.protein * 3);
    assert.equal(three.cals, one.cals * 3);
  });

  it('returns low-confidence rough fallback for unknown text', () => {
    const e = estimateMealFromDescription('mystery platter');
    assert.ok(e);
    assert.equal(e.confidence, 'low');
    assert.equal(e.source, 'rough');
    assert.equal(e.matched.length, 0);
    assert.ok(e.cals <= 350);
  });

  it('returns null for empty input', () => {
    assert.equal(estimateMealFromDescription('  '), null);
  });

  it('matches oil + protein without inventing high confidence alone', () => {
    const e = estimateMealFromDescription('salmon olive oil');
    assert.ok(e);
    assert.equal(e.source, 'matched');
    assert.ok(e.fat > 20);
  });
});
