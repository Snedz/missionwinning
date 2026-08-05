
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

test('ProfileRewardsCard shows weekly challenges met line', () => {
  const src = readFileSync(
    join(import.meta.dirname, '..', '..', 'components', 'rewards', 'ProfileRewardsCard.tsx'),
    'utf8'
  );
  assert.match(src, /rewardProfileChallenges/);
  assert.match(src, /challengesComplete/);
  assert.match(src, /profile-rewards-challenges/);
});
