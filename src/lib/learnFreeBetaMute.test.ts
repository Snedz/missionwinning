/**
 * Learn pillar free-beta mute — pack used to override freeBeta defaultValue
 * with Super Bundle / premium pay copy on the shell and details chrome.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..');

test('LearnPage free-beta uses open-beta Learn chrome keys', () => {
  const src = readFileSync(join(root, 'src/page-components/LearnPage.tsx'), 'utf8');
  assert.match(src, /quietLearnSubtitle/);
  assert.match(src, /learnSubtitleOpenBeta/);
  assert.match(src, /learnPremiumTitleOpenBeta/);
  assert.match(src, /isFreeBeta|freeBeta/);
  assert.doesNotMatch(src, /Super Bundle unlocks|Join Discord/);
});

test('learnLocales EN open-beta strings omit Super Bundle and premium pay pitch', () => {
  const src = readFileSync(join(root, 'src/i18n/learnLocales.ts'), 'utf8');
  assert.match(src, /learnSubtitleBriefOpenBeta:/);
  assert.match(src, /learnMoreLearnOpenBeta:/);
  assert.match(src, /learnSubtitleOpenBeta:/);
  assert.match(src, /learnPremiumTitleOpenBeta:/);

  for (const key of [
    'learnSubtitleBriefOpenBeta',
    'learnMoreLearnOpenBeta',
    'learnSubtitleOpenBeta',
    'learnPremiumTitleOpenBeta',
  ]) {
    // Single-line or multi-line string assignment
    const re = new RegExp(
      `${key}:\\s*(?:\\n\\s*)?'((?:\\\\'|[^'])*)'`,
      'm'
    );
    const m = src.match(re);
    assert.ok(m, `missing EN string for ${key}`);
    assert.doesNotMatch(m[1]!, /Super Bundle/i, `${key} pitches Super Bundle`);
    assert.doesNotMatch(m[1]!, /\bpremium\b/i, `${key} still says premium`);
    assert.doesNotMatch(m[1]!, /\bBundle\b/, `${key} still says Bundle`);
  }
});
