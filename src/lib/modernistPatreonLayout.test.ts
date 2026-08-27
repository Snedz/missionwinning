/**
 * `.1049` — modernist tokens + unsigned Patreon structure.
 * Tokens stay DESIGN_SYSTEM. Layout is shelves + 64px nav + set table.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { primaryNavLinks } from '@/components/marketing/footerLinks';
import { APP_BUILD_LABEL } from '@/lib/buildInfo';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

test('public nav cluster is Train / Coach / History / About', () => {
  const gated = primaryNavLinks({ gated: true });
  const open = primaryNavLinks({ gated: false });
  assert.deepEqual(
    gated.map((l) => l.defaultValue),
    ['Train', 'Coach', 'History', 'About']
  );
  assert.equal(gated[0].href, '/active');
  assert.equal(gated[1].href, '/private#coach');
  assert.equal(gated[2].href, '/private#history');
  assert.equal(open[1].href, '/coach');
  assert.equal(open[2].href, '/history');
});

test('www nav cluster matches the door words', () => {
  const src = read('sites/www/src/lib/homeContent.ts');
  assert.match(src, /href: '\/#logger',\s*label: 'Train'/);
  assert.match(src, /href: '\/#adapt',\s*label: 'Coach'/);
  assert.match(src, /href: '\/#history',\s*label: 'History'/);
  assert.match(src, /href: '\/about',\s*label: 'About'/);
});

test('door mounts the set table and Patreon nav', () => {
  const teaser = read('app/private/PrivateTeaserClient.tsx');
  const table = read('src/components/public/GateSetTable.tsx');
  const css = read('app/private/gate.css');
  assert.match(teaser, /GateSetTable/);
  assert.match(teaser, /gate-nav/);
  assert.match(table, /data-mw-set-table/);
  assert.match(table, /Bench press/);
  assert.match(css, /height:\s*64px/);
  assert.doesNotMatch(teaser + table + css, /#faf9f5|#cc785c|(?<![A-Za-z])Inter(?![A-Za-z])/);
});

test('www homepage uses shared nav and an ink footer', () => {
  const index = read('sites/www/src/pages/index.astro');
  assert.match(index, /WwwNav/);
  assert.match(index, /WwwFooter/);
  assert.match(index, /id="logger"/);
  assert.match(index, /id="history"/);
  assert.doesNotMatch(index, /CinematicWww/);
});

test('account settings stay on /account with More settings and import', () => {
  const page = read('src/page-components/AccountPage.tsx');
  assert.match(page, /accountMoreSettings/);
  assert.match(page, /id="import"/);
  assert.match(page, /Account/);
  assert.match(page, /Units/);
});

test('this stamp is .1049', () => {
  assert.equal(APP_BUILD_LABEL, '2026.07-unified.1049');
});
