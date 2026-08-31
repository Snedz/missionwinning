/**
 * Move is the quiet log, not a flow tour.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');
const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');

test('Move first paint is the quiet log', () => {
  const src = stripComments(read('src/page-components/MovePage.tsx'));
  const jsx = src.slice(src.lastIndexOf('return ('));
  assert.match(src, /<QuietMoveLogCard\b/);
  assert.match(src, /className="house-move"/);
  assert.doesNotMatch(jsx, /id="move-flows"/);
});

test('leftover hops stay off /move', () => {
  const src = stripComments(read('src/page-components/MovePage.tsx'));
  const jsx = src.slice(src.indexOf('return ('));
  for (const leftover of [
    'TimedFlowRunner',
    'MoveLockedPreview',
    'EmptyState',
    'ErrorState',
  ]) {
    assert.doesNotMatch(jsx, new RegExp(`<${leftover}\\b`), `${leftover} is leftover on Move`);
  }
  assert.doesNotMatch(jsx, /<details\b/);
  assert.doesNotMatch(src, /id="move-flows"/);
  assert.doesNotMatch(src, /renderFlowGrid/);
  assert.doesNotMatch(src, /MOVE_COLLECTIONS/);
  assert.doesNotMatch(src, /getContentInventory/);
  assert.doesNotMatch(src, /fetchPremiumCatalogJson/);
});

test('Train still does not mint a week; Fuel still the log; Coach still writes the week', () => {
  const active = stripComments(read('src/page-components/ActiveWorkoutPage.tsx'));
  assert.doesNotMatch(active, /from ['"]@\/hooks\/useCoachPlan['"]/);
  assert.doesNotMatch(active, /\bgenerateWeek\s*\(/);
  const door = read('src/hooks/useCoachPlan.ts');
  assert.match(door, /\bgenerateWeek\s*\(/);
  const coach = stripComments(read('src/page-components/CoachPage.tsx'));
  assert.match(coach, /data-testid="coach-generate-dock"/);
  const fuel = stripComments(read('src/page-components/NutritionPage.tsx'));
  assert.match(fuel, /data-testid="fuel-log-dock"/);
});
