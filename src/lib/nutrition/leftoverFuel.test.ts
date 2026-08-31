/**
 * Fuel is the log, not a tour — empty + Log meal, or today's meals.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');
const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');

test('Fuel empty is Log meal; a day is today\'s meals', () => {
  const src = stripComments(read('src/page-components/NutritionPage.tsx'));
  assert.match(src, /data-testid="fuel-log-dock"/);
  assert.match(src, /className="house-empty"/);
  assert.match(src, /FuelLogSheet/);
  assert.match(src, /FuelTodayLogCard/);
  assert.match(src, /setLogSheetOpen\(true\)/);
});

test('leftover hops stay off /nutrition', () => {
  const src = stripComments(read('src/page-components/NutritionPage.tsx'));
  const jsx = src.slice(src.indexOf('return ('));
  for (const leftover of [
    'FuelMacroOverview',
    'FuelQuickLogPanel',
    'FuelAdaptBanner',
    'FuelTargetsEditor',
    'FuelGoalWizard',
    'FuelWeekGlance',
    'FuelRestockCard',
    'FuelWeightStrip',
    'FuelMoreTools',
    'FuelRecipesPanel',
    'FuelPastDaysCard',
    'SignInPrompt',
    'UnlockButton',
  ]) {
    assert.doesNotMatch(jsx, new RegExp(`<${leftover}\\b`), `${leftover} is leftover on Fuel`);
  }
  assert.doesNotMatch(jsx, /<details\b/);
  assert.doesNotMatch(jsx, /fuelShowMore/);
  assert.doesNotMatch(jsx, /mode="notepad"/);
});

test('Train still does not mint a week; Log set stays filled; Coach still writes the week', () => {
  const active = stripComments(read('src/page-components/ActiveWorkoutPage.tsx'));
  assert.doesNotMatch(active, /from ['"]@\/hooks\/useCoachPlan['"]/);
  assert.doesNotMatch(active, /\bgenerateWeek\s*\(/);
  const door = read('src/hooks/useCoachPlan.ts');
  assert.match(door, /\bgenerateWeek\s*\(/);
  const coach = stripComments(read('src/page-components/CoachPage.tsx'));
  assert.match(coach, /data-testid="coach-generate-dock"/);
});
