/**
 * Super Bundle first paint is house leftover — title + offer.
 * useSearchParams + RouteLoading made the served HTML a skeleton.
 * Phantom checkout stays parked. Free-beta still 307s to /notify.
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

test('Bundle route is a static page, not a RouteLoading skeleton', () => {
  const route = stripComments(read('app/bundle/page.tsx'));
  assert.doesNotMatch(route, /RouteLoading|Suspense/);
  assert.match(route, /import \{ BundlePage \}/);
  assert.match(route, /isFreeBeta/);
  assert.match(route, /redirect\('\/notify'\)/);
  assert.match(route, /initialCheckout/);
});

test('BundlePage first paint is the offer; Phantom checkout stays parked', () => {
  const page = stripComments(read('src/page-components/BundlePage.tsx'));
  assert.doesNotMatch(page, /useSearchParams/);
  assert.match(page, /initialCheckout/);
  assert.match(page, /ssr: false/);
});

test('DESIGN names Super Bundle first paint as house leftover', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /Super Bundle first paint is house leftover/);
});
