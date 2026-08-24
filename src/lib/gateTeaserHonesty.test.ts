/**
 * Preview .785 painted Get notified / No spam twice, then sent Done
 * back to `/` (the same teaser). One title, one foot, walk-open leaves.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

test('gate notify title lives on the door scene; form does not reprint the kicker', () => {
  const form = read('src/components/public/LaunchNotifyForm.tsx');
  const cine = read('src/components/landing/CinematicWww.tsx');
  const teaser = read('app/private/PrivateTeaserClient.tsx');
  const cineVariant = form.slice(form.indexOf("variant === 'cine'"));
  assert.doesNotMatch(form.slice(0, form.indexOf("variant === 'cine'")), /gateWaitlistFoot/);
  assert.match(cine, /gateWaitlistTitle/);
  assert.match(teaser, /cineDoorLead/);
  assert.doesNotMatch(teaser, /gateWaitlistTitle/);
  assert.match(cineVariant, /gateWaitlistTitle/, 'cine submit uses Get notified');
});

test('ungated walk-open POSTs the code and returns to `/` (homepage)', () => {
  const teaser = read('app/private/PrivateTeaserClient.tsx');
  assert.match(teaser, /walkOpen/);
  assert.match(teaser, /privateGateReturnPath\(initialNext\)/);
  assert.doesNotMatch(teaser, /privateGateReturnPath\(initialNext, '\/welcome'\)/);
  assert.match(teaser, /\/api\/private-access/);
  const priv = read('app/private/page.tsx');
  assert.match(priv, /walkOpen=\{!isPrivateModeEnabled\(\)\}/);
});
