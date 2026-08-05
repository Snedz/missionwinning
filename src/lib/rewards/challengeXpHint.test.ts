
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { XP_BY_ACTION } from '@/lib/rewards/catalog';

test('TodayWeekSection challenge XP hint uses catalog SoT', () => {
  const src = readFileSync(
    join(import.meta.dirname, '..', '..', 'components', 'today', 'TodayWeekSection.tsx'),
    'utf8'
  );
  assert.match(src, /XP_BY_ACTION/);
  assert.match(src, /challenge_complete/);
  assert.equal(XP_BY_ACTION.challenge_complete, 75);
});
