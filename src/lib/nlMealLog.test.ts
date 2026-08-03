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

  it('scales grams roughly as portion of template', () => {
    const base = estimateMealFromDescription('chicken');
    const half = estimateMealFromDescription('50g chicken');
    assert.ok(base && half);
    assert.ok(half.protein < base.protein);
    assert.ok(half.protein >= Math.round(base.protein * 0.4));
  });

  it('scales scoops of whey', () => {
    const one = estimateMealFromDescription('whey protein');
    const two = estimateMealFromDescription('2 scoops whey protein');
    assert.ok(one && two);
    assert.equal(two.protein, one.protein * 2);
    assert.equal(two.source, 'matched');
  });

  it('scales ounces of chicken', () => {
    const hundredG = estimateMealFromDescription('100g chicken');
    const sixOz = estimateMealFromDescription('6 oz chicken');
    assert.ok(hundredG && sixOz);
    // 6 oz ≈ 170g → more protein than 100g
    assert.ok(sixOz.protein > hundredG.protein);
  });

  it('does not treat bare "oil" as a food (only multi-word oils)', () => {
    const bare = estimateMealFromDescription('oil');
    assert.ok(bare);
    assert.equal(bare.source, 'rough');
    assert.equal(bare.matched.length, 0);
    const olive = estimateMealFromDescription('salmon olive oil');
    assert.ok(olive);
    assert.equal(olive.source, 'matched');
    assert.ok(olive.matched.some((m) => m.includes('Oil') || m.includes('Fish')));
  });

  it('scales cups of rice', () => {
    const one = estimateMealFromDescription('rice');
    const twoCups = estimateMealFromDescription('2 cups rice');
    const aCupOf = estimateMealFromDescription('a cup of rice');
    assert.ok(one && twoCups && aCupOf);
    assert.equal(twoCups.protein, one.protein * 2);
    assert.equal(twoCups.cals, one.cals * 2);
    assert.equal(aCupOf.protein, one.protein);
    assert.equal(twoCups.source, 'matched');
    assert.equal(twoCups.confidence, 'medium');
  });

  it('scales piece / handful / slice portion words', () => {
    const chicken = estimateMealFromDescription('chicken');
    const twoPieces = estimateMealFromDescription('2 pieces chicken');
    const handfulNuts = estimateMealFromDescription('a handful of almonds');
    const bread = estimateMealFromDescription('bread');
    const twoSlices = estimateMealFromDescription('2 slices bread');
    assert.ok(chicken && twoPieces && handfulNuts && bread && twoSlices);
    assert.equal(twoPieces.protein, chicken.protein * 2);
    // handful ≈ half a nut serving
    assert.equal(handfulNuts.protein, Math.round(6 * 0.5));
    assert.equal(handfulNuts.source, 'matched');
    // slice ≈ half a bread serving
    assert.equal(twoSlices.protein, Math.round(bread.protein * 0.5 * 2));
    assert.ok(handfulNuts.matched.some((m) => m.includes('Nuts')));
  });

  it('keeps honesty chips: matched + confidence for portion-scaled single food', () => {
    const e = estimateMealFromDescription('handful of almonds');
    assert.ok(e);
    assert.equal(e.source, 'matched');
    assert.equal(e.confidence, 'medium');
    assert.ok(e.matched.length >= 1);
  });

  it('scales tsp / ml / plate of via portion path', () => {
    const oil = estimateMealFromDescription('olive oil');
    const oneTbsp = estimateMealFromDescription('1 tbsp olive oil');
    const threeTsp = estimateMealFromDescription('3 tsp olive oil');
    const milk = estimateMealFromDescription('milk');
    const halfCupMl = estimateMealFromDescription('125ml milk');
    const rice = estimateMealFromDescription('rice');
    const plateOf = estimateMealFromDescription('a plate of rice');
    assert.ok(oil && oneTbsp && threeTsp && milk && halfCupMl && rice && plateOf);
    // 3 tsp ≈ 1 tbsp on the shared 0.5-serving scale
    assert.equal(threeTsp.fat, oneTbsp.fat);
    assert.ok(threeTsp.fat < oil.fat);
    assert.equal(threeTsp.source, 'matched');
    // 125ml ≈ 0.5 of 250ml cup serving
    assert.equal(halfCupMl.protein, Math.round(milk.protein * 0.5));
    assert.equal(plateOf.protein, rice.protein);
    assert.equal(plateOf.source, 'matched');
  });

  it('bare portion words without food stay rough (no invented match)', () => {
    const bare = estimateMealFromDescription('tsp ml plate');
    assert.ok(bare);
    assert.equal(bare.source, 'rough');
    assert.equal(bare.confidence, 'low');
    assert.equal(bare.matched.length, 0);
  });
});
