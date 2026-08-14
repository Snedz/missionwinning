/**
 * About is on the Welcome footer path — free beta must not pitch Super Bundle.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..');

test('AboutPage free-beta uses open-beta mission and business keys', () => {
  const src = readFileSync(join(root, 'src/page-components/AboutPage.tsx'), 'utf8');
  assert.match(src, /infoAboutMissionP1OpenBeta/);
  assert.match(src, /infoAboutBusinessBodyOpenBeta/);
  assert.match(src, /isFreeBeta|freeBeta/);
});

test('infoLocales EN defines open-beta About strings without Super Bundle', () => {
  const src = readFileSync(join(root, 'src/i18n/infoLocales.ts'), 'utf8');
  assert.match(src, /infoAboutMissionP1OpenBeta:/);
  assert.match(src, /infoAboutBusinessBodyOpenBeta:/);
  const m1 = src.match(/infoAboutMissionP1OpenBeta:\s*\n?\s*'([^']*)'/);
  const m2 = src.match(/infoAboutBusinessBodyOpenBeta:\s*\n?\s*'([^']*)'/);
  assert.ok(m1 && m2);
  assert.doesNotMatch(m1[1]!, /Super Bundle/i);
  assert.doesNotMatch(m2[1]!, /Super Bundle/i);
  assert.match(m2[1]!, /Texas limited liability company/);
  assert.match(m2[1]!, /Mission Winning 0\.1 \(beta\)/);
  assert.match(m2[1]!, /open beta/i);
  assert.doesNotMatch(m2[1]!, /invite-only|private beta/i);
  assert.match(m1[1]!, /free forever/i);
});
