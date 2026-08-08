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

test('standing never travels in the return channel', () => {
  // The shape the club plan would otherwise ship: an absence converted into a
  // position the athlete has to come back and defend. Same loss aversion as the
  // streak line above, arriving under a different noun.
  for (const line of [
    "You've dropped to third on the leaderboard",
    'Two sessions to hold your tier',
    'Your squad is pulling ahead',
    'You earned 40 XP last week',
    "You're one badge from Legend",
    'Ranked 12th this week',
  ]) {
    assert.deepEqual(
      findToneViolations(line).map((v) => v.rule),
      ['club-identity'],
      line
    );
  }
});

test('club-identity leaves ordinary training language alone', () => {
  // A term list that fires on legitimate copy is a term list someone switches off.
  // `points` and `level` are deliberately outside the rule for exactly this reason.
  for (const line of [
    'Keep three points of contact on the bench',
    'Level the bar before you press',
    'Sessions: 3. Volume moved: 12,400',
    'Your next session is ready when you are',
  ]) {
    assert.deepEqual(findToneViolations(line), [], line);
  }
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
