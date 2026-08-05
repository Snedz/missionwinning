import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

test('TodayRewardsCard shows challenges + progressbar a11y', () => {
  const src = readFileSync(
    join(import.meta.dirname, '..', '..', 'components', 'rewards', 'TodayRewardsCard.tsx'),
    'utf8'
  );
  assert.match(src, /today-rewards-challenges/);
  assert.match(src, /challengesComplete/);
  assert.match(src, /role="progressbar"/);
  assert.match(src, /aria-valuenow/);
});
