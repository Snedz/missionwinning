/**
 * Free-beta mute: Mind series blurb, Guidebook chapter badge, Profile assessment foot.
 * Depth is unlocked — “Premium sessions only” / Premium badge / Premium foot must not pitch pay.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..');

test('MindPage free-beta uses open-beta series blurb', () => {
  const src = readFileSync(join(root, 'src/page-components/MindPage.tsx'), 'utf8');
  assert.match(src, /mindSeriesSleepWeekBlurbOpenBeta/);
  assert.match(src, /isFreeBeta|freeBeta/);
});

test('GuidebookIndexPage free-beta uses open-beta specialist badge', () => {
  const src = readFileSync(join(root, 'src/page-components/GuidebookIndexPage.tsx'), 'utf8');
  assert.match(src, /learnPremiumBadgeOpenBeta/);
  assert.match(src, /isFreeBeta|freeBeta/);
});

test('ProfileAssessmentCard free-beta hides pay-adjacent foot', () => {
  const src = readFileSync(
    join(root, 'src/components/profile/ProfileAssessmentCard.tsx'),
    'utf8'
  );
  assert.match(src, /isFreeBeta|freeBeta/);
  assert.match(src, /!freeBeta/);
  assert.doesNotMatch(src, /profileAssessmentFootOpenBeta/);
});

test('EN open-beta strings omit Premium pay merch', () => {
  const mind = readFileSync(join(root, 'src/i18n/mindLocales.ts'), 'utf8');
  const guide = readFileSync(join(root, 'src/i18n/guidebookLocales.ts'), 'utf8');
  const notif = readFileSync(join(root, 'src/i18n/notificationLocales.ts'), 'utf8');
  for (const [src, key] of [
    [mind, 'mindSeriesSleepWeekBlurbOpenBeta'],
    [guide, 'learnPremiumBadgeOpenBeta'],
    [notif, 'profileAssessmentFootOpenBeta'],
  ] as const) {
    const re = new RegExp(`${key}:\\s*(?:\\n\\s*)?'((?:\\\\'|[^'])*)'`, 'm');
    const m = src.match(re);
    assert.ok(m, `missing EN ${key}`);
    assert.doesNotMatch(m[1]!, /Super Bundle/i, `${key} pitches Super Bundle`);
    assert.doesNotMatch(m[1]!, /\b[Pp]remium\b/, `${key} still says Premium`);
  }
});
