/**
 * Track is the scale/tape log, not a walks tour.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');
const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');

test('Track first paint is the scale/tape log', () => {
  const src = stripComments(read('src/page-components/TrackPage.tsx'));
  assert.match(src, /<BodyMetricsCard\b/);
  assert.match(src, /className="house-track"/);
  assert.doesNotMatch(src, /<TrackGpsPanel\b/);
});

test('leftover hops stay off /track', () => {
  const src = stripComments(read('src/page-components/TrackPage.tsx'));
  const jsx = src.slice(src.lastIndexOf('return ('));
  for (const leftover of [
    'TrackGpsPanel',
    'TrendAskCard',
    'TrackWeeklyInsights',
    'ActivityImportPanel',
    'ProfileWearablesCard',
    'EmptyState',
  ]) {
    assert.doesNotMatch(jsx, new RegExp(`<${leftover}\\b`), `${leftover} is leftover on Track`);
  }
  assert.doesNotMatch(jsx, /<details\b/);
  assert.doesNotMatch(src, /id="track-log"/);
  assert.doesNotMatch(src, /track-no-strap/);
  assert.doesNotMatch(src, /logActivity\(/);
});

test('Train still does not mint a week; Mind still the check-in; Fuel still the log', () => {
  const active = stripComments(read('src/page-components/ActiveWorkoutPage.tsx'));
  assert.doesNotMatch(active, /from ['"]@\/hooks\/useCoachPlan['"]/);
  assert.doesNotMatch(active, /\bgenerateWeek\s*\(/);
  const mind = stripComments(read('src/page-components/MindPage.tsx'));
  assert.match(mind, /<DailyCheckIn\b/);
  const fuel = stripComments(read('src/page-components/NutritionPage.tsx'));
  assert.match(fuel, /data-testid="fuel-log-dock"/);
});
