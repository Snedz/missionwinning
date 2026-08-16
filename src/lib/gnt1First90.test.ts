/**
 * GNT-1 U5 — first-90 tap budget and first-paint cap stay the written bar.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

test('first-90 TAP_BUDGET is 4 and must not be raised', () => {
  const src = read('tests/e2e/first-90.spec.ts');
  assert.match(src, /const TAP_BUDGET = 4/);
  assert.match(src, /never raise this/);
  assert.match(src, /goto\('\/welcome'/);
  assert.match(src, /toHaveURL\(\/\\\/log\//);
  assert.match(src, /toHaveURL\(\/\\\/active\//);
  assert.match(src, /\/\^log\( set\)\?\$\/i/);
  assert.match(src, /data-exercise-id/);
  assert.match(src, /toHaveCount\(1\)/);
});

test('logger-depth walk reaches Victory / Back to Today', () => {
  const src = read('tests/e2e/logger-depth.spec.ts');
  assert.match(src, /back to today/i);
});

test('first-paint drift cap is 167 and down-only', () => {
  const src = read('src/lib/firstPaintFloor.test.ts');
  assert.match(src, /const MAX_FIRST_PAINT_COPY_DRIFT = 167/);
  assert.match(src, /Down only from here/);
});
