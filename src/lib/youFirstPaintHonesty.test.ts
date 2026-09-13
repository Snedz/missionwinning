/**
 * You first paint is house leftover — identity / kit / Account door.
 * dynamic() + RouteLoading made the served HTML a skeleton.
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

test('You route is a static page, not a RouteLoading skeleton', () => {
  const route = stripComments(read('app/(app)/profile/page.tsx'));
  assert.doesNotMatch(route, /dynamic\(|RouteLoading|Suspense/);
  assert.match(route, /import \{ ProfilePage \}/);
});

test('ProfilePage first paint is house leftover objects', () => {
  const page = stripComments(read('src/page-components/ProfilePage.tsx'));
  assert.doesNotMatch(page, /useSearchParams/);
  assert.match(page, /className="house-profile"/);
  assert.match(page, /data-testid="athlete-page-kit-root"/);
  assert.match(page, /AthleteIdentityCard/);
  assert.match(page, /AthletePageKitCard/);
  assert.match(page, /house-btn house-btn-ghost/);
  assert.match(page, /href="\/account"/);
});

test('DESIGN names You first paint as house leftover', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /You first paint is house leftover/);
});
