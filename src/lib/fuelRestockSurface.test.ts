/**
 * Restock stays on Fuel Show more. Today / Train / the door stay clean.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const abs = path.join(dir, entry);
    if (statSync(abs).isDirectory()) walk(abs, out);
    else if (/\.(tsx|ts)$/.test(abs)) out.push(path.relative(root, abs));
  }
  return out;
}

const SHOP_LEAK =
  /amazon\.com|whole foods|place order|gp\/cart|fuelRestock|FuelRestock/i;

const FORBIDDEN_SURFACES = [
  'src/page-components/HomeTodayLean.tsx',
  'src/page-components/HomePage.tsx',
  'src/page-components/ActiveWorkoutPage.tsx',
  'src/page-components/LandingPage.tsx',
  'src/lib/gatedWwwHonesty.ts',
  'src/lib/todayPrimaryAction.ts',
  'app/private/GateTeaser.tsx',
  'app/private/PrivateTeaserClient.tsx',
  'app/private/page.tsx',
];

describe('restock surface lock', () => {
  it('Today / Train / door do not import restock or name a shop', () => {
    for (const file of FORBIDDEN_SURFACES) {
      const src = read(file);
      assert.doesNotMatch(
        src,
        SHOP_LEAK,
        `${file} must not carry restock / shop / cart`
      );
    }
  });

  it('Fuel restock card stays off /nutrition', () => {
    const page = read('src/page-components/NutritionPage.tsx');
    assert.doesNotMatch(page, /<FuelRestockCard\b/);
    assert.doesNotMatch(page, /<details\b/);
    assert.doesNotMatch(page, /amazon\.com|place order|whole foods/i);
  });

  it('restock card copy / download are not a shop', () => {
    const src = read('src/components/nutrition/FuelRestockCard.tsx');
    assert.match(src, /data-testid="fuel-restock"/);
    assert.match(src, /data-testid="fuel-restock-copy"/);
    assert.match(src, /data-testid="fuel-restock-download"/);
    assert.match(src, /fuelRestockCopy|Copy list/);
    assert.doesNotMatch(src, /primary-action|bg-primary-fill/);
    assert.doesNotMatch(src, /amazon\.com|place order|whole foods|gp\/cart/i);
    assert.match(src, /You shop\. We do not order\./);
  });

  it('today still has no restock shop in the today tree', () => {
    const allow = new Set([
      'src/lib/today/quietWeekRow.ts',
      'src/lib/today/quietWeekRow.test.ts',
      'src/lib/today/quietWeekTrackTrend.test.ts',
    ]);
    const todayFiles = walk(path.join(root, 'src/components/today')).concat(
      walk(path.join(root, 'src/lib/today'))
    );
    const offenders = todayFiles.filter(
      (f) => !allow.has(f) && SHOP_LEAK.test(read(f))
    );
    assert.deepEqual(offenders, [], `Today leaked restock/shop: ${offenders.join(', ')}`);
  });
});
