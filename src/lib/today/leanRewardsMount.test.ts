/**
 * Lean Today mounts Mission progress after first log (cold-path safe).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { TODAY_BLOCK_PRIORITY } from '@/lib/today/todayBlockPriority';

test('rewards block is priced after reentry, before coach-today', () => {
  assert.ok(TODAY_BLOCK_PRIORITY.rewards > TODAY_BLOCK_PRIORITY.reentry);
  assert.ok(TODAY_BLOCK_PRIORITY.rewards < TODAY_BLOCK_PRIORITY['coach-today']);
});

test('continuity is after coach session/week (what-to-train stays boss)', () => {
  assert.ok(TODAY_BLOCK_PRIORITY.continuity > TODAY_BLOCK_PRIORITY.rewards);
  assert.ok(TODAY_BLOCK_PRIORITY.continuity > TODAY_BLOCK_PRIORITY['coach-today']);
  assert.ok(TODAY_BLOCK_PRIORITY.continuity > TODAY_BLOCK_PRIORITY['coach-week']);
});

test('HomeTodayLean does not load rewards theater', () => {
  const src = readFileSync(
    join(import.meta.dirname, '..', '..', 'page-components', 'HomeTodayLean.tsx'),
    'utf8'
  );
  assert.doesNotMatch(src, /TodayRewardsCard/);
  assert.doesNotMatch(src, /summarizeRewards/);
});

test('HomeTodayLean does not mount ContinuityStrip', () => {
  const src = readFileSync(
    join(import.meta.dirname, '..', '..', 'page-components', 'HomeTodayLean.tsx'),
    'utf8'
  );
  assert.doesNotMatch(src, /ContinuityStrip/);
  assert.doesNotMatch(src, /buildContinuitySuggestions/);
});
