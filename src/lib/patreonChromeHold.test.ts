/**
 * Holds for the Patreon costume (`.1051`).
 *
 * The costume may restyle www + signed-in chrome. It may not rewrite the
 * modernist wireframe doc, the tight lock, Today’s one Start, or invent a feed.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

const LOCK = [
  'app/private/page.tsx',
  'app/private/layout.tsx',
  'app/private/GateTeaser.tsx',
  'app/private/PrivateTeaserClient.tsx',
  'app/private/gate.css',
  'src/i18n/gateEn.ts',
] as const;

test('modernist DESIGN_SYSTEM.md is still the wireframe, not overwritten', () => {
  const src = read('docs/DESIGN_SYSTEM.md');
  assert.match(src, /ink on paper|paper\/ink/i);
  assert.match(src, /Archivo/);
  assert.match(src, /zero corner radius/i);
  assert.match(src, /`--accent-poster`/);
  assert.doesNotMatch(src, /ABC Oracle Plus/);
});

test('Patreon token sheet exists and is the closed set', () => {
  const sheet = read('docs/DESIGN_PATREON.md');
  const css = read('src/styles/patreonTokens.css');
  assert.match(sheet, /#ffffff|#fff/i);
  assert.match(sheet, /#000000|#000\b/);
  assert.match(sheet, /rgba\(0,0,0,0\.6\)/);
  assert.match(sheet, /rgba\(0,0,0,0\.09\)/);
  assert.match(sheet, /rgb\(0,\s*96,\s*170\)/);
  assert.match(sheet, /9999px/);
  assert.match(sheet, /72px/);
  assert.match(sheet, /264px/);
  assert.match(sheet, /not licensable|do not ship ABC Oracle/i);
  assert.match(css, /\.ptn\b/);
  assert.match(css, /--ptn-tab:\s*rgb\(0,\s*96,\s*170\)/);
  assert.match(css, /--ptn-icon-rail:\s*72px/);
  assert.match(css, /--ptn-studio-rail:\s*264px/);
  assert.doesNotMatch(css, /\binter\b/i);
});

test('tight-lock files do not import the costume and stay unstyled by .ptn', () => {
  for (const file of LOCK) {
    assert.ok(existsSync(path.join(root, file)), `${file} missing`);
    const src = read(file);
    assert.doesNotMatch(src, /patreonTokens/);
    assert.doesNotMatch(src, /\bptn-/);
    assert.doesNotMatch(src, /DESIGN_PATREON/);
  }
});

test('Today stays one Start and is not a feed', () => {
  const dash = read('src/page-components/HomeTodayDashboard.tsx');
  const lean = read('src/page-components/HomeTodayLean.tsx');
  const home = read('src/page-components/HomePage.tsx');
  for (const [name, src] of [
    ['HomeTodayDashboard', dash],
    ['HomeTodayLean', lean],
    ['HomePage', home],
  ] as const) {
    assert.doesNotMatch(src, /\bFeed\b/, `${name} grew a Feed`);
    assert.doesNotMatch(src, /recommended creators/i, `${name} grew a creator rail`);
    assert.doesNotMatch(src, /discord\.gg|discord\.com/i, `${name} grew Discord`);
    assert.doesNotMatch(src, /share-to-unlock/i, `${name} grew share-to-unlock`);
  }
  assert.match(dash, /JourneyHero/, 'dashboard still docks the one Start');
  assert.match(lean, /JourneyHero/, 'lean still docks the one Start');
});

test('www still reads homeContent — no invented traction', () => {
  const home = read('sites/www/src/lib/homeContent.ts');
  assert.match(home, /Log a set\./);
  assert.match(home, /Your week rewrites itself\./);
  assert.doesNotMatch(home, /\b\d[\d,.]*\s*(athletes|users|sign-?ups|members)\b/i);
  assert.doesNotMatch(home, /we're live/i);
});
