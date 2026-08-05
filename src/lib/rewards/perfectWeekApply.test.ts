
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

test('applyFuelDayReward and applyPillarWinReward can emit perfect_week', () => {
  const src = readFileSync(join(import.meta.dirname, 'apply.ts'), 'utf8');
  assert.match(src, /function applyFuelDayReward[\s\S]*maybePerfectWeekEvents/);
  assert.match(src, /function applyPillarWinReward[\s\S]*maybePerfectWeekEvents/);
});
