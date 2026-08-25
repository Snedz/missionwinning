/**
 * This week's Fuel restock — diary + typed list, handoff only.
 *
 * Injected today / weekStart so fixtures do not expire.
 * Mutants: seed defaults, last-week leak, shop URL, price invent,
 * fuzzy recipe match, empty week invents a list.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  assembleRestockList,
  defaultRestockWeekStart,
  formatRestockExport,
  loadFuelRestockExtras,
  parseMessyRestockList,
  rowsThisLocalWeek,
  saveFuelRestockExtras,
  type RestockRecipe,
} from './fuelRestock.ts';
import type { NutritionLogRow } from './nutritionQuickLog.ts';
import { DEFAULT_QUICK_FOODS } from './nutritionQuickLog.ts';
import { STORAGE_KEYS } from './storage/keys.ts';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

/** Wednesday 12 Aug 2026 — week is Mon 10 → Sun 16. */
const TODAY = '2026-08-12';
const WEEK_START = '2026-08-10';

const BOWL: RestockRecipe = {
  name: 'Elite Chicken Rice Power Bowl',
  ingredients:
    '180g grilled chicken breast, 200g cooked rice, 100g broccoli, 1 tbsp olive oil, herbs, lemon',
};

function row(name: string, date: string): NutritionLogRow {
  return { name, protein: 10, cals: 100, date };
}

function assemble(
  logs: NutritionLogRow[],
  extra?: { typedText?: string; recipes?: RestockRecipe[] }
) {
  return assembleRestockList({
    logs,
    todayIso: TODAY,
    weekStart: WEEK_START,
    typedText: extra?.typedText ?? '',
    recipes: extra?.recipes ?? [],
  });
}

describe('defaultRestockWeekStart', () => {
  it('Wednesday is Monday of that local week', () => {
    assert.equal(defaultRestockWeekStart(TODAY), WEEK_START);
  });

  it('empty / invalid date invents no week', () => {
    assert.equal(defaultRestockWeekStart(''), '');
    assert.equal(defaultRestockWeekStart('not-a-date'), '');
  });
});

describe('rowsThisLocalWeek', () => {
  it('keeps this week and undated-as-today; drops last week', () => {
    const rows = rowsThisLocalWeek(
      [
        row('Chicken breast 150g', '2026-08-10'),
        row('Oats 80g dry', '2026-08-09'),
        { name: 'Eggs 3 large', protein: 18, cals: 210 },
      ],
      TODAY,
      WEEK_START
    );
    assert.deepEqual(
      rows.map((r) => r.name),
      ['Chicken breast 150g', 'Eggs 3 large']
    );
  });
});

describe('parseMessyRestockList', () => {
  it('splits a messy pizza list and drops checkout filler', () => {
    const items = parseMessyRestockList(
      'I want to order dough for pizza, pizza sauce, mushrooms for the pizza, mozerella cheese for the pizza , pepperoni, get my carts ready'
    );
    assert.deepEqual(items, [
      'dough',
      'pizza sauce',
      'mushrooms',
      'mozerella cheese',
      'pepperoni',
    ]);
  });

  it('keeps their spelling — no store brand invent', () => {
    const items = parseMessyRestockList('mozerella cheese\nRao paste');
    assert.deepEqual(items, ['mozerella cheese', 'Rao paste']);
    assert.equal(items.includes('mozzarella'), false);
  });

  it('empty / filler-only invents nothing', () => {
    assert.deepEqual(parseMessyRestockList(''), []);
    assert.deepEqual(parseMessyRestockList('  checkout  \n place order '), []);
    assert.deepEqual(parseMessyRestockList('get my cart ready'), []);
  });
});

