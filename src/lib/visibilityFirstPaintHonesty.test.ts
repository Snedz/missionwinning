/**
 * Visibility first paint is house leftover — title + report.
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

test('Visibility route is a static page, not a RouteLoading skeleton', () => {
  const route = stripComments(read('app/(app)/account/transparency/page.tsx'));
  assert.doesNotMatch(route, /dynamic\(|RouteLoading|Suspense/);
  assert.match(route, /import \{ TransparencyPage \}/);
});

test('TransparencyPage first paint is the visibility report', () => {
  const page = stripComments(read('src/page-components/TransparencyPage.tsx'));
  assert.doesNotMatch(page, /useSearchParams/);
  assert.match(page, /defaultValue: 'Visibility'/);
  assert.match(page, /TransparencyDownloads/);
});

test('DESIGN names Visibility first paint as house leftover', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /Visibility first paint is house leftover/);
});
