/**
 * Account first paint is house leftover — sign-in / return / prefs.
 * useSearchParams + RouteLoading made the served HTML a skeleton.
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

test('Account route is a static page, not a RouteLoading skeleton', () => {
  const route = stripComments(read('app/(app)/account/page.tsx'));
  assert.doesNotMatch(route, /dynamic\(|RouteLoading|Suspense/);
  assert.match(route, /import \{ AccountPage \}/);
  assert.match(route, /searchParams/);
  assert.match(route, /initialAuthError/);
});

test('AccountPage does not read useSearchParams', () => {
  const page = stripComments(read('src/page-components/AccountPage.tsx'));
  assert.doesNotMatch(page, /useSearchParams/);
  assert.match(page, /initialAuthError/);
  assert.match(page, /className="house-account"/);
  assert.match(page, /ProfileAccountCard/);
  assert.match(page, /ProfileRemindersCard/);
  assert.match(page, /ProfilePreferencesCard/);
});

test('DESIGN names Account first paint as house leftover', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /Account first paint is house leftover/);
});
