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

test('Learn first paint is the intro, not a paths tour', () => {
  assert.match(page, /QuietLearnIntroCard/);
  assert.match(page, /Log a set\. Then Coach from those logs\./);
  assert.doesNotMatch(page, /No paths match that search\./);
  assert.doesNotMatch(page, /clear search to see all free paths/);
  assert.doesNotMatch(page, /Open Guidebook →/);
  assert.doesNotMatch(page, /Start Bodyweight Sample →/);
  assert.doesNotMatch(page, /Open specialist courses →/);
  assert.doesNotMatch(page, /<details\b/);
});
