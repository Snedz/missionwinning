/**
 * Guide chapter first paint is house leftover — title + body.
 * RouteLoading is not the product. Do not restyle chapter internals.
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

test('Guide chapter route is a static page, not a RouteLoading skeleton', () => {
  const route = stripComments(read('app/(app)/learn/guide/[chapterId]/page.tsx'));
  assert.doesNotMatch(route, /dynamic\(|RouteLoading|Suspense/);
  assert.match(route, /import \{ GuidebookChapterPage \}/);
  assert.match(route, /chapterId/);
});

test('GuidebookChapterPage first paint is title + body', () => {
  const page = stripComments(read('src/page-components/GuidebookChapterPage.tsx'));
  assert.doesNotMatch(page, /useSearchParams/);
  assert.match(page, /chapterId/);
  assert.match(page, /defaultValue: 'Learn'/);
});

test('DESIGN names Guide chapter first paint as house leftover', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /Guide chapter first paint is house leftover/);
});
