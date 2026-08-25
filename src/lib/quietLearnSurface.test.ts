/**
 * Quiet Learn stays on /learn. Today / the door stay clean.
 * Cue list may link here. Intro is free. Not a second Start.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const abs = path.join(dir, entry);
    if (statSync(abs).isDirectory()) walk(abs, out);
    else if (/\.(tsx|ts)$/.test(abs)) out.push(path.relative(root, abs));
  }
  return out;
}

const LEARN_LEAK = /quietLearn|QuietLearnIntroCard/i;

const FORBIDDEN_SURFACES = [
  'src/page-components/HomeTodayLean.tsx',
  'src/page-components/HomePage.tsx',
  'src/page-components/MovePage.tsx',
  'src/page-components/TrackPage.tsx',
  'src/page-components/LandingPage.tsx',
  'src/lib/gatedWwwHonesty.ts',
  'src/lib/todayPrimaryAction.ts',
  'app/private/GateTeaser.tsx',
  'app/private/PrivateTeaserClient.tsx',
  'app/private/page.tsx',
];

const PREMIUM = /from ['"]@\/lib\/(premium|trial|bundle)/;

describe('quiet learn surface lock', () => {
  it('Today / door / other quiet pillars do not import quiet learn', () => {
    for (const file of FORBIDDEN_SURFACES) {
      const src = read(file);
      assert.doesNotMatch(src, LEARN_LEAK, `${file} must not carry Quiet Learn`);
    }
  });

  it('Today tree does not mount a Learn intro', () => {
    const todayFiles = walk(path.join(root, 'src/components/today')).concat(
      walk(path.join(root, 'src/lib/today'))
    );
    const offenders = todayFiles.filter((f) => LEARN_LEAK.test(read(f)));
    assert.deepEqual(offenders, [], `Today leaked Learn intro: ${offenders.join(', ')}`);
  });

  it('Learn first paint is the existing intro — catalog in Show more, no red action', () => {
    const page = read('src/page-components/LearnPage.tsx');
    const detailsAt = page.indexOf('<details');
    const cardAt = page.indexOf('<QuietLearnIntroCard');
    assert.notEqual(detailsAt, -1, 'other paths still have a Show more house');
    assert.notEqual(cardAt, -1, 'Quiet Learn intro is wired');
    assert.ok(cardAt < detailsAt, 'QuietLearnIntroCard must sit on first paint, not inside Show more');
    assert.doesNotMatch(page, /primary-action|bg-primary-fill/);
    assert.doesNotMatch(page, /discord\.com|WeChat|marketplace|Top 8|four-scene/i);
    assert.match(page, /learn-paths/);
  });

  it('intro card is free, empty-honest, and reuses catalog copy', () => {
    const src = read('src/components/learn/QuietLearnIntroCard.tsx');
    assert.match(src, /data-testid="quiet-learn-intro"/);
    assert.match(src, /quietLearnIntro/);
    assert.match(src, /quiet-learn-empty|No first-success intro yet/);
    assert.doesNotMatch(src, PREMIUM);
    assert.doesNotMatch(src, /usePremium|isPremium/);
    assert.doesNotMatch(src, /primary-action|bg-primary-fill/);
    assert.doesNotMatch(src, /ISSA|discord\.com|WeChat|marketplace/i);
  });

  it('cue list may link to Learn and never owns Log set', () => {
    const src = read('src/components/workout/InSetCueList.tsx');
    assert.match(src, /quietLearnHref/);
    assert.match(src, /data-testid="in-set-cues-more"/);
    assert.doesNotMatch(src, /primary-action|bg-primary-fill/);
    assert.doesNotMatch(src, PREMIUM);
    const cues = read('src/lib/workout/inSetCues.ts');
    assert.match(cues, /IN_SET_CUE_CAP = 3/);
    assert.doesNotMatch(cues, LEARN_LEAK);
  });

  it('Train page does not import the intro card', () => {
    const page = read('src/page-components/ActiveWorkoutPage.tsx');
    assert.doesNotMatch(page, /QuietLearnIntroCard/);
    assert.doesNotMatch(page, /from ['"]@\/lib\/quietLearn['"]/);
  });
});
