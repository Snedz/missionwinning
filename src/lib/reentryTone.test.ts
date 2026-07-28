import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  COLD_DEVICE_DAYS,
  findToneViolations,
  isCold,
  quietThresholdDays,
  violatesReturnTone,
} from '@/lib/reentryTone';

test('catches the two lines the email channel actually shipped', () => {
  // Both are verbatim from nudgeServer.ts before this change — the regression this
  // module exists to prevent, not a hypothetical.
  assert.equal(violatesReturnTone('Your 5-day streak ends tonight'), true);
  assert.equal(violatesReturnTone("it's been 11 days. That's nothing"), true);
});

test('names which rule was broken, so a failure is actionable', () => {
  const v = findToneViolations('Your 5-day streak ends tonight');
  const rules = v.map((x) => x.rule).sort();
  assert.deepEqual(rules, ['absence-length', 'streak-loss']);
});

test('counts of what the athlete did are not absence lengths', () => {
  assert.equal(violatesReturnTone('Sessions: 3'), false);
  assert.equal(violatesReturnTone('Volume moved: 12,400'), false);
  // "week one" is a period of presence, spelled not numbered.
  assert.equal(violatesReturnTone('Most people quit in the first week.'), false);
});

test('quiet threshold scales with the athlete, never a fixed expectation', () => {
  // A 2x/week athlete has not lapsed on day four — that is their normal gap.
  assert.equal(quietThresholdDays(2) > quietThresholdDays(6), true);
  // Nobody is chased before the floor reentry.ts already established.
  assert.equal(quietThresholdDays(7) >= 4, true);
});

test('threshold is stable at the edges rather than throwing', () => {
  assert.equal(Number.isFinite(quietThresholdDays(0)), true);
  assert.equal(Number.isFinite(quietThresholdDays(99)), true);
});

test('cold devices are past the cutoff, not at it', () => {
  assert.equal(isCold(COLD_DEVICE_DAYS), false);
  assert.equal(isCold(COLD_DEVICE_DAYS + 1), true);
});
