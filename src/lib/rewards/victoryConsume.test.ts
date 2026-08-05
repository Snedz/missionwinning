/**
 * Victory rewards line — consume-once contract (no peek-then-lose under remount).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

test('VictoryRewardsLine consumes once into state (no peek-then-consume race)', () => {
  const src = readFileSync(
    join(import.meta.dirname, '..', '..', 'components', 'rewards', 'VictoryRewardsLine.tsx'),
    'utf8'
  );
  assert.match(src, /consumeLastAwards/);
  assert.doesNotMatch(src, /peekLastAwards/);
  assert.match(src, /setSnap\(\(prev\)/);
});
