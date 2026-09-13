/**
 * Builder first paint is house leftover — title + Blank workout / saved.
 * ProgramTemplatesPanel internals stay parked. RouteLoading is not the product.
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

test('Builder route is a static page, not a RouteLoading skeleton', () => {
  const route = stripComments(read('app/(app)/builder/page.tsx'));
  assert.doesNotMatch(route, /dynamic\(|RouteLoading|Suspense/);
  assert.match(route, /import \{ BuilderPage \}/);
});

test('BuilderPage first paint is house leftover; templates stay parked', () => {
  const page = stripComments(read('src/page-components/BuilderPage.tsx'));
  assert.doesNotMatch(page, /useSearchParams/);
  assert.match(page, /className="house-builder"/);
  assert.match(page, /defaultValue: 'Workout Builder'/);
  assert.match(page, /builderStartBlank|Blank workout/);
  assert.match(page, /ProgramTemplatesPanel/);
});

test('DESIGN names Builder first paint as house leftover', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /Builder first paint is house leftover/);
});
