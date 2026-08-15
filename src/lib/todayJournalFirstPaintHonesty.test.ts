/**
 * AF1 — Today journal strip first-paints the EN pack.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const src = readFileSync(
  path.join(import.meta.dirname, '..', '..', 'src/components/today/TodayJournalStrip.tsx'),
  'utf8',
);

test('Today journal strip first-paints Log check-in arrow', () => {
  assert.match(src, /defaultValue: 'Log check-in →'/);
  assert.doesNotMatch(src, /defaultValue: 'Log check-in'(?! →)/);
});
