/**
 * Course first paint is house leftover — title + locked / empty.
 * useSearchParams + RouteLoading made the served HTML a skeleton.
 * Do not restyle CourseReader internals.
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

test('Course route is a static page, not a RouteLoading skeleton', () => {
  const route = stripComments(read('app/(app)/learn/course/page.tsx'));
  assert.doesNotMatch(route, /dynamic\(|RouteLoading|Suspense/);
  assert.match(route, /import \{ LearnCoursePage \}/);
  assert.match(route, /searchParams/);
  assert.match(route, /initialChapter/);
});

test('LearnCoursePage does not read useSearchParams', () => {
  const page = stripComments(read('src/page-components/LearnCoursePage.tsx'));
  assert.doesNotMatch(page, /useSearchParams/);
  assert.match(page, /initialChapter/);
  assert.match(page, /defaultValue: 'Specialist courses'/);
});

test('DESIGN names Course first paint as house leftover', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /Course first paint is house leftover/);
});
