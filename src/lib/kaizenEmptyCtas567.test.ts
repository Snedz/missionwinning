import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..');

test('Fuel recipes empty has Log food exit to fuel-log', () => {
  const src = readFileSync(
    join(root, 'src/components/nutrition/FuelRecipesPanel.tsx'),
    'utf8'
  );
  assert.match(src, /fuelRecipesEmptyTitle/);
  assert.match(src, /fuel-log/);
  assert.match(src, /fuelEmptyCta|Log food/);
});

test('Benchmarks empty opens Today; no alert cheerleading', () => {
  const src = readFileSync(join(root, 'src/page-components/BenchmarksPage.tsx'), 'utf8');
  assert.match(src, /benchmarksEmptyCta|Open Today/);
  assert.match(src, /href=.\/log/);
  assert.doesNotMatch(src, /alert\(/);
  assert.match(src, /toast\(/);
});

test('Leaderboard squad empty focuses squad input', () => {
  const src = readFileSync(join(root, 'src/page-components/LeaderboardPage.tsx'), 'utf8');
  assert.match(src, /leaderboard-squad/);
  assert.match(src, /leaderboardSquadEmptyCta|Focus squad code/);
  assert.match(src, /getElementById\('leaderboard-squad'\)/);
});
