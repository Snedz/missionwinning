/**
 * Leaderboard first paint is house leftover — title + board.
 * useSearchParams + RouteLoading made the served HTML a skeleton.
 * Do not invent room chrome.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
}

test('Leaderboard route is a static page, not a RouteLoading skeleton', () => {
  const route = stripComments(read('app/(app)/leaderboard/page.tsx'));
  assert.doesNotMatch(route, /dynamic\(|RouteLoading|Suspense/);
  assert.match(route, /import \{ LeaderboardPage \}/);
  assert.match(route, /searchParams/);
  assert.match(route, /initialBoard/);
});

test('LeaderboardPage does not read useSearchParams', () => {
  const page = stripComments(read('src/page-components/LeaderboardPage.tsx'));
  assert.doesNotMatch(page, /useSearchParams/);
  assert.match(page, /initialBoard/);
  assert.match(page, /defaultValue: 'Leaderboard'/);
});

test('DESIGN names Leaderboard first paint as house leftover', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /Leaderboard first paint is house leftover/);
});
