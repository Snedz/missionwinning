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

test('Move first paint is the quiet log, not a flow tour', () => {
  assert.match(page, /<QuietMoveLogCard\b/);
  assert.match(page, /moveQuietHint/);
  assert.doesNotMatch(page, /defaultValue: 'Start Flow'/);
  assert.doesNotMatch(page, /defaultValue: 'Recent Move Wins'/);
  assert.doesNotMatch(page, /No Move sessions logged yet/);
  assert.doesNotMatch(page, /your first win shows here/);
  assert.doesNotMatch(page, /free flows below still work/);
});
