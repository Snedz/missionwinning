/**
 * Fuel free-beta mute — empty/error recipe chrome must not say “premium”
 * while open beta unlocks depth (catalog fetch often empty/offline in demo).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..');

test('FuelRecipesPanel free-beta uses open-beta empty/error recipe keys', () => {
  const src = readFileSync(
    join(root, 'src/components/nutrition/FuelRecipesPanel.tsx'),
    'utf8'
  );
  assert.match(src, /fuelPremiumRecipesEmptyOpenBeta/);
  assert.match(src, /fuelPremiumFetchFailedOpenBeta/);
  assert.match(src, /fuelPremiumOfflineOpenBeta/);
  assert.match(src, /isFreeBeta|freeBeta/);
});

test('NutritionPage toast free-beta uses open-beta fetch-failed key', () => {
  const src = readFileSync(join(root, 'src/page-components/NutritionPage.tsx'), 'utf8');
  assert.match(src, /fuelPremiumFetchFailedOpenBeta/);
  assert.match(src, /isFreeBeta/);
});

test('fuelLocales EN open-beta recipe strings omit premium merch', () => {
  const src = readFileSync(join(root, 'src/i18n/fuelLocales.ts'), 'utf8');
  for (const key of [
    'fuelPremiumRecipesEmptyOpenBeta',
    'fuelPremiumFetchFailedOpenBeta',
    'fuelPremiumOfflineOpenBeta',
    'fuelPremiumRecipesTitleCountBeta',
  ]) {
    const re = new RegExp(`${key}:\\s*(?:\\n\\s*)?'((?:\\\\'|[^'])*)'`, 'm');
    const m = src.match(re);
    assert.ok(m, `missing EN ${key}`);
    assert.doesNotMatch(m[1]!, /Super Bundle/i, `${key} pitches Super Bundle`);
    assert.doesNotMatch(m[1]!, /\b[Pp]remium\b/, `${key} still says premium`);
  }
});
