/**
 * AD1 — Learn locked preview first-paints the EN pack.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const src = readFileSync(
  path.join(import.meta.dirname, '..', '..', 'src/components/learn/LearnLockedPreview.tsx'),
  'utf8',
);

test('Learn locked preview first-paints Read intro chapter arrow', () => {
  assert.match(src, /defaultValue: 'Read intro chapter →'/);
  assert.doesNotMatch(src, /defaultValue: 'Read intro chapter'/);
});
