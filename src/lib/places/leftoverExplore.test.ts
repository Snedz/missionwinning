/**
 * Explore is the board, not a GPS tour.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');
const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');

test('Explore first paint is the board, pin list, and add a place', () => {
  const src = stripComments(read('src/page-components/ExplorePlacesPage.tsx'));
  assert.match(src, /className="house-explore"/);
  assert.match(src, /<PinBoard\b/);
  assert.match(src, /exploreAddPlace|Add a place/);
  assert.doesNotMatch(src, /geolocation/);
});

test('leftover hops stay off /explore', () => {
  const src = stripComments(read('src/page-components/ExplorePlacesPage.tsx'));
  const jsx = src.slice(src.lastIndexOf('return ('));
  assert.doesNotMatch(src, /geolocation/);
  assert.doesNotMatch(src, /openStreetMapUrl/);
  assert.doesNotMatch(src, /tagSessionOnPlace/);
  assert.doesNotMatch(src, /useWorkoutStore/);
  assert.doesNotMatch(jsx, /showLegalFooter/);
  assert.doesNotMatch(jsx, /<details\b/);
});

test('Train still does not mint a week; Garage still quiet title; Fuel still the log', () => {
  const active = stripComments(read('src/page-components/ActiveWorkoutPage.tsx'));
  assert.doesNotMatch(active, /from ['"]@\/hooks\/useCoachPlan['"]/);
  assert.doesNotMatch(active, /\bgenerateWeek\s*\(/);
  const garage = stripComments(read('src/page-components/ServerPage.tsx'));
  assert.match(garage, /className="house-garage/);
  assert.doesNotMatch(garage, /<ChatWindow\b/);
  const fuel = stripComments(read('src/page-components/NutritionPage.tsx'));
  assert.match(fuel, /data-testid="fuel-log-dock"/);
});
