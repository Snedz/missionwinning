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

test('gate notify title and foot live only on the teaser, not inside the form', () => {
  const form = read('src/components/public/LaunchNotifyForm.tsx');
  const gateVariant = form.slice(form.indexOf("variant === 'gate'"));
  assert.doesNotMatch(gateVariant, /gateWaitlistTitle/, 'form must not reprint the kicker');
  assert.doesNotMatch(gateVariant, /gateWaitlistFoot/, 'form must not reprint the no-spam line');
  const teaser = read('app/private/PrivateTeaserClient.tsx');
  assert.equal([...teaser.matchAll(/gateWaitlistTitle/g)].length, 1);
  assert.equal([...teaser.matchAll(/gateWaitlistFoot/g)].length, 1);
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
