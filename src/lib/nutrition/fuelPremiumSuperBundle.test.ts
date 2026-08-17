import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CONTENT_FLOORS, getContentInventory } from '@/lib/contentInventory';
import { FREE_RECIPE_COUNT, PREMIUM_RECIPE_COUNT, PREMIUM_RECIPE_TEASERS } from '@/data/recipes/catalogMeta';
import { FREE_RECIPES } from '@/data/recipes/freeRecipes';

const root = join(import.meta.dirname, '..', '..', '..');

const SUPER_BUNDLE_NAMES = [
  'Garage Whey Oat Mug',
  'Cooler Cottage Apple Crunch',
  'Skillet Turkey Egg Whites',
  'Rice Cooker Chicken Congee Bowl',
  'Tuna Pouch Rice Cooler',
  'Jerky Cheese Apple Plate',
  'Greek Yogurt Whey Travel Cup',
  'Rotisserie Packet Street Plate',
  'Canned Chicken Corn Salad',
  'Cast Iron Turkey Hash',
  'One-Pan Chicken Thigh Rice',
  'Garage Chili Mac Lean',
  'Sheet Pan Cod Broccoli',
  'Skillet Steak Bites Peppers',
  'Post-Session Chocolate Milk Rice',
  'Warm Whey Banana Mash',
  'Garage Recovery Burrito Bowl',
  'After-Lift Cottage Potato',
  'Cold Chicken Pasta Tub',
  'Tempeh Peanut Garage Bowl',
  'Lentil Turkey Tomato Pot',
  'Edamame Egg Fried Rice',
  'Black Bean Cottage Skillet',
  'Sunday Chicken Batch Plate',
  'Leftover Steak Egg Fried',
  'Fridge Rice Protein Remix',
  'Two-Day Turkey Soup Pot',
  'Slow Casein Cocoa Cup',
  'Light Fish Microwave Rice',
  'Garage Night Yogurt Crunch',
] as const;

const FORBIDDEN = [
  'ISSA',
  'Ch5',
  'Ch12',
  'a food diary',
  'a food diary',
  'barcode',
  'TDEE',
  'Free core',
];

function read(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

function premiumNameProtein(): { name: string; protein: number }[] {
  const src = read('src/data/recipes/premiumRecipes.ts');
  return [...src.matchAll(/"name":\s*"([^"]+)",\s*"protein":\s*(\d+)/g)].map((m) => ({
    name: m[1]!,
    protein: Number(m[2]),
  }));
}

test('Super Bundle Fuel floors match catalog meta and inventory', () => {
  assert.equal(PREMIUM_RECIPE_COUNT, 140);
  assert.equal(CONTENT_FLOORS.recipesPremium, 140);
  assert.equal(PREMIUM_RECIPE_COUNT, CONTENT_FLOORS.recipesPremium);
  assert.equal(getContentInventory().recipes.premium, 140);
});

test('free Fuel catalog stays 48', () => {
  assert.equal(CONTENT_FLOORS.recipesFree, 48);
  assert.equal(FREE_RECIPE_COUNT, 48);
  assert.equal(FREE_RECIPES.length, 48);
  assert.equal(getContentInventory().recipes.free, 48);
});

test('premium recipe name count is 140', () => {
  const rows = premiumNameProtein();
  assert.equal(rows.length, 140);
  assert.equal(rows.length, PREMIUM_RECIPE_COUNT);
});

test('frozen Super Bundle recipes exist, hit protein floor, and stay unique', () => {
  assert.equal(SUPER_BUNDLE_NAMES.length, 30);
  const rows = premiumNameProtein();
  const byName = new Map(rows.map((r) => [r.name, r]));
  const freeNames = new Set(FREE_RECIPES.map((r) => r.name));
  const premiumNames = rows.map((r) => r.name);
  const allNames = [...freeNames, ...premiumNames];

  for (const name of SUPER_BUNDLE_NAMES) {
    const row = byName.get(name);
    assert.ok(row, `missing frozen recipe: ${name}`);
    assert.ok(row!.protein >= 25, `${name} protein ${row!.protein} < 25`);
    assert.equal(
      allNames.filter((n) => n === name).length,
      1,
      `duplicate name: ${name}`
    );
    assert.ok(!freeNames.has(name), `${name} collides with a free recipe`);
  }
});

