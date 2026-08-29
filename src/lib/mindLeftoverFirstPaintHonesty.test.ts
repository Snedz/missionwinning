/**
 * Mind first paint is house leftover — title + check-in / breathe.
 * useSearchParams made the page a Suspense child. Do not restart Mind chrome.
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

test('Mind route is a static page, not a RouteLoading skeleton', () => {
  const route = stripComments(read('app/(app)/mind/page.tsx'));
  assert.doesNotMatch(route, /dynamic\(|RouteLoading|Suspense/);
  assert.match(route, /import \{ MindPage \}/);
  assert.match(route, /searchParams/);
  assert.match(route, /initialCollection/);
});

test('MindPage does not read useSearchParams', () => {
  const page = stripComments(read('src/page-components/MindPage.tsx'));
  assert.doesNotMatch(page, /useSearchParams/);
  assert.match(page, /initialCollection/);
  assert.match(page, /defaultValue: 'Mind'/);
});

test('DESIGN names Mind first paint as house leftover', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /Mind first paint is house leftover/);
});
