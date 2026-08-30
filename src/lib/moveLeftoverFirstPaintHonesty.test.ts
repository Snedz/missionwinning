/**
 * Move first paint is house leftover — title + flow list / quiet log.
 * useSearchParams made the page a Suspense child. Do not restart Move chrome.
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

test('Move route is a static page, not a RouteLoading skeleton', () => {
  const route = stripComments(read('app/(app)/move/page.tsx'));
  assert.doesNotMatch(route, /dynamic\(|RouteLoading|Suspense/);
  assert.match(route, /import \{ MovePage \}/);
  assert.match(route, /searchParams/);
  assert.match(route, /initialCollection/);
});

test('MovePage does not read useSearchParams', () => {
  const page = stripComments(read('src/page-components/MovePage.tsx'));
  assert.doesNotMatch(page, /useSearchParams/);
  assert.match(page, /initialCollection/);
  assert.match(page, /defaultValue: 'Move & Mobility'/);
});

test('DESIGN names Move first paint as house leftover', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /Move first paint is house leftover/);
});
