/**
 * AK1 — Builder arrange step first-paints the EN pack.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const step = readFileSync(
  path.join(import.meta.dirname, '..', '..', 'src/components/builder/BuilderArrangeStep.tsx'),
  'utf8',
);

test('Builder arrange first-paints the pack mobility CTA', () => {
  assert.match(step, /defaultValue: '\+ Quick Add Free Mobility Warm-up \(5 moves\)'/);
  assert.doesNotMatch(step, /defaultValue: 'Add mobility warm-up \(5 moves\)'/);
});

test('Builder arrange first-paints the pack habit stack CTA', () => {
  assert.match(step, /Load Free Habit\/Mobility Stack/);
  assert.doesNotMatch(step, /Load habit \+ mobility stack/);
});
