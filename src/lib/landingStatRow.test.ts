/**
 * Cinematic landing has no “At a glance” stat grid — that was the wireframe.
 * docs/design/WWW_NIGHT.md
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';

const root = path.join(import.meta.dirname, '..', '..');
const landing = readFileSync(path.join(root, 'src/page-components/LandingPage.tsx'), 'utf8');
const cine = readFileSync(path.join(root, 'src/components/landing/CinematicWww.tsx'), 'utf8');
const css = readFileSync(path.join(root, 'src/components/landing/cinematic.css'), 'utf8');

test('LandingPage is the four-scene cinematic www, not a template of bands', () => {
  assert.match(landing, /CinematicWww/);
  assert.match(landing, /mode="open"/);
  assert.doesNotMatch(landing, /At a glance/);
  assert.doesNotMatch(landing, /landingFaqKeysForSurface/);
  assert.doesNotMatch(landing, /LogToPlanHero/);
});

test('cinematic www is four scenes, ghost CTA, real mark', () => {
  assert.match(cine, /www-cine-set/);
  assert.match(cine, /www-cine-week/);
  assert.match(cine, /www-cine-anywhere/);
  assert.match(cine, /www-cine-door/);
  assert.match(cine, /\/brand\/logo-icon\.svg/);
  assert.doesNotMatch(cine, /href="#"/);
});

test('cinematic www nested mission stays Train+Coach on fold 1', () => {
  assert.match(cine, /cinePublicLine/);
  assert.match(cine, /Train Anywhere\. Win Daily\./);
  assert.match(cine, /cineHeroHeadline/);
  assert.match(cine, /Log a set\. Offline\./);
  assert.match(cine, /cineHeroLead/);
  assert.match(cine, /cineWeekKicker/);
  assert.match(cine, /Mission Coach/);
  assert.match(cine, /www-cine-later/);
  assert.match(cine, /Not a feed/);
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
  assert.match(cine, /www-cine-nav/);
  assert.doesNotMatch(cine, /www-cine-word/);
  assert.match(css, /\.www-cine-nav \{[^}]*position:\s*fixed/);
  assert.match(css, /\.www-cine-nav \{[^}]*mix-blend-mode:\s*difference/);
  assert.doesNotMatch(css, /\.www-cine-nav \{[^}]*border-bottom/);
  assert.doesNotMatch(css, /\.www-cine-nav \{[^}]*position:\s*sticky/);
});
