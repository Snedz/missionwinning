/**
 * Track first paint is house leftover — title + weight / tape.
 * Walks / GPS stay parked. RouteLoading is not the product.
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

test('Track route is a static page, not a RouteLoading skeleton', () => {
  const route = stripComments(read('app/(app)/track/page.tsx'));
  assert.doesNotMatch(route, /dynamic\(|RouteLoading|Suspense/);
  assert.match(route, /import \{ TrackPage \}/);
});

test('TrackPage first paint is house leftover; walks / GPS stay parked', () => {
  const page = stripComments(read('src/page-components/TrackPage.tsx'));
  assert.doesNotMatch(page, /useSearchParams/);
  assert.match(page, /className="house-track"/);
  assert.match(page, /defaultValue: 'Track'/);
});

test('DESIGN names Track first paint as house leftover', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /Track first paint is house leftover/);
});
