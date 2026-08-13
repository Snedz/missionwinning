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
