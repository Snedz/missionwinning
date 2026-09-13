/**
 * Under the Hood first paint is house leftover — title + weights.
 * RouteLoading is not the product. Do not invent room chrome.
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

test('Under the Hood route is a static page, not a RouteLoading skeleton', () => {
  const route = stripComments(read('app/(app)/account/under-the-hood/page.tsx'));
  assert.doesNotMatch(route, /dynamic\(|RouteLoading|Suspense/);
  assert.match(route, /import \{ UnderTheHoodPage \}/);
});

test('UnderTheHoodPage first paint is the published weights page', () => {
  const page = stripComments(read('src/page-components/UnderTheHoodPage.tsx'));
  assert.doesNotMatch(page, /useSearchParams/);
  assert.match(page, /defaultValue: 'Under the Hood'/);
  assert.match(page, /WeightsPanel/);
});

test('DESIGN names Under the Hood first paint as house leftover', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /Under the Hood first paint is house leftover/);
});
