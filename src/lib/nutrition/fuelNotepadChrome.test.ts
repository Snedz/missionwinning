/**
 * Fuel first paint is a notepad: remaining, type, today's lines.
 * Recipes, week, wizard, FAB are the house — they live in Show all.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..', '..');
const page = () =>
  readFileSync(path.join(root, 'src/page-components/NutritionPage.tsx'), 'utf8');

test('Fuel opens remaining then type-in then today — not recipes first', () => {
  const src = page();
  const jsx = src.slice(src.lastIndexOf('return ('));
  const macro = jsx.indexOf('<FuelMacroOverview');
  const typeIn = jsx.indexOf('<FuelQuickLogPanel');
  const today = jsx.indexOf('<FuelTodayLogCard');
  assert.ok(macro !== -1 && typeIn !== -1 && today !== -1, 'notepad pieces missing');
  assert.ok(macro < typeIn && typeIn < today, 'order is remaining → type → today');
});

test('the Fuel house door first-paints Search, barcode & recipes, not Show all', () => {
  const src = page();
  assert.match(src, /fuelShowMore/);
  assert.match(src, /defaultValue: 'Search, barcode & recipes'/);
  assert.doesNotMatch(
    src,
    /fuelShowMore[\s\S]{0,80}defaultValue: 'Show all'/,
    'packs win — Show all hydrates into the Fuel lecture'
  );
});

test('the nutrition house is behind Show all, not on first paint', () => {
  const src = page();
  const jsx = src.slice(src.lastIndexOf('return ('));
  const open = jsx.split('<details')[0];
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
    assert.doesNotMatch(open, new RegExp(`<${name}\\b`), `${name} is on first paint`);
  }
  assert.match(jsx, /<details/);
  assert.match(jsx, /<FuelRecipesPanel\b/);
  assert.match(jsx, /<SignInPrompt\b/);
});

test('Fuel has no floating Log food — the notepad is the action', () => {
  const src = page();
  assert.doesNotMatch(src, /fuelLogFab/);
  assert.doesNotMatch(src, /fixed bottom-\[calc\(56px/);
});

test('the type field is the notepad', () => {
  const src = readFileSync(
    path.join(root, 'src/components/nutrition/FuelQuickLogPanel.tsx'),
    'utf8'
  );
  assert.match(src, /id="fuel-nl-meal"/);
  assert.match(src, /notepad/);
});
