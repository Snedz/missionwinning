/**
 * House Show all is Show all.
 *
 * Fuel owns `fuelShowMore` = Search, barcode & recipes. Train, Coach,
 * Mind, Victory, History, Library, and Builder reused that key with
 * defaultValue Show all. Packs win, so the house door lectured.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const abs = path.join(dir, entry);
    if (statSync(abs).isDirectory()) walk(abs, out);
    else if (/\.tsx$/.test(abs)) out.push(path.relative(root, abs));
  }
  return out;
}

const PRODUCT = [...walk(path.join(root, 'src')), ...walk(path.join(root, 'app'))].filter(
  (p) => !/\.(test|routetest)\.tsx$/.test(p)
);

const FUEL_HOUSE = 'src/page-components/NutritionPage.tsx';

test('only Fuel uses fuelShowMore', () => {
  const offenders = PRODUCT.filter((f) => {
    if (f === FUEL_HOUSE) return false;
    return /fuelShowMore/.test(read(f));
  });
  assert.deepEqual(
    offenders,
    [],
    'fuelShowMore is the Fuel house door (Search, barcode & recipes). ' +
      `Offenders: ${offenders.join(', ') || 'none'}`
  );
  assert.match(read(FUEL_HOUSE), /fuelShowMore/, 'Fuel still owns its house door');
});
