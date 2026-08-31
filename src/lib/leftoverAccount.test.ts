/**
 * Account is sign-in / return / prefs, not a settings tour.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');
const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');

test('Account first paint is sign-in, return, and prefs', () => {
  const src = stripComments(read('src/page-components/AccountPage.tsx'));
  const jsx = src.slice(src.lastIndexOf('return ('));
  const open = jsx.split('<details')[0];
  assert.match(src, /className="house-account"/);
  assert.match(open, /<ProfileAccountCard\b/);
  assert.match(open, /<ProfileRemindersCard\b/);
  assert.match(open, /<ProfilePreferencesCard\b/);
});

test('leftover hops stay off /account first paint', () => {
  const src = stripComments(read('src/page-components/AccountPage.tsx'));
  const jsx = src.slice(src.lastIndexOf('return ('));
  const open = jsx.split('<details')[0];
  for (const leftover of [
    'HomeGymKitCard',
    'ProfileReferralCard',
    'ProfileFeedbackCard',
    'ProfilePremiumCard',
    'ProfileTransparencyCard',
    'LegalNav',
  ]) {
    assert.doesNotMatch(open, new RegExp(`<${leftover}\\b`), `${leftover} is leftover on Account`);
  }
  assert.doesNotMatch(open, /href="\/explore"/);
  assert.match(src, /id="import"/);
});

test('Train still does not mint a week; You still title + Account; Fuel still the log', () => {
  const active = stripComments(read('src/page-components/ActiveWorkoutPage.tsx'));
  assert.doesNotMatch(active, /from ['"]@\/hooks\/useCoachPlan['"]/);
  assert.doesNotMatch(active, /\bgenerateWeek\s*\(/);
  const you = stripComments(read('src/page-components/ProfilePage.tsx'));
  assert.match(you, /href="\/account"/);
  assert.doesNotMatch(you, /<ProfileRewardsCard\b/);
  const fuel = stripComments(read('src/page-components/NutritionPage.tsx'));
  assert.match(fuel, /data-testid="fuel-log-dock"/);
});
