/**
 * Mind is the check-in, not a sessions tour.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');
const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');

test('Mind first paint is the check-in', () => {
  const src = stripComments(read('src/page-components/MindPage.tsx'));
  assert.match(src, /<DailyCheckIn\b/);
  assert.match(src, /className="house-mind"/);
  assert.doesNotMatch(src, /<BreathingTimer\b/);
});

test('leftover hops stay off /mind', () => {
  const src = stripComments(read('src/page-components/MindPage.tsx'));
  const jsx = src.slice(src.lastIndexOf('return ('));
  for (const leftover of [
    'BreathingTimer',
    'GuidedMindSessionRunner',
    'MindLockedPreview',
    'EmptyState',
    'ErrorState',
  ]) {
    assert.doesNotMatch(jsx, new RegExp(`<${leftover}\\b`), `${leftover} is leftover on Mind`);
  }
  assert.doesNotMatch(jsx, /<details\b/);
  assert.doesNotMatch(src, /id="mind-guided"/);
  assert.doesNotMatch(src, /mind-show-all/);
  assert.doesNotMatch(src, /MIND_COLLECTIONS/);
  assert.doesNotMatch(src, /getContentInventory/);
  assert.doesNotMatch(src, /fetchPremiumCatalogJson/);
});

test('Train still does not mint a week; Move still the quiet log; Fuel still the log', () => {
  const active = stripComments(read('src/page-components/ActiveWorkoutPage.tsx'));
  assert.doesNotMatch(active, /from ['"]@\/hooks\/useCoachPlan['"]/);
  assert.doesNotMatch(active, /\bgenerateWeek\s*\(/);
  const move = stripComments(read('src/page-components/MovePage.tsx'));
  assert.match(move, /<QuietMoveLogCard\b/);
  const fuel = stripComments(read('src/page-components/NutritionPage.tsx'));
  assert.match(fuel, /data-testid="fuel-log-dock"/);
});
