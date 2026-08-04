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

  it('parses fractions — 1/2 cup is half, not two (denominator trap)', () => {
    const rice = estimateMealFromDescription('rice');
    const halfCup = estimateMealFromDescription('1/2 cup rice');
    const aCup = estimateMealFromDescription('a cup of rice');
    const twoCups = estimateMealFromDescription('2 cups rice');
    assert.ok(rice && halfCup && aCup && twoCups);
    assert.equal(halfCup.protein, Math.round(aCup.protein * 0.5));
    assert.equal(halfCup.cals, Math.round(aCup.cals * 0.5));
    assert.ok(halfCup.protein < twoCups.protein);
    assert.equal(halfCup.source, 'matched');
    assert.equal(halfCup.confidence, 'medium');
  });

  it('parses bare food fractions and three-quarters cups', () => {
    const chicken = estimateMealFromDescription('chicken');
    const halfChicken = estimateMealFromDescription('1/2 chicken');
    const oats = estimateMealFromDescription('oats');
    const threeQuarters = estimateMealFromDescription('3/4 cup oats');
    assert.ok(chicken && halfChicken && oats && threeQuarters);
    assert.equal(halfChicken.protein, Math.round(chicken.protein * 0.5));
    assert.equal(threeQuarters.protein, Math.round(oats.protein * 0.75));
    // regressions: whole counts and scoops still work
    const twelveEggs = estimateMealFromDescription('12 eggs');
    const egg = estimateMealFromDescription('egg');
    assert.ok(twelveEggs && egg);
    assert.equal(twelveEggs.protein, egg.protein * 12);
    const twoScoops = estimateMealFromDescription('2 scoops whey');
    const whey = estimateMealFromDescription('whey');
    assert.ok(twoScoops && whey);
    assert.equal(twoScoops.protein, whey.protein * 2);
  });

  it('parses mixed numbers — 1 1/2 cup is 1.5, not half (.423)', () => {
    const rice = estimateMealFromDescription('rice');
    const aCup = estimateMealFromDescription('a cup of rice');
    const mixed = estimateMealFromDescription('1 1/2 cup rice');
    const twoCups = estimateMealFromDescription('2 cups rice');
    const halfCup = estimateMealFromDescription('1/2 cup rice');
    assert.ok(rice && aCup && mixed && twoCups && halfCup);
    assert.equal(mixed.protein, Math.round(aCup.protein * 1.5));
    assert.equal(mixed.cals, Math.round(aCup.cals * 1.5));
    assert.ok(mixed.protein > halfCup.protein);
    assert.ok(mixed.protein < twoCups.protein);
    assert.equal(mixed.source, 'matched');
    const bareMixed = estimateMealFromDescription('1 1/2 chicken');
    const chicken = estimateMealFromDescription('chicken');
    assert.ok(bareMixed && chicken);
    assert.equal(bareMixed.protein, Math.round(chicken.protein * 1.5));
  });

  it('parses word half / and-a-half — not global 0.65 (.424)', () => {
    const aCup = estimateMealFromDescription('a cup of rice');
    const halfACup = estimateMealFromDescription('half a cup of rice');
    const halfCup = estimateMealFromDescription('half cup rice');
    const decimal = estimateMealFromDescription('0.5 cup rice');
    const oneAndHalf = estimateMealFromDescription('one and a half cups rice');
    const cupAndHalf = estimateMealFromDescription('a cup and a half of rice');
    const twoAndHalf = estimateMealFromDescription('2 and a half cups rice');
    assert.ok(aCup && halfACup && halfCup && decimal && oneAndHalf && cupAndHalf && twoAndHalf);
    assert.equal(halfACup.protein, Math.round(aCup.protein * 0.5));
    assert.equal(halfCup.protein, Math.round(aCup.protein * 0.5));
    assert.equal(decimal.protein, Math.round(aCup.protein * 0.5));
    assert.equal(oneAndHalf.protein, Math.round(aCup.protein * 1.5));
    assert.equal(cupAndHalf.protein, Math.round(aCup.protein * 1.5));
    assert.equal(twoAndHalf.protein, Math.round(aCup.protein * 2.5));
    const chicken = estimateMealFromDescription('chicken');
    const halfChicken = estimateMealFromDescription('half chicken');
    assert.ok(chicken && halfChicken);
    assert.equal(halfChicken.protein, Math.round(chicken.protein * 0.5));
    // small still uses plate-size scale; half no longer does
    const small = estimateMealFromDescription('small chicken');
    assert.ok(small);
    assert.equal(small.protein, Math.round(chicken.protein * 0.65));
  });

  it('parses quarter cup — 0.25× not a full cup (.433)', () => {
    const aCup = estimateMealFromDescription('a cup of rice');
    const quarter = estimateMealFromDescription('a quarter cup of rice');
    const quarterOf = estimateMealFromDescription('quarter of a cup rice');
    assert.ok(aCup && quarter && quarterOf);
    assert.equal(quarter.protein, Math.round(aCup.protein * 0.25));
    assert.equal(quarterOf.protein, Math.round(aCup.protein * 0.25));
    assert.equal(quarter.source, 'matched');
  });

  it('parses third / two thirds cups (.435)', () => {
    const aCup = estimateMealFromDescription('a cup of rice');
    const third = estimateMealFromDescription('a third cup of rice');
    const twoThirds = estimateMealFromDescription('two thirds cup rice');
    assert.ok(aCup && third && twoThirds);
    assert.equal(third.protein, Math.round(aCup.protein * (1 / 3)));
    assert.equal(twoThirds.protein, Math.round(aCup.protein * (2 / 3)));
  });

  it('parses unicode fractions + half of / three quarters / hyphen thirds (.436)', () => {
    const aCup = estimateMealFromDescription('a cup of rice');
    assert.ok(aCup);
    const halfU = estimateMealFromDescription('½ cup rice');
    const threeQ = estimateMealFromDescription('¾ cup rice');
    const mixedU = estimateMealFromDescription('1½ cups rice');
    const halfOf = estimateMealFromDescription('half of a cup of rice');
    const threeQuarters = estimateMealFromDescription('three quarters cup rice');
    const hyphen = estimateMealFromDescription('two-thirds cup rice');
    const thirdU = estimateMealFromDescription('⅓ cup rice');
    assert.ok(halfU && threeQ && mixedU && halfOf && threeQuarters && hyphen && thirdU);
    assert.equal(halfU.protein, Math.round(aCup.protein * 0.5));
    assert.equal(threeQ.protein, Math.round(aCup.protein * 0.75));
    assert.equal(mixedU.protein, Math.round(aCup.protein * 1.5));
    assert.equal(halfOf.protein, Math.round(aCup.protein * 0.5));
    assert.equal(threeQuarters.protein, Math.round(aCup.protein * 0.75));
    assert.equal(hyphen.protein, Math.round(aCup.protein * (2 / 3)));
    assert.equal(thirdU.protein, Math.round(aCup.protein * (1 / 3)));
  });

  it('parses ¼, three-quarters hyphen, and couple (.438)', () => {
    const aCup = estimateMealFromDescription('a cup of rice');
    const egg = estimateMealFromDescription('egg');
    assert.ok(aCup && egg);
    const quarterU = estimateMealFromDescription('¼ cup rice');
    const threeQHyphen = estimateMealFromDescription('three-quarters cup rice');
    const couple = estimateMealFromDescription('a couple of eggs');
    const coupleBare = estimateMealFromDescription('couple eggs');
    assert.ok(quarterU && threeQHyphen && couple && coupleBare);
    assert.equal(quarterU.protein, Math.round(aCup.protein * 0.25));
    assert.equal(threeQHyphen.protein, Math.round(aCup.protein * 0.75));
    assert.equal(couple.protein, egg.protein * 2);
    assert.equal(coupleBare.protein, egg.protein * 2);
  });

  it('parses few → 3 and dash/splash dab scale (.441)', () => {
    const egg = estimateMealFromDescription('egg');
    const oil = estimateMealFromDescription('olive oil');
    const milk = estimateMealFromDescription('milk');
    const tspOil = estimateMealFromDescription('1 tsp olive oil');
    assert.ok(egg && oil && milk && tspOil);
    const few = estimateMealFromDescription('a few eggs');
    const fewBare = estimateMealFromDescription('few almonds');
    const almond = estimateMealFromDescription('almonds');
    const dash = estimateMealFromDescription('a dash of olive oil');
    const splash = estimateMealFromDescription('a splash of milk');
    const pinch = estimateMealFromDescription('a pinch of olive oil');
    assert.ok(few && fewBare && almond && dash && splash && pinch);
    assert.equal(few.protein, egg.protein * 3);
    assert.equal(fewBare.protein, almond.protein * 3);
    assert.equal(dash.fat, tspOil.fat);
    assert.equal(dash.cals, tspOil.cals);
    assert.equal(pinch.fat, tspOil.fat);
    assert.equal(splash.protein, Math.round(milk.protein * 0.2));
    assert.equal(splash.cals, Math.round(milk.cals * 0.2));
    assert.notEqual(dash.cals, oil.cals, 'dash must not be a full oil serving');
  });

  it('parses pair → 2, dab/bit dab-scale, and bare tbsp (.443)', () => {
    const egg = estimateMealFromDescription('egg');
    const oil = estimateMealFromDescription('olive oil');
    const oneTbsp = estimateMealFromDescription('1 tbsp olive oil');
    const tspOil = estimateMealFromDescription('1 tsp olive oil');
    assert.ok(egg && oil && oneTbsp && tspOil);
    const pair = estimateMealFromDescription('a pair of eggs');
    const pairBare = estimateMealFromDescription('pair eggs');
    const dab = estimateMealFromDescription('a dab of olive oil');
    const bit = estimateMealFromDescription('a bit of olive oil');
    const bareTbsp = estimateMealFromDescription('a tablespoon of olive oil');
    const bareTbspShort = estimateMealFromDescription('tbsp olive oil');
    assert.ok(pair && pairBare && dab && bit && bareTbsp && bareTbspShort);
    assert.equal(pair.protein, egg.protein * 2);
    assert.equal(pairBare.protein, egg.protein * 2);
    assert.equal(dab.cals, tspOil.cals);
    assert.equal(bit.fat, tspOil.fat);
    assert.equal(bareTbsp.cals, oneTbsp.cals);
    assert.equal(bareTbspShort.fat, oneTbsp.fat);
    assert.notEqual(bareTbsp.cals, oil.cals, 'bare tbsp must not be a full oil serving');
  });
});
