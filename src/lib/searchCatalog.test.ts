import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { filterSearchCatalog, summaryPinIdForHref } from './searchCatalog.ts';

const items = [
  { href: '/nutrition', label: 'Fuel' },
  { href: '/coach', label: 'Coach' },
  { href: '/active', label: 'Train' },
  { href: '/history', label: 'History' },
  { href: '/learn/guide', label: 'Guidebook' },
];

test('empty query keeps the catalog', () => {
  assert.equal(filterSearchCatalog(items, '').length, items.length);
  assert.equal(filterSearchCatalog(items, '   ').length, items.length);
});

test('query matches label or path, case-insensitive', () => {
  assert.deepEqual(
    filterSearchCatalog(items, 'fuel').map((i) => i.href),
    ['/nutrition']
  );
  assert.deepEqual(
    filterSearchCatalog(items, 'NUTRITION').map((i) => i.href),
    ['/nutrition']
  );
  assert.deepEqual(
    filterSearchCatalog(items, 'guide').map((i) => i.href),
    ['/learn/guide']
  );
});

test('unknown query is an honest empty, not a new room', () => {
  assert.deepEqual(filterSearchCatalog(items, 'delivery'), []);
});

test('only Fuel, Coach, and Train can pin to Summary', () => {
  assert.equal(summaryPinIdForHref('/nutrition'), 'fuel');
  assert.equal(summaryPinIdForHref('/coach'), 'coach');
  assert.equal(summaryPinIdForHref('/active'), 'session');
  assert.equal(summaryPinIdForHref('/history'), null);
  assert.equal(summaryPinIdForHref('/learn'), null);
});

test('Search is a field on the sheet, not a /search route', () => {
  const root = path.join(import.meta.dirname, '..', '..');
  assert.equal(existsSync(path.join(root, 'app/(app)/search/page.tsx')), false);
  const src = readFileSync(path.join(root, 'src/components/layout/MoreSheet.tsx'), 'utf8');
  assert.match(src, /data-testid="search-catalog-field"/);
  assert.match(src, /filterSearchCatalog\(/);
  assert.match(src, /summaryPinIdForHref\(/);
  assert.match(src, /toggleSummaryPinId\(/);
  assert.match(src, /STORAGE_KEYS\.summaryPins/);
  assert.match(src, /data-testid="search-catalog-pin"/);
});
