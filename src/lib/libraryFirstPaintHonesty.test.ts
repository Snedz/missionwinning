/**
 * Library first paint is house leftover — title + catalog list.
 * Posters / merge stay parked. RouteLoading is not the product.
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

test('Library route is a static page, not a RouteLoading skeleton', () => {
  const route = stripComments(read('app/(app)/library/page.tsx'));
  assert.doesNotMatch(route, /dynamic\(|RouteLoading|Suspense/);
  assert.match(route, /import \{ LibraryPage \}/);
});

test('LibraryPage first paint is house leftover; posters / merge stay parked', () => {
  const page = stripComments(read('src/page-components/LibraryPage.tsx'));
  assert.doesNotMatch(page, /useSearchParams/);
  assert.match(page, /className="house-catalog"/);
  assert.match(page, /defaultValue: 'Exercise Library'/);
  assert.match(page, /data-testid="library-exercise-list"/);
  assert.match(page, /library-show-all|library-merge-open/);
});

test('DESIGN names Library first paint as house leftover', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /Library first paint is house leftover/);
});
