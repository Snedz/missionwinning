/**
 * `/` after Done is the .696 marketing homepage (stat row + LogToPlanHero).
 * Cinematic www stays a separate component, not this page.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';

const root = path.join(import.meta.dirname, '..', '..');
const landing = readFileSync(path.join(root, 'src/page-components/LandingPage.tsx'), 'utf8');
const cine = readFileSync(path.join(root, 'src/components/landing/CinematicWww.tsx'), 'utf8');
const css = readFileSync(path.join(root, 'src/components/landing/cinematic.css'), 'utf8');
const gateEn = readFileSync(path.join(root, 'src/i18n/gateEn.ts'), 'utf8');

test('LandingPage is the .696 marketing homepage, not cinematic www', () => {
  assert.match(landing, /LogToPlanHero/);
  assert.match(landing, /MarketingNav/);
  assert.match(landing, /At a glance/);
  assert.doesNotMatch(landing, /CinematicWww/);
});

test('cinematic www is four scenes, ghost CTA, real mark', () => {
  assert.match(cine, /www-cine-set/);
  assert.match(cine, /www-cine-week/);
  assert.match(cine, /www-cine-anywhere/);
  assert.match(cine, /www-cine-door/);
  assert.match(cine, /\/brand\/logo-icon\.svg/);
  assert.doesNotMatch(cine, /href="#"/);
});

test('cinematic www nested mission stays public line + support on fold 1', () => {
  assert.match(cine, /cineHeroHeadline/);
  assert.match(cine, /cineSetEyebrow/);
  assert.match(gateEn, /cinePublicLine/);
  assert.match(cine, /cineHeroLead/);
  assert.match(cine, /cineWeekKicker/);
  assert.match(cine, /www-cine-later/);
  assert.match(gateEn, /Log a set\. Offline\./);
  assert.match(gateEn, /No account\. No wearable\./);
  assert.match(gateEn, /Mission Coach/);
  assert.match(gateEn, /Today is not a Feed/);
  assert.doesNotMatch(cine, /Train Anywhere\. Win Daily\./);
  assert.doesNotMatch(gateEn, /Train Anywhere\. Win Daily\./);
  assert.doesNotMatch(cine, /WeChat/i);
  assert.doesNotMatch(cine, /mini-program/i);
  assert.doesNotMatch(cine, /Fuel · Move · Mind/);
  assert.doesNotMatch(cine, /www-cine-scene www-cine-later/);
});

test('cinematic www SET is a field, Anywhere before Week, HUD nav', () => {
  const set = cine.indexOf('id="set"');
  const anywhere = cine.indexOf('id="anywhere"');
  const week = cine.indexOf('id="week"');
  assert.ok(set < anywhere && anywhere < week, 'expected SET → Anywhere → Week');
  const setBlock = cine.slice(set, anywhere);
  assert.match(setBlock, /www-cine-set-inner/);
  assert.doesNotMatch(setBlock, /www-cine-split/);
  assert.match(setBlock, /cineHeroLead/);
  assert.doesNotMatch(setBlock, /logo-icon/);
  assert.match(cine, /www-cine-nav/);
  assert.doesNotMatch(cine, /www-cine-word/);
  assert.match(css, /\.www-cine-nav \{[^}]*position:\s*fixed/);
  assert.match(css, /\.www-cine-nav \{[^}]*mix-blend-mode:\s*difference/);
  assert.doesNotMatch(css, /\.www-cine-nav \{[^}]*border-bottom/);
  assert.doesNotMatch(css, /\.www-cine-nav \{[^}]*position:\s*sticky/);
});

test('cinematic www N1: type on still, authored week, poster door', () => {
  assert.match(cine, /www-cine-on-photo/);
  assert.doesNotMatch(cine, /www-cine-slab/);
  assert.doesNotMatch(cine, /www-cine-week-grid/);
  assert.doesNotMatch(cine, /www-cine-split/);
  assert.match(cine, /Miss\./);
  assert.match(cine, /Travel\./);
  assert.match(cine, /Band\./);
  assert.match(css, /\.www-cine-door \{[^}]*--accent-poster/);
  assert.match(cine, /www-cine-breaks/);
});
