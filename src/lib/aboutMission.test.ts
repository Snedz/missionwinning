/**
 * Founder mission sentence — one exact string on About, README, and vision.
 *
 * Paraphrase is the failure: the north star is the sentence, not a nearby vibe.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const FOUNDING_MISSION =
  'The mission is advancement of civilization and propagation of consciousness to the stars.';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

test('EN About locale carries the exact founder mission sentence', () => {
  const src = read('src/i18n/infoLocales.ts');
  assert.match(src, /infoAboutMissionNorthStar:/);
  const m = src.match(/infoAboutMissionNorthStar:\s*\n?\s*'([^']*)'/);
  assert.equal(m?.[1], FOUNDING_MISSION);
});

test('About section 01 leads with the north-star key before product copy', () => {
  const src = read('src/page-components/AboutPage.tsx');
  const missionIdx = src.indexOf("t('infoAboutMissionNorthStar'");
  const productIdx = src.indexOf("t('infoAboutMissionP1");
  const nestedIdx = src.indexOf("t('infoAboutMissionNested'");
  assert.ok(missionIdx > 0, 'AboutPage must render infoAboutMissionNorthStar');
  assert.ok(nestedIdx > missionIdx, 'nested L1 Health line must follow the north-star sentence');
  assert.ok(productIdx > nestedIdx, 'Train+Coach product paragraph must follow the nested line');
  assert.match(src, /defaultValue:\s*\n?\s*'The mission is advancement of civilization and propagation of consciousness to the stars\.'/);
});

test('README and vision.md first-paint the exact founder sentence', () => {
  const readme = read('README.md');
  const vision = read('vision.md');
  assert.ok(readme.includes(FOUNDING_MISSION), 'README.md missing exact mission sentence');
  assert.ok(vision.includes(FOUNDING_MISSION), 'vision.md missing exact mission sentence');
  const readmeBeforeProduct = readme.slice(0, readme.indexOf('## What'));
  assert.ok(
    readmeBeforeProduct.includes(FOUNDING_MISSION),
    'README must lead with the mission sentence before the surfaces table'
  );
  assert.match(readmeBeforeProduct, /Beta 0\.1|0\.1 \(beta\)/);
  assert.doesNotMatch(readmeBeforeProduct, /everything app|WeChat|MySpace/i);
});
