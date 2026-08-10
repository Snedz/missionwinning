/**
 * rewardBadgeCount pack uses {{n}}; callers must pass `n` or athletes see "badges earned" with raw {{n}}.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..', '..');

test('TodayRewardsCard interpolates rewardBadgeCount with n', () => {
  const src = readFileSync(
    join(root, 'src/components/rewards/TodayRewardsCard.tsx'),
    'utf8'
  );
  assert.match(src, /rewardBadgeCount/);
  assert.match(src, /\bn:\s*summary\.badges\.length/);
});

test('locale rewardBadgeCount uses {{n}} placeholder', () => {
  const src = readFileSync(join(root, 'src/i18n/rewardsLocales.ts'), 'utf8');
  assert.match(src, /rewardBadgeCount:\s*'\{\{n\}\} badges earned'/);
});
