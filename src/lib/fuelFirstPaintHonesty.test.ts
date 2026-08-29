/**
 * Fuel first paint is house leftover — title + notepad / today log / remaining.
 * Search / barcode / recipes stay parked. RouteLoading is not the product.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
}

test('Fuel route is a static page, not a RouteLoading skeleton', () => {
  const route = stripComments(read('app/(app)/nutrition/page.tsx'));
  assert.doesNotMatch(route, /dynamic\(|RouteLoading|Suspense/);
  assert.match(route, /import \{ NutritionPage \}/);
});

test('NutritionPage first paint is house leftover; search / recipes stay parked', () => {
  const page = stripComments(read('src/page-components/NutritionPage.tsx'));
  assert.doesNotMatch(page, /useSearchParams/);
  assert.match(page, /className="house-fuel max-w-3xl pb-8"/);
  assert.match(page, /defaultValue: 'Nutrition'/);
  assert.match(page, /id="fuel-log"/);
});

test('DESIGN names Fuel first paint as house leftover', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /Fuel first paint is house leftover/);
});
