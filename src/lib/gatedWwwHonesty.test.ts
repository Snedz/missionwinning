/**
 * Gated www copy may not say invite-only / get-an-invite / private beta / we're live.
 * CTA pack: Free beta · Enter with code · Get notified.
 * docs/design/WWW_NIGHT.md §7 · docs/SOCIAL_LAUNCH.md F-008
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'path';
import { gateStringsFor } from '@/i18n/gateLocales';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

const BANNED =
  /invite-only|get an invite|private beta|we're live|we’re live|checking sign-in|publicly available/i;

const SURFACE_FILES = [
  'src/i18n/gateLocales.ts',
  'src/i18n/firstStepsLocales.ts',
  'src/components/landing/CinematicWww.tsx',
  'src/components/landing/CinematicLogger.tsx',
  'src/page-components/LandingPage.tsx',
  'app/private/PrivateTeaserClient.tsx',
  'app/private/page.tsx',
  'src/components/marketing/MarketingNav.tsx',
  'src/components/public/PublicStatusBar.tsx',
  'docs/design/concepts/05-exquisite.html',
];

test('EN gate CTA pack is Free beta / Enter with code / Get notified', () => {
  const en = gateStringsFor('en');
  assert.equal(en.gateEyebrow, 'Free beta');
  assert.equal(en.gateWaitlistTitle, 'Get notified');
  assert.equal(en.gateWaitlistSubmit, 'Get notified');
  assert.equal(en.gateAccessSubmit, 'Enter with code');
  assert.equal(en.gateAccessSummary, 'Enter with code');
});

test('nested mission: public line + Coach beat + quiet later, never a feed', () => {
  const en = gateStringsFor('en');
  assert.equal(en.cinePublicLine, 'Train Anywhere. Win Daily.');
  assert.equal(en.cineHeroHeadline, 'Log a set. Offline.');
  assert.equal(
    en.cineHeroLead,
    'Mission Coach plans the week from the log. No wearable.'
  );
  assert.equal(en.cineWeekKicker, 'Mission Coach');
  assert.match(en.cineLater, /Mission Winning Health/);
  assert.match(en.cineLater, /Not a feed/);
  assert.doesNotMatch(en.cineLater, /WeChat|mini-program|MySpace|Fuel · Move · Mind/i);
});

test('gated www surfaces do not carry banned product-status English', () => {
  const hits: string[] = [];
  for (const file of SURFACE_FILES) {
    const src = read(file);
    const lines = src.split('\n');
    lines.forEach((line, i) => {
      if (BANNED.test(line) && !line.includes('Forbidden') && !line.includes('banned')) {
        hits.push(`${file}:${i + 1}: ${line.trim()}`);
      }
    });
  }
  assert.deepEqual(hits, [], `banned product-status copy:\n${hits.join('\n')}`);
});

test('locale pack overlays do not restore private-beta eyebrows', () => {
  const dir = path.join(root, 'src/i18n/packs');
  const hits: string[] = [];
  for (const name of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
    const src = read(`src/i18n/packs/${name}`);
    const m = /"gateEyebrow"\s*:\s*"([^"]+)"/.exec(src);
    if (!m) continue;
    if (/privée|privada|private beta|招待制|비공개|riêng tư|ส่วนตัว|Invite-only|invitation|invito|convite|Einladung|приглашен|초대|邀请|เชิญ|lời mời|आमंत्रण|undangan|دعوة/i.test(m[1])) {
      hits.push(`${name}: ${m[1]}`);
    }
  }
  assert.deepEqual(hits, [], `pack gateEyebrow still positions as invite/private:\n${hits.join('\n')}`);
});
