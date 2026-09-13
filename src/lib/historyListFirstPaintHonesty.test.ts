/**
 * History list first paint is house leftover — title + list/empty.
 * Calendar / charts / posters stay parked. RouteLoading is not the product.
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

test('History route is a static page, not a RouteLoading skeleton', () => {
  const route = stripComments(read('app/(app)/history/page.tsx'));
  assert.doesNotMatch(route, /dynamic\(|RouteLoading|Suspense/);
  assert.match(route, /import \{ HistoryPage \}/);
});

test('HistoryPage first paint is house leftover; calendar / charts stay parked', () => {
  const page = stripComments(read('src/page-components/HistoryPage.tsx'));
  assert.doesNotMatch(page, /useSearchParams/);
  assert.match(page, /className="house-history"/);
  assert.match(page, /defaultValue: 'Workout History'/);
  assert.match(page, /session-history-empty|house-list|house-item/);
  assert.match(page, /ssr: false/);
});

test('DESIGN names History list first paint as house leftover', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /History list first paint is house leftover/);
});
