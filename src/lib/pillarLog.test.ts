import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isNonFoodEntryName, pillarWinEntryName } from '@/lib/pillarLog';

/**
 * `nutrition_entries` carries three kinds of row: real food, pillar wins, and
 * assessment records. Only the first belongs in the Fuel diary. These are the exact
 * strings the three writers produce.
 */

test('every pillar win the writer produces is recognised as non-food', () => {
  for (const p of ['move', 'mind', 'track', 'learn'] as const) {
    const name = pillarWinEntryName(p, 'GPS 5.20 km');
    assert.equal(isNonFoodEntryName(name), true, `${p} win should be filtered: ${name}`);
  }
});

test('legacy assessment food-row names still filter', () => {
  // Historical P2-2 rows. New writers must not produce these (healthDataBucket.test.ts).
  assert.equal(isNonFoodEntryName('Assessment: moderate risk'), true);
  assert.equal(isNonFoodEntryName('Assessment Win from Profile'), true);
});

test('actual food is never filtered', () => {
  for (const food of [
    'Chicken and rice',
    'Greek yogurt',
    'Trackside protein bar', // starts with "Track" but is not "track win: "
    'Learn-brand oat shake',
    'Mindful Chef curry',
    'Assessments are not a food but this is: assorted nuts',
  ]) {
    assert.equal(isNonFoodEntryName(food), false, `should stay in the diary: ${food}`);
  }
});

test('the writer stays inside the column budget', () => {
  const name = pillarWinEntryName('track', 'x'.repeat(200));
  assert.equal(name.length <= 80, true);
  // Truncation must not break recognition — the marker is at the front for this reason.
  assert.equal(isNonFoodEntryName(name), true);
});
