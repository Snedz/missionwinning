
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

test('en/today.json carries core reward* athlete strings', () => {
  const j = JSON.parse(
    readFileSync(join(import.meta.dirname, '..', '..', '..', 'public/locales/en/today.json'), 'utf8')
  );
  for (const k of [
    'rewardTodayTitle',
    'rewardWeeklyGoal',
    'rewardVictoryXp',
    'rewardProfileTitle',
    'rewardRank1',
    'rewardRank10',
    'rewardBadgeFirstBlood',
    'whatsNewBulletRewardsTitle',
    'whatsNewBulletRewardsBody',
  ]) {
    assert.equal(typeof j[k], 'string', k);
    assert.ok(j[k].length > 0, k);
  }
});
