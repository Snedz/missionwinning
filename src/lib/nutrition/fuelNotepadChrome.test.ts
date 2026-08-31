/**
 * Fuel first paint is the log, not remaining / notepad / recipes.
 * The unmounted notepad widget still owns the type field.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..', '..');
const page = () =>
  readFileSync(path.join(root, 'src/page-components/NutritionPage.tsx'), 'utf8');

test('Fuel first paint is empty + Log meal, or today\'s meals — not remaining then type', () => {
  const src = page();
  const jsx = src.slice(src.lastIndexOf('return ('));
  assert.doesNotMatch(jsx, /<FuelMacroOverview\b/);
  assert.doesNotMatch(jsx, /<FuelQuickLogPanel\b/);
  assert.match(jsx, /<FuelTodayLogCard\b/);
  assert.match(jsx, /data-testid="fuel-log-dock"/);
});

test('Fuel does not leftover the Search, barcode & recipes house door', () => {
  const src = page();
  assert.doesNotMatch(src, /fuelShowMore/);
  assert.doesNotMatch(src, /defaultValue: 'Search, barcode & recipes'/);
});

test('the nutrition house stays off first paint', () => {
  const src = page();
  const jsx = src.slice(src.lastIndexOf('return ('));
  for (const name of [
    'FuelGoalWizard',
    'FuelRecipesPanel',
    'FuelWeekGlance',
    'FuelWeightStrip',
    'FuelPastDaysCard',
    'FuelMoreTools',
    'FuelAdaptBanner',
    'SignInPrompt',
  ]) {
    assert.doesNotMatch(jsx, new RegExp(`<${name}\\b`), `${name} is leftover on Fuel`);
  }
  assert.doesNotMatch(jsx, /<details\b/);
});

test('Fuel has no floating Log food — the dock is the action', () => {
  const src = page();
  assert.doesNotMatch(src, /fuelLogFab/);
  assert.doesNotMatch(src, /fixed bottom-\[calc\(56px/);
  assert.match(src, /data-testid="fuel-log-dock"/);
});

test('the type field is the unmounted notepad', () => {
  const src = readFileSync(
    path.join(root, 'src/components/nutrition/FuelQuickLogPanel.tsx'),
    'utf8'
  );
  assert.match(src, /id="fuel-nl-meal"/);
  assert.match(src, /notepad/);
});
