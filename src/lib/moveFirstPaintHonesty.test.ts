/**
 * V1 — Move first paint matches the EN pack.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const page = readFileSync(
  path.join(import.meta.dirname, '..', '..', 'src/page-components/MovePage.tsx'),
  'utf8',
);

test('Move title first-paints Move & Mobility', () => {
  assert.match(page, /moveTitle[\s\S]{0,40}defaultValue: 'Move & Mobility'/);
  assert.doesNotMatch(page, /defaultValue: 'Mobility'/);
});

test('Move chrome first-paints the pack', () => {
  assert.match(page, /defaultValue: 'Start Flow'/);
  assert.match(page, /defaultValue: 'Recent Move Wins'/);
  assert.match(page, /No Move sessions logged yet/);
  assert.match(page, /your first win shows here/);
  assert.match(page, /free flows below still work/);
});
