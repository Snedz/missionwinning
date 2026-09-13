/**
 * Guidebook first paint is house leftover — title + chapter list.
 * RouteLoading is not the product. Do not restyle guidebook internals.
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

test('Guidebook route is a static page, not a RouteLoading skeleton', () => {
  const route = stripComments(read('app/(app)/learn/guide/page.tsx'));
  assert.doesNotMatch(route, /dynamic\(|RouteLoading|Suspense/);
  assert.match(route, /import \{ GuidebookIndexPage \}/);
});

test('GuidebookIndexPage first paint is title + chapters', () => {
  const page = stripComments(read('src/page-components/GuidebookIndexPage.tsx'));
  assert.doesNotMatch(page, /useSearchParams/);
  assert.match(page, /defaultValue: 'Beyond the Basics'/);
});

test('DESIGN names Guidebook first paint as house leftover', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /Guidebook first paint is house leftover/);
});
