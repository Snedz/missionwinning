/**
 * AI1 — Profile journey card first-paints the EN pack.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const card = readFileSync(
  path.join(import.meta.dirname, '..', '..', 'src/components/profile/ProfileJourneyCard.tsx'),
  'utf8',
);

test('Profile journey first-paints First-time setup and Begin', () => {
  assert.match(card, /defaultValue: 'First-time setup'/);
  assert.match(card, /defaultValue: 'Begin'/);
  assert.doesNotMatch(card, /defaultValue: 'Get started'/);
  assert.doesNotMatch(card, /defaultValue: 'Continue'/);
});

test('Profile journey first-paints Edit profile', () => {
  assert.match(card, /defaultValue: 'Edit profile'/);
  assert.doesNotMatch(card, /Training profile/);
  assert.doesNotMatch(card, /Edit journey profile/);
});
