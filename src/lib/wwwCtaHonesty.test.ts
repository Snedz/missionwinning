/**
 * K2 — Astro CTA is Alpha, not leftover “beta opens”.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

test('www gated CTA does not promise a future open beta', () => {
  const cta = read('sites/www/src/components/CtaSlot.astro');
  const home = read('sites/www/src/lib/homeContent.ts');
  assert.match(cta, /Get an invite/);
  assert.match(cta, /when Alpha is public/);
  assert.doesNotMatch(cta, /when the beta opens/i);
  assert.doesNotMatch(home, /when the beta opens/i);
  assert.match(home, /when Alpha is public/);
  const week = read('sites/www/src/lib/weekContent.ts');
  assert.doesNotMatch(week, /while the beta runs/i);
  assert.match(week, /while Alpha is gated/);
});
