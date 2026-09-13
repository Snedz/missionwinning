/**
 * Benchmarks first paint is house leftover — title + stats / empty.
 * 1RM chart stays parked. RouteLoading is not the product.
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

test('Benchmarks route is a static page, not a RouteLoading skeleton', () => {
  const route = stripComments(read('app/(app)/benchmarks/page.tsx'));
  assert.doesNotMatch(route, /dynamic\(|RouteLoading|Suspense/);
  assert.match(route, /import \{ BenchmarksPage \}/);
});

test('BenchmarksPage first paint is title + stats; 1RM chart stays parked', () => {
  const page = stripComments(read('src/page-components/BenchmarksPage.tsx'));
  assert.doesNotMatch(page, /useSearchParams/);
  assert.match(page, /defaultValue: 'Benchmarks'/);
  assert.match(page, /ssr: false/);
});

test('DESIGN names Benchmarks first paint as house leftover', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /Benchmarks first paint is house leftover/);
});