describe('assembleRestockList', () => {
  it('empty week + empty typed invents nothing', () => {
    assert.deepEqual(assemble([]), []);
    assert.deepEqual(assemble([], { typedText: '   ' }), []);
  });

  it('does not seed default quick foods', () => {
    const items = assemble([]);
    for (const food of DEFAULT_QUICK_FOODS) {
      assert.equal(
        items.some((i) => i.name === food[0]),
        false,
        `must not invent ${food[0]}`
      );
    }
  });

  it('this week unique names; repeated line is ×N', () => {
    const items = assemble([
      row('Chicken breast 150g', '2026-08-10'),
      row('Chicken breast 150g', '2026-08-11'),
      row('Oats 80g dry', '2026-08-12'),
    ]);
    assert.equal(items.length, 2);
    assert.equal(items[0]?.name, 'Chicken breast 150g');
    assert.equal(items[0]?.times, 2);
    assert.equal(items[0]?.source, 'log');
    assert.equal(items[1]?.name, 'Oats 80g dry');
    assert.equal(items[1]?.times, 1);
  });

  it('last-week log does not appear', () => {
    const items = assemble([row('Oats 80g dry', '2026-08-09')]);
    assert.deepEqual(items, []);
  });

  it('logged recipe name explodes catalog ingredients', () => {
    const items = assemble([row('Elite Chicken Rice Power Bowl', '2026-08-11')], {
      recipes: [BOWL],
    });
    assert.deepEqual(
      items.map((i) => i.name),
      [
        '180g grilled chicken breast',
        '200g cooked rice',
        '100g broccoli',
        '1 tbsp olive oil',
        'herbs',
        'lemon',
      ]
    );
    assert.equal(items.every((i) => i.source === 'log'), true);
  });

  it('non-recipe name stays the name they logged — no fuzzy bowl', () => {
    const items = assemble([row('chicken', '2026-08-11')], { recipes: [BOWL] });
    assert.equal(items.length, 1);
    assert.equal(items[0]?.name, 'chicken');
    assert.equal(
      items.some((i) => /broccoli|olive oil/i.test(i.name)),
      false
    );
  });

  it('typed extras merge after logs; duplicate keeps diary spelling', () => {
    const items = assemble([row('Eggs 3 large', '2026-08-12')], {
      typedText: 'eggs 3 large, bananas',
    });
    assert.equal(items.length, 2);
    assert.equal(items[0]?.name, 'Eggs 3 large');
    assert.equal(items[0]?.source, 'log');
    assert.equal(items[0]?.times, 2);
    assert.equal(items[1]?.name, 'bananas');
    assert.equal(items[1]?.source, 'typed');
  });

  it('messy typed list alone is a keepable list', () => {
    const items = assemble([], {
      typedText:
        'dough for pizza, pizza sauce, mushrooms for the pizza, mozerella cheese, pepperoni, checkout',
    });
    assert.deepEqual(
      items.map((i) => i.name),
      ['dough', 'pizza sauce', 'mushrooms', 'mozerella cheese', 'pepperoni']
    );
    assert.equal(items.every((i) => i.source === 'typed'), true);
  });
});

describe('formatRestockExport', () => {
  it('numbered list + you shop; no URL, no Place Order, no price', () => {
    const text = formatRestockExport({
      items: [
        { name: 'Chicken breast 150g', times: 2, source: 'log' },
        { name: 'dough', times: 1, source: 'typed' },
      ],
      title: "This week's restock",
      footer: 'You shop. We do not order.',
    });
    assert.match(text, /This week's restock/);
    assert.match(text, /1\. Chicken breast 150g ×2/);
    assert.match(text, /2\. dough/);
    assert.match(text, /You shop\. We do not order\./);
    assert.doesNotMatch(text, /https?:\/\//i);
    assert.doesNotMatch(text, /place order|checkout|cart\/view/i);
    assert.doesNotMatch(text, /\$\d/);
  });

  it('empty items export nothing to shop', () => {
    const text = formatRestockExport({
      items: [],
      title: "This week's restock",
      footer: 'You shop. We do not order.',
    });
    assert.equal(text, '');
  });
});

describe('fuel restock extras persist', () => {
  it('round-trips their words on this device', () => {
    saveFuelRestockExtras('mozerella, dough');
    assert.equal(loadFuelRestockExtras(), 'mozerella, dough');
    assert.equal(STORAGE_KEYS.fuelRestockExtras, 'mw_fuel_restock_extras');
  });
});

describe('fuelRestock source', () => {
  it('helper stays a list — no shop, no plan, no kit, no defaults', () => {
    const src = read('src/lib/fuelRestock.ts');
    assert.doesNotMatch(src, /amazon\.com|whole foods|gp\/cart/i);
    assert.match(src, /'place order'/, 'filler set must drop Place Order, not emit it');
    assert.doesNotMatch(src, /DEFAULT_QUICK_FOODS|loadFuelPlan|homeGymKit/);
    assert.doesNotMatch(src, /from ['"]@\/lib\/fuelCoach/);
    assert.doesNotMatch(src, /from ['"]@\/lib\/workout\/homeGymKit/);
    assert.match(src, /startOfLocalWeek|weekStart/);
    assert.match(src, /You shop\. We do not order\.|footer/);
    assert.match(src, /STORAGE_KEYS\.fuelRestockExtras/);
  });
});
