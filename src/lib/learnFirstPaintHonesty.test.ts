/**
 * Y1 — Learn first paint matches the EN pack.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const page = readFileSync(
  path.join(import.meta.dirname, '..', '..', 'src/page-components/LearnPage.tsx'),
  'utf8',
);

test('Learn title first-paints Learn & Master', () => {
  assert.match(page, /learnTitle[\s\S]{0,40}defaultValue: 'Learn & Master'/);
  assert.doesNotMatch(page, /learnTitle[\s\S]{0,40}defaultValue: 'Learn'/);
});

test('Learn chrome first-paints the pack', () => {
  assert.match(page, /No paths match that search\./);
  assert.match(page, /clear search to see all free paths/);
  assert.match(page, /Open Guidebook →/);
  assert.match(page, /Start Bodyweight Sample →/);
  assert.match(page, /Open specialist courses →/);
});