test('new Super Bundle recipe text stays original MW (no forbidden tokens)', () => {
  const src = read('src/data/recipes/premiumRecipes.ts');
  for (const name of SUPER_BUNDLE_NAMES) {
    const start = src.indexOf(`"name": "${name}"`);
    assert.ok(start >= 0, name);
    const end = src.indexOf('\n  },', start);
    const block = src.slice(start, end === -1 ? src.length : end);
    for (const token of FORBIDDEN) {
      assert.ok(!block.includes(token), `${name} contains forbidden "${token}"`);
    }
    assert.match(block, /"ingredients":\s*"[^"]{10,}"/);
    assert.match(block, /"instructions":\s*"[^"]{10,}"/);
    assert.match(block, /"tip":\s*"[^"]{10,}"/);
  }
});

test('premium teasers are real catalog names', () => {
  const names = new Set(premiumNameProtein().map((r) => r.name));
  assert.equal(PREMIUM_RECIPE_TEASERS.length, 3);
  for (const teaser of PREMIUM_RECIPE_TEASERS) {
    assert.ok(names.has(teaser), `teaser not in catalog: ${teaser}`);
  }
});

test('protein-first Fuel coach and shop EN copy is locked', () => {
  const fuel = read('src/i18n/fuelLocales.ts');
  const today = read('src/i18n/todayLocales.ts');
  const payments = read('src/lib/payments.ts');
  const bundle = read('src/i18n/bundleLocales.ts');
  const readiness = read('src/lib/readinessDisplay.ts');

  assert.match(fuel, /Protein first from your logs — a 7-day plate plan from garage staples/);
  assert.match(fuel, /Protein-first week from your targets and training load — garage meals you can cook/);
  assert.match(fuel, /Protein first, then carbs on heavy days/);
  assert.match(fuel, /protein-first recipe library — garage and travel plates, not a food database/);
  assert.match(fuel, /protein-first recipes and the Fuel Coach week — logger stays free/);

  assert.match(
    today,
    /Hit protein first in Fuel — log a plate, not a barcode/
  );
  assert.match(
    readiness,
    /Hit protein first in Fuel — log a plate, not a barcode/
  );

  assert.match(
    payments,
    /CONTENT_FLOORS\.recipesPremium\} protein-first recipes, meal plans, coaching sync/
  );
  assert.doesNotMatch(
    payments.slice(
      payments.indexOf("id: 'fuel'"),
      payments.indexOf("id: 'move'")
    ),
    /(?<!CONTENT_FLOORS\.recipes(?:Free|Premium)\})\b(?:20|110|140)\b/
  );

  const enFuelFree = bundle.match(/bundlePillarFuelFree: '([^']+)'/);
  const enFuelPremium = bundle.match(/bundlePillarFuelPremium: '([^']+)'/);
  assert.ok(enFuelFree?.[1]?.includes('{{count}}'), 'Fuel free shop string must interpolate count');
  assert.ok(enFuelPremium?.[1]?.includes('{{count}}'), 'Fuel premium shop string must interpolate count');
  assert.ok(enFuelPremium?.[1]?.includes('protein-first'), 'Fuel premium shop string must say protein-first');
  assert.doesNotMatch(enFuelFree?.[1] ?? '', /\d/);
  assert.doesNotMatch(enFuelPremium?.[1] ?? '', /\d/);
});

test('BundlePage passes Fuel count from CONTENT_FLOORS', () => {
  const src = read('src/page-components/BundlePage.tsx');
  assert.match(src, /CONTENT_FLOORS/);
  assert.match(src, /recipesPremium/);
  assert.match(src, /pillar\.id === ["']fuel["']/);
  assert.match(src, /t\(keys\.premiumKey,\s*fuelCount\)/);
});
