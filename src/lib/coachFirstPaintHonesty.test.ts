/**
 * Coach first paint is house leftover — title + empty/generate or week.
 * Voice / chat stay parked. RouteLoading is not the product.
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

test('Coach route is a static page, not a RouteLoading skeleton', () => {
  const route = stripComments(read('app/(app)/coach/page.tsx'));
  assert.doesNotMatch(route, /dynamic\(|RouteLoading|Suspense/);
  assert.match(route, /import \{ CoachPage \}/);
  assert.match(route, /searchParams/);
  assert.match(route, /askExerciseId/);
});

test('CoachPage first paint is house leftover; voice stays parked', () => {
  const page = stripComments(read('src/page-components/CoachPage.tsx'));
  assert.doesNotMatch(page, /useSearchParams/);
  assert.match(page, /className="house-plan max-w-2xl pb-24"/);
  assert.match(page, /defaultValue: 'Mission Coach'/);
  assert.match(page, /house-empty|house-generate-dock/);
  assert.match(page, /ssr: false/);
  assert.match(page, /askExerciseId/);
});

test('DESIGN names Coach first paint as house leftover', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /Coach first paint is house leftover/);
});
