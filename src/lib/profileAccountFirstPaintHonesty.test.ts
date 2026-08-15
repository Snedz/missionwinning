/**
 * AH1 — Profile account card first-paints the EN pack.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const card = readFileSync(
  path.join(import.meta.dirname, '..', '..', 'src/components/profile/ProfileAccountCard.tsx'),
  'utf8',
);

test('Profile account first-paints Journey synced to cloud', () => {
  assert.match(card, /Journey synced to cloud/);
  assert.doesNotMatch(card, /Cloud sync on — workouts and preferences/);
});

test('Profile account first-paints optional sign-in pack', () => {
  assert.match(card, /Sign in optional — progress stays on this device/);
  assert.match(card, /Sign in to sync journey across devices/);
  assert.doesNotMatch(card, /defaultValue: 'Sign in \(optional\)'/);
});
