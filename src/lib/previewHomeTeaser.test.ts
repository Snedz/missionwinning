/**
 * Preview / local `/` must be the old door (gate teaser), not the cinematic
 * post-flip landing. Production with the gate on is unchanged.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { isPublicPathWhileGated } from './privateGate';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

test('ungated `/` mounts the gate teaser, not CinematicWww', () => {
  const page = read('app/page.tsx');
  assert.match(page, /isPrivateModeEnabled/);
  assert.match(page, /GateTeaser/);
  assert.match(page, /LandingPage/);
  const ungatedReturn = page.lastIndexOf('return <GateTeaser');
  const landingReturn = page.lastIndexOf('<LandingPage');
  assert.ok(ungatedReturn > 0, 'ungated branch must return GateTeaser');
  assert.ok(landingReturn > 0 && landingReturn < ungatedReturn, 'LandingPage stays on the gated+cookie branch only');
});

test('GateTeaser is the mw-gate door, not the cinematic www', () => {
  const teaser = read('app/private/GateTeaser.tsx');
  assert.match(teaser, /mw-gate/);
  assert.match(teaser, /PrivateTeaserClient/);
  assert.doesNotMatch(teaser, /CinematicWww|www-cine/);
});

test('`/active` stays public while gated (logger never gated)', () => {
  assert.equal(isPublicPathWhileGated('/active'), true);
});
