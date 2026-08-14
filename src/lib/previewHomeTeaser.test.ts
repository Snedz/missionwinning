/**
 * Preview / local `/` is the gate teaser until the signed cookie, then the
 * `.696` homepage. Not cinematic. Production with the gate on is unchanged.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { isPublicPathWhileGated } from './privateGate';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

test('ungated `/` is the teaser until the cookie, then the homepage', () => {
  const page = read('app/page.tsx');
  assert.match(page, /isPrivateModeEnabled/);
  assert.match(page, /hasPrivateAccessCookieOnServer/);
  assert.match(page, /homeSurfaceAfterGate/);
  assert.match(page, /GateTeaser/);
  assert.match(page, /LandingPage/);
  assert.doesNotMatch(
    page,
    /hasServerPrivateAccess/,
    'gate-off is not unlock — that skipped the teaser on Preview'
  );
  assert.match(page, /<GateTeaser walkOpen/, 'cold Preview still shows the door');
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
