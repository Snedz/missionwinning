/**
 * D3 — CareerLine empty invites a log, not a void.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const src = readFileSync(
  path.join(import.meta.dirname, '..', '..', 'src/components/profile/CareerLineCard.tsx'),
  'utf8',
);

test('CareerLine empty exits to /active', () => {
  assert.match(src, /if \(!hasCareer\(career\)\)/);
  assert.match(src, /href="\/active"/);
  assert.match(src, /careerLineEmptyAction/);
});
