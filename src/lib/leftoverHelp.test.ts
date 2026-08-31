/**
 * Help is the FAQ, not a legal-index tour.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');
const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');

test('Help first paint is the FAQ', () => {
  const src = stripComments(read('src/page-components/HelpPage.tsx'));
  assert.match(src, /className="house-help"/);
  assert.match(src, /HELP_FAQ/);
  assert.match(src, /data-testid="help-faq"/);
  assert.doesNotMatch(src, /showLegalFooter/);
});

test('leftover hops stay off /help', () => {
  const src = stripComments(read('src/page-components/HelpPage.tsx'));
  const jsx = src.slice(src.lastIndexOf('return ('));
  assert.doesNotMatch(jsx, /showLegalFooter/);
  assert.doesNotMatch(jsx, /<details\b/);
  assert.doesNotMatch(jsx, /<SignInPrompt\b/);
  assert.doesNotMatch(src, /InfoSection/);
});

test('Train still does not mint a week; Explore still the board; Fuel still the log', () => {
  const active = stripComments(read('src/page-components/ActiveWorkoutPage.tsx'));
  assert.doesNotMatch(active, /from ['"]@\/hooks\/useCoachPlan['"]/);
  assert.doesNotMatch(active, /\bgenerateWeek\s*\(/);
  const explore = stripComments(read('src/page-components/ExplorePlacesPage.tsx'));
  assert.match(explore, /<PinBoard\b/);
  assert.doesNotMatch(explore, /geolocation/);
  const fuel = stripComments(read('src/page-components/NutritionPage.tsx'));
  assert.match(fuel, /data-testid="fuel-log-dock"/);
});
