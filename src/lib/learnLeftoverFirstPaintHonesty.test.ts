/**
 * Learn first paint is house leftover — title + quiet intro.
 * RouteLoading is not the product. Do not restart Learn chrome.
 * Guide / course stay parked this hop.
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

test('Learn route is a static page, not a RouteLoading skeleton', () => {
  const route = stripComments(read('app/(app)/learn/page.tsx'));
  assert.doesNotMatch(route, /dynamic\(|RouteLoading|Suspense/);
  assert.match(route, /import \{ LearnPage \}/);
  assert.match(route, /searchParams/);
  assert.match(route, /initialPath/);
});

test('LearnPage does not read useSearchParams', () => {
  const page = stripComments(read('src/page-components/LearnPage.tsx'));
  assert.doesNotMatch(page, /useSearchParams/);
  assert.match(page, /initialPath/);
  assert.match(page, /defaultValue: 'Learn'/);
});

test('DESIGN names Learn first paint as house leftover', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /Learn first paint is house leftover/);
});
