/**
 * Gated www copy may not say invite-only / get-an-invite / private beta /
 * Free beta / we're live / Train Anywhere. Win Daily. as the company line.
 * Door pack: Free · Get notified · Enter with code.
 * docs/design/WWW_NIGHT.md §7 · docs/SOCIAL_LAUNCH.md F-008 · PLAN.md `.933`
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'path';
import { gateStringsFor } from '@/i18n/gateLocales';
import {
  GATED_WWW_HONESTY,
  gatedWwwHonestyIsHonest,
} from '@/lib/gatedWwwHonesty';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

const BANNED =
  /invite-only|get an invite|private beta|free beta|we're live|we’re live|checking sign-in|publicly available|train anywhere\. win daily\./i;

const SURFACE_FILES = [
  'src/i18n/gateEn.ts',
  'src/i18n/gateLocales.ts',
  'src/lib/gatedWwwHonesty.ts',
  'src/i18n/firstStepsLocales.ts',
  'src/i18n/navLocales.ts',
  'src/components/layout/AppHeader.tsx',
  'src/components/landing/CinematicWww.tsx',
  'src/components/landing/CinematicLogger.tsx',
  'src/page-components/LandingPage.tsx',
  'app/private/PrivateTeaserClient.tsx',
  'app/private/page.tsx',
  'src/components/marketing/MarketingNav.tsx',
  'src/components/public/PublicStatusBar.tsx',
  'docs/design/concepts/05-exquisite.html',
  'docs/brand-guidelines.md',
  'src/lib/routeMetadata.ts',
];

function isNamedBan(line: string): boolean {
  return (
    line.includes('Forbidden') ||
    line.includes('banned') ||
    /^\s*(\/\/|\*|\/\*)/.test(line)
  );
}

test('EN door pack is Free / Get notified / Enter with code', () => {
  const en = gateStringsFor('en');
  assert.equal(en.gateEyebrow, 'Free');
  assert.equal(en.gateWaitlistTitle, 'Get notified');
  assert.equal(en.gateWaitlistSubmit, 'Notify me');
  assert.equal(en.gateAccessSubmit, 'Enter with code');
  assert.equal(en.gateAccessSummary, 'Enter with code');
  assert.equal(GATED_WWW_HONESTY.gateEyebrow, 'Free');
  assert.equal(GATED_WWW_HONESTY.gateWaitlistTitle, 'Get notified');
  assert.equal(GATED_WWW_HONESTY.landingNavStartGated, 'Enter with code');
});

test('nested mission: public line + support + Coach beat + quiet later, never a feed', () => {
  const en = gateStringsFor('en');
  assert.equal(en.cinePublicLine, 'Log a set. Offline.');
  assert.equal(en.cineHeroHeadline, 'Log a set. Offline.');
  assert.equal(en.cineHeroLead, 'No account. No wearable.');
  assert.equal(en.gateSubtitle, 'No account. No wearable.');
  assert.equal(en.cineWeekKicker, 'Mission Coach');
  assert.match(en.cineLater, /Mission Winning Health/);
  assert.match(en.cineLater, /History you own/);
  assert.match(en.cineLater, /Today is not a Feed/);
  assert.match(en.cineNever, /Never/);
  assert.doesNotMatch(en.cineNever, /traction|users|athletes signed/i);
  assert.doesNotMatch(en.cineLater, /WeChat|mini-program|MySpace|Fuel · Move · Mind/i);
});

test('banned regex catches Win Daily-as-tagline and Free beta on the door', () => {
  assert.match('Train Anywhere. Win Daily.', BANNED);
  assert.match('Free beta', BANNED);
  assert.match('invite-only', BANNED);
  assert.doesNotMatch('Log a set. Offline.', BANNED);
  assert.doesNotMatch('Anywhere', BANNED);
  assert.doesNotMatch('Free', BANNED);
  const mutantLine = gatedWwwHonestyIsHonest({
    ...GATED_WWW_HONESTY,
    gateEyebrow: 'Free beta',
  });
  assert.equal(mutantLine.ok, false);
  const mutantTag = gatedWwwHonestyIsHonest({
    ...GATED_WWW_HONESTY,
    gateSubtitle: 'Train Anywhere. Win Daily.',
  });
  assert.equal(mutantTag.ok, false);
  assert.equal(gatedWwwHonestyIsHonest().ok, true);
});

test('gated www surfaces do not carry banned product-status English', () => {
  const hits: string[] = [];
  for (const file of SURFACE_FILES) {
    const src = read(file);
    const lines = src.split('\n');
    lines.forEach((line, i) => {
      if (BANNED.test(line) && !isNamedBan(line)) {
        hits.push(`${file}:${i + 1}: ${line.trim()}`);
      }
    });
  }
  assert.deepEqual(hits, [], `banned product-status copy:\n${hits.join('\n')}`);
});

test('locale pack overlays do not restore private-beta or Free beta eyebrows', () => {
  const dir = path.join(root, 'src/i18n/packs');
  const hits: string[] = [];
  for (const name of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
    const src = read(`src/i18n/packs/${name}`);
    const m = /"gateEyebrow"\s*:\s*"([^"]+)"/.exec(src);
    if (!m) continue;
    if (
      /free beta|privée|privada|private beta|招待制|비공개|riêng tư|ส่วนตัว|Invite-only|invitation|invito|convite|Einladung|приглашен|초대|邀请|เชิญ|lời mời|आमंत्रण|undangan|دعوة/i.test(
        m[1]
      )
    ) {
      hits.push(`${name}: ${m[1]}`);
    }
  }
  assert.deepEqual(hits, [], `pack gateEyebrow still positions as invite/private:\n${hits.join('\n')}`);
});

test('PrivateTeaser floors honesty copy; tight lock marks one support lede', () => {
  const teaser = read('app/private/PrivateTeaserClient.tsx');
  assert.match(teaser, /gateEnFloor/);
  assert.match(teaser, /gateLocalFirst/);
  assert.match(teaser, /data-mw-wedge-teaser/);
  assert.match(teaser, /gateSubtitle/);
  assert.doesNotMatch(teaser, /CinematicWww|cineHeroLead/);
});

test('MarketingNav gated CTA is Enter with code → /private', () => {
  const src = read('src/components/marketing/MarketingNav.tsx');
  assert.match(src, /isClientPrivateGateEnabled/);
  assert.match(src, /GATED_WWW_HONESTY/);
  assert.match(src, /landingNavStartGated/);
  assert.match(src, /ctaHref = gateOn \? '\/private'/);
});

test('Welcome gated framing uses honesty constants', () => {
  const src = read('src/page-components/WelcomePage.tsx');
  assert.match(src, /isClientPrivateGateEnabled/);
  assert.match(src, /GATED_WWW_HONESTY/);
  assert.match(src, /welcomeGateKicker/);
  assert.match(src, /welcomeGateSubtitleBrief/);
});

test('/private document title stays Log a set. Offline., not Free beta', () => {
  const src = read('src/lib/routeMetadata.ts');
  assert.match(src, /private:\s*'Log a set\. Offline\.'/);
  assert.doesNotMatch(src, /private:\s*'Free beta'/);
  assert.doesNotMatch(src, /private:\s*'Private Beta'/);
});
