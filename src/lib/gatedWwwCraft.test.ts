/**
 * `.957` — gated first paint is the tight lock, not SET → ANYWHERE → WEEK → DOOR.
 * Homepage after cookie stays `.696`. Consent stays docked. Copy lock stays.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { gateStringsFor } from '@/i18n/gateLocales';
import { GATE_EN } from '@/i18n/gateEn';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

test('GateTeaser mounts the tight lock; LandingPage does not', () => {
  const teaser = read('app/private/GateTeaser.tsx');
  assert.match(teaser, /PrivateTeaserClient/);
  assert.match(teaser, /mw-gate/);
  assert.doesNotMatch(
    teaser,
    /CinematicWww/,
    'four-scene field is not first paint on the door'
  );
  const landing = read('src/page-components/LandingPage.tsx');
  assert.doesNotMatch(landing, /CinematicWww|www-cine/);
  const home = read('app/page.tsx');
  assert.match(home, /LandingPage/);
  assert.doesNotMatch(
    home,
    /<CinematicWww/,
    'cookie / gate-off `/` is still the .696 homepage — not cinematic www'
  );
});

test('tight lock is hero + notify + enter-with-code', () => {
  const src = read('app/private/PrivateTeaserClient.tsx');
  assert.match(src, /gate-shell/);
  assert.match(src, /gate-h1/);
  assert.match(src, /gateTitle1/);
  assert.match(src, /gateTitle2/);
  assert.match(src, /gateSubtitle/);
  assert.match(src, /LaunchNotifyForm/);
  assert.match(src, /variant="gate"/);
  assert.match(src, /gateWaitlistTitle/);
  assert.match(src, /<details/);
  assert.match(src, /gateAccessSummary/);
  assert.doesNotMatch(src, /CinematicLogger|www-cine-set|id="anywhere"|id="week"/);
  assert.doesNotMatch(src, /TARGET · Squat|Miss\.|Travel\.|Band\./);
  assert.match(src, /data-mw-set-table|GateSetTable/);
  assert.match(src, /gate-nav/);
  assert.match(src, /id="history"/);
  assert.match(src, /id="coach"/);
  assert.match(src, /id="door"/);
});

test('door forms stay on the teaser; Notify me is the one red', () => {
  const teaser = read('app/private/PrivateTeaserClient.tsx');
  const notify = read('src/components/public/LaunchNotifyForm.tsx');
  assert.match(teaser, /LaunchNotifyForm/);
  assert.match(teaser, /launch-waitlist/);
  assert.match(teaser, /variant="gate"/);
  assert.doesNotMatch(teaser, /href=["']\/welcome["']/);
  assert.match(teaser, /gate-btn-primary/);
  assert.match(notify, /variant === 'gate'/);
  assert.match(
    notify,
    /className="gate-btn gate-btn-primary"/,
    'Notify me is the one poster-red control'
  );
  assert.doesNotMatch(teaser, /www-cine-ghost/);
});

test('door keys do not stamp Alpha; pack stays locked', () => {
  const en = gateStringsFor('en');
  assert.equal(en.gateEyebrow, 'Free');
  assert.equal(en.gateTitle1, 'Log a set.');
  assert.equal(en.gateTitle2, 'Offline.');
  assert.equal(en.gateSubtitle, 'No account. No wearable.');
  assert.equal(en.gateWaitlistTitle, 'Get notified');
  assert.equal(en.gateAccessSummary, 'Enter with code');
  assert.equal(en.gateInviteHeadline, 'Enter your access code to join.');
  assert.equal(en.gateBetaGuide, 'Start guide');
  for (const key of [
    'gateAccessSummary',
    'gateWaitlistFoot',
    'gateWaitlistDoneFoot',
    'gateInviteHeadline',
    'gateBetaGuide',
    'gateTitle1',
    'gateTitle2',
    'gateSubtitle',
  ] as const) {
    assert.doesNotMatch(GATE_EN[key], /alpha|free beta|invite-only|win daily/i, key);
    assert.doesNotMatch(en[key], /alpha|free beta|invite-only|win daily/i, key);
  }
});

test('mutant remounting the four-scene wrap dies', () => {
  const teaser = read('app/private/GateTeaser.tsx');
  assert.doesNotMatch(teaser, /CinematicWww/);
  assert.match(teaser, /<PrivateTeaserClient/);
  const withWrap = teaser.replace(
    '<PrivateTeaserClient',
    '<CinematicWww mode="gate" door={<PrivateTeaserClient'
  );
  assert.match(withWrap, /CinematicWww/);
});

test('consent stays after children — never a fixed overlay on the lock', () => {
  const provider = read('app/i18n-pwa-provider.tsx');
  const children = provider.indexOf('{children}');
  const banner = provider.indexOf('<AnalyticsConsentBanner');
  assert.ok(children > 0 && banner > children, 'banner must paint after the field');
  const bannerSrc = read('src/components/layout/AnalyticsConsentBanner.tsx');
  assert.doesNotMatch(bannerSrc, /fixed(?:\s+|-)bottom-0|z-\[60\]/);
});

test('exported EN gate JSON does not restore Alpha-on-the-door', () => {
  const json = read('public/locales/en/gate.json');
  assert.match(json, /"gateAccessSummary": "Enter with code"/);
  assert.match(json, /"gateInviteHeadline": "Enter your access code to join."/);
  assert.match(json, /"gateBetaGuide": "Start guide"/);
  assert.doesNotMatch(json, /Have an Alpha access code|when Alpha access is ready|join the Alpha|Alpha start guide/i);
});

test('root OG description is the Train + Coach wedge, not six pillars', () => {
  const layout = read('app/layout.tsx');
  assert.match(layout, /Log a set\. Offline\. No account\. No wearable\./);
  assert.doesNotMatch(layout, /nutrition|mobility|mind, and learning/i);
});

test('tight lock does not invent traction or mount a feed', () => {
  const teaser = read('app/private/PrivateTeaserClient.tsx');
  const home = read('app/page.tsx');
  const landing = read('src/page-components/LandingPage.tsx');
  assert.doesNotMatch(teaser, /athletes signed|10,?000|users and counting/i);
  assert.doesNotMatch(home + landing, /app\/feed|href=["']\/feed["']/);
});

test('door and www do not ship Inter, cream, or coral', () => {
  const files = [
    'app/private/PrivateTeaserClient.tsx',
    'app/private/gate.css',
    'src/components/public/GateSetTable.tsx',
    'sites/www/src/pages/index.astro',
    'sites/www/src/components/WwwNav.astro',
    'sites/www/src/lib/homeContent.ts',
  ];
  for (const file of files) {
    const src = read(file);
    assert.doesNotMatch(src, /Inter|font-inter/i, file);
    assert.doesNotMatch(src, /#faf9f5|#cc785c/i, file);
    assert.doesNotMatch(src, /rounded-(?:md|lg|xl|2xl|3xl|full)/, file);
  }
});
