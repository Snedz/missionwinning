/**
 * Athlete Page is authored identity — not a feed, not Top 8, not a scoreboard.
 *
 * IDENTITY_SOCIAL_PLAN §3 / overnight PLAN.md (0.1 L2-quiet). Discovers the
 * You-surface files rather than listing the strings we happen to remember:
 * a scoreboard smuggled into a new Athlete* card still fails.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { MOBILE_TAB_HREFS } from '@/lib/primaryNav';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

function stripComments(src: string): string {
  const blank = (m: string) => m.replace(/[^\n]/g, ' ');
  return src
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, blank)
    .replace(/\/\*[\s\S]*?\*\//g, blank)
    .replace(/(^|[^:])\/\/.*$/gm, (m, before: string) => before + blank(m.slice(before.length)));
}

/** You-surface files this page actually mounts. */
function athletePageFiles(): string[] {
  const dir = path.join(root, 'src/components/profile');
  const fromProfile = readdirSync(dir)
    .filter((f) => /\.tsx$/.test(f) && /^(Athlete|CareerLine|ProfileAthlete)/.test(f))
    .map((f) => `src/components/profile/${f}`);
  return [
    'src/page-components/ProfilePage.tsx',
    'src/components/rewards/ProfileRewardsCard.tsx',
    ...fromProfile,
  ];
}

test('the scan actually opens the Athlete Page', () => {
  const files = athletePageFiles();
  assert.ok(files.includes('src/page-components/ProfilePage.tsx'));
  assert.ok(files.includes('src/components/rewards/ProfileRewardsCard.tsx'));
  assert.ok(files.some((f) => f.endsWith('AthleteIdentityCard.tsx')));
  assert.ok(files.some((f) => f.endsWith('ProfileAthleteCard.tsx')));
  for (const f of files) {
    assert.ok(read(f).length > 200, `${f} is missing or empty`);
  }
});

test('You stays off the first-paint tab bar (L2-quiet / C3)', () => {
  assert.ok(
    !(MOBILE_TAB_HREFS as readonly string[]).includes('/profile'),
    '/profile on MOBILE_TAB_HREFS would promote You onto the hero path'
  );
});

test('sign-in chip lands on Account, not the Athlete Page', () => {
  const chip = read('src/components/layout/HeaderAuthChip.tsx');
  assert.match(chip, /href="\/account"/);
  assert.doesNotMatch(stripComments(chip), /href="\/profile"/);
});

test('Athlete Page copy refuses feed, Top 8, DMs, follower counts', () => {
  const forbidden = [
    /top[\s-]*8/i,
    /friend rank/i,
    /direct message/i,
    /\bDMs\b/,
    /follower count/i,
    /social feed/i,
  ];
  const hits: string[] = [];
  for (const file of athletePageFiles()) {
    const src = stripComments(read(file));
    for (const re of forbidden) {
      if (re.test(src)) hits.push(`${file} matches ${re}`);
    }
  }
  assert.deepEqual(hits, []);
});

test('the shelf is badges, not a rank/XP/challenges scoreboard', () => {
  const src = stripComments(read('src/components/rewards/ProfileRewardsCard.tsx'));
  assert.doesNotMatch(src, /xpTotal/);
  assert.doesNotMatch(src, /challengesComplete/);
  assert.doesNotMatch(src, /rewardProfileRank/);
  assert.doesNotMatch(src, /rewardProfileChallenges/);
  assert.match(src, /rewardProfileTitle/);
});

test('the live card preview does not interpolate rank or XP', () => {
  const src = stripComments(read('src/components/profile/ProfileAthleteCard.tsx'));
  assert.doesNotMatch(src, /rankTitleDefault/);
  assert.doesNotMatch(src, /xpTotal/);
  assert.doesNotMatch(src, /athleteCardBody/);
  assert.match(src, /athlete-card-preview/);
  assert.match(src, /careerSignature/);
});

test('page share PNG stats are career counts, not Rank/Tier', () => {
  const src = stripComments(read('src/lib/identity/athletePageShare.ts'));
  assert.doesNotMatch(src, /label:\s*'Rank'/);
  assert.doesNotMatch(src, /label:\s*'Tier'/);
  assert.match(src, /label:\s*'Sessions'/);
});
