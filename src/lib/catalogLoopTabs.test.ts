/**
 * Library + Builder is one catalog with state tabs.
 * Not Explore. Not a shop. Not a second catalog route.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');
const TABS = 'src/components/layout/CatalogLoopTabs.tsx';

test('Library and Builder mount the catalog tabs', () => {
  assert.ok(existsSync(path.join(root, TABS)), 'CatalogLoopTabs.tsx missing');
  const tabs = read(TABS);
  assert.match(tabs, /href:\s*['"]\/library['"]/);
  assert.match(tabs, /href:\s*['"]\/builder['"]/);
  assert.match(tabs, /data-testid="catalog-loop-tabs"/);
  assert.doesNotMatch(tabs, /\/explore|\/shop|\/programs/);

  const library = read('src/page-components/LibraryPage.tsx');
  const builder = read('src/page-components/BuilderPage.tsx');
  assert.match(library, /CatalogLoopTabs/);
  assert.match(builder, /CatalogLoopTabs/);
  assert.match(library, /active=["']library["']/);
  assert.match(builder, /active=["']builder["']/);
});
