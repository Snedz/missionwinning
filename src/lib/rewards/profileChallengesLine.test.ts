import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Weekly challenges belong on Today, not on the Athlete Page shelf.
 * IDENTITY_SOCIAL_PLAN §3: You is badges with provenance, not a scoreboard.
 */

test('TodayRewardsCard still shows weekly challenges met', () => {
  const src = readFileSync(
    join(import.meta.dirname, '..', '..', 'components', 'rewards', 'TodayRewardsCard.tsx'),
    'utf8'
  );
  assert.match(src, /rewardProfileChallenges/);
  assert.match(src, /challengesComplete/);
});

test('ProfileRewardsCard does not show weekly challenges or XP', () => {
  const src = readFileSync(
    join(import.meta.dirname, '..', '..', 'components', 'rewards', 'ProfileRewardsCard.tsx'),
    'utf8'
  );
  assert.doesNotMatch(src, /rewardProfileChallenges/);
  assert.doesNotMatch(src, /challengesComplete/);
  assert.doesNotMatch(src, /xpTotal/);
  assert.doesNotMatch(src, /profile-rewards-challenges/);
});
