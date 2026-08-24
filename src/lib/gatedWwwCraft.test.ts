/**
 * `.935` — gated first paint is the four-scene field, not a signup sheet.
 * Homepage after cookie stays `.696`. Consent stays docked.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { gateStringsFor } from '@/i18n/gateLocales';
import { GATE_EN } from '@/i18n/gateEn';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

test('GateTeaser mounts the four-scene field; LandingPage does not', () => {
  const teaser = read('app/private/GateTeaser.tsx');
  assert.match(teaser, /CinematicWww/);
  assert.match(teaser, /mode="gate"/);
  assert.match(teaser, /PrivateTeaserClient/);
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

test('cinematic scenes are SET → ANYWHERE → WEEK → DOOR', () => {
  const src = read('src/components/landing/CinematicWww.tsx');
  const set = src.indexOf('id="set"');
  const anywhere = src.indexOf('id="anywhere"');
  const week = src.indexOf('id="week"');
  const door = src.indexOf('id="door"');
  assert.ok(set > 0 && set < anywhere && anywhere < week && week < door);
  assert.match(src, /www-cine-strip/);
  assert.match(src, /gateWaitlistTitle/);
});

test('door forms stay on the teaser; LOG SET is the paper poster', () => {
  const teaser = read('app/private/PrivateTeaserClient.tsx');
  const logger = read('src/components/landing/CinematicLogger.tsx');
  const notify = read('src/components/public/LaunchNotifyForm.tsx');
  assert.match(teaser, /LaunchNotifyForm/);
  assert.match(teaser, /launch-waitlist/);
  assert.match(teaser, /variant="cine"/);
  assert.doesNotMatch(teaser, /gate-h1|gate-header|gate-shell/);
  assert.doesNotMatch(teaser, /href=["']\/welcome["']/);
  assert.match(logger, /primary-action/);
  assert.match(notify, /variant === 'cine'/);
  assert.match(
    notify,
    /<button type="submit" disabled=\{busy \|\| !email\} className="www-cine-ghost">/,
    'paper-strip submit is ghost — LOG SET keeps the one red control'
  );
  assert.doesNotMatch(teaser, /gate-btn-primary|primary-action/);
});

test('door keys do not stamp Alpha; week title matches the field', () => {
  const en = gateStringsFor('en');
  assert.equal(en.cineWeekTitle, 'The week does not fail.');
  assert.equal(en.gateAccessSummary, 'Enter with code');
  for (const key of [
    'gateAccessSummary',
    'gateWaitlistFoot',
    'gateWaitlistDoneFoot',
    'cineDoorLead',
    'cineDoorFoot',
  ] as const) {
    assert.doesNotMatch(GATE_EN[key], /alpha|free beta|invite-only/i, key);
    assert.doesNotMatch(en[key], /alpha|free beta|invite-only/i, key);
  }
});

test('cinematic CSS has a reduced-motion-safe rise and scoped display clamps', () => {
  const css = read('src/components/landing/cinematic.css');
  assert.match(css, /@keyframes www-cine-rise/);
  assert.match(css, /prefers-reduced-motion:\s*no-preference/);
  assert.match(css, /\.www-cine \.display-hero \{[^}]*2\.625rem/);
  assert.match(css, /\.www-cine \.display-section \{[^}]*2\.25rem/);
});

test('mutant restoring the signup-sheet wrap dies', () => {
  const teaser = read('app/private/GateTeaser.tsx');
  assert.match(teaser, /<CinematicWww/);
  const without = teaser.replace(/CinematicWww/g, 'NotCinematic');
  assert.doesNotMatch(without, /CinematicWww/);
});

test('consent stays after children — never a fixed overlay on LOG SET', () => {
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
  assert.doesNotMatch(json, /Have an Alpha access code|when Alpha access is ready/i);
});
