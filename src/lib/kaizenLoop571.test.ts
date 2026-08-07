import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..');

test('Today founder tool buttons are i18n keys not bare English', () => {
  const src = readFileSync(
    join(root, 'src/components/today/TodayProgressSection.tsx'),
    'utf8'
  );
  assert.doesNotMatch(src, /Log Daily Pillar Win \(\+streak \+ cloud\)/);
  assert.doesNotMatch(src, /Log Mind Win \(\+streak \+ cloud\)/);
  assert.match(src, /todayFounderLogDailyWin/);
  assert.match(src, /todayFounderLogMindWin/);
  assert.match(src, /todayFounderRefreshWins/);
});

test('Profile preferences hints are i18n-backed', () => {
  const src = readFileSync(
    join(root, 'src/components/profile/ProfilePreferencesCard.tsx'),
    'utf8'
  );
  assert.match(src, /unitsAffectsHint/);
  assert.match(src, /languageHint/);
  assert.match(src, /trainingGoalsHint/);
  assert.doesNotMatch(src, /Global default metric for accessibility/);
  assert.doesNotMatch(src, /future personalization/);
});

test('Share fitness button 44px and plain status', () => {
  const src = readFileSync(
    join(root, 'src/components/fitness-test/ShareFitnessButton.tsx'),
    'utf8'
  );
  assert.match(src, /min-h-\[44px\]/);
  assert.doesNotMatch(src, /Copied!/);
  assert.doesNotMatch(src, /Shared!/);
});
