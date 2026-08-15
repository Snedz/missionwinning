/**
 * U1 — History first paint matches the EN pack.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const page = readFileSync(
  path.join(import.meta.dirname, '..', '..', 'src/page-components/HistoryPage.tsx'),
  'utf8',
);

test('History title first-paints Workout History', () => {
  assert.match(page, /historyTitle[\s\S]{0,40}defaultValue: 'Workout History'/);
  assert.doesNotMatch(page, /defaultValue: 'Past sessions'/);
});

test('History session count first-paints the pack shape', () => {
  assert.match(page, /defaultValue: '\{\{count\}\} completed session'/);
  assert.doesNotMatch(page, /defaultValue: '1 completed session'/);
});

test('History empty and subtitle first-paint the pack', () => {
  assert.match(page, /Your history powers Today readiness and Mission Score\./);
  assert.match(page, /History fills from what you finish\./);
  assert.match(page, /No sessions match these filters/);
});
