/**
 * Learn is the intro, not a paths tour.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');
const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');

test('Learn first paint is the intro', () => {
  const src = stripComments(read('src/page-components/LearnPage.tsx'));
  assert.match(src, /<QuietLearnIntroCard\b/);
  assert.match(src, /className="house-learn"/);
  assert.doesNotMatch(src, /<LearnLockedPreview\b/);
});

test('leftover hops stay off /learn', () => {
  const src = stripComments(read('src/page-components/LearnPage.tsx'));
  const jsx = src.slice(src.lastIndexOf('return ('));
  for (const leftover of ['LearnLockedPreview', 'EmptyState', 'Button', 'Card']) {
    assert.doesNotMatch(jsx, new RegExp(`<${leftover}\\b`), `${leftover} is leftover on Learn`);
  }
  assert.doesNotMatch(jsx, /<details\b/);
  assert.doesNotMatch(src, /id="learn-paths"/);
  assert.doesNotMatch(src, /startWorkout\(/);
  assert.doesNotMatch(src, /usePremium/);
});

test('Train still does not mint a week; Track still the scale/tape log; Fuel still the log', () => {
  const active = stripComments(read('src/page-components/ActiveWorkoutPage.tsx'));
  assert.doesNotMatch(active, /from ['"]@\/hooks\/useCoachPlan['"]/);
  assert.doesNotMatch(active, /\bgenerateWeek\s*\(/);
  const track = stripComments(read('src/page-components/TrackPage.tsx'));
  assert.match(track, /<BodyMetricsCard\b/);
  const fuel = stripComments(read('src/page-components/NutritionPage.tsx'));
  assert.match(fuel, /data-testid="fuel-log-dock"/);
});
