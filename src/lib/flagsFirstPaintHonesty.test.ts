/**
 * Flags console first paint is house leftover — title + subtitle.
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

test('Flags console route is a static page, not a RouteLoading skeleton', () => {
  const route = stripComments(read('app/(app)/account/flags/page.tsx'));
  assert.doesNotMatch(route, /dynamic\(|RouteLoading|Suspense/);
  assert.match(route, /import \{ FlagsConsolePage \}/);
  assert.match(route, /robots: \{ index: false, follow: false \}/);
});

test('FlagsConsolePage first paint is the leftover title, not a search-param skeleton', () => {
  const page = stripComments(read('src/page-components/FlagsConsolePage.tsx'));
  assert.doesNotMatch(page, /useSearchParams/);
  assert.match(page, /defaultValue: 'Feature flags'/);
  assert.match(page, /className="house-account"/);
  assert.match(page, /FlagsConsole/);
});

test('DESIGN names Flags console first paint as house leftover', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /Flags console first paint is house leftover/);
});
