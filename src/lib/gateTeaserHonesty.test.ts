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

test('gate notify title lives on the tight lock; form does not reprint the kicker', () => {
  const form = read('src/components/public/LaunchNotifyForm.tsx');
  const teaser = read('app/private/PrivateTeaserClient.tsx');
  assert.match(teaser, /gateWaitlistTitle/);
  assert.doesNotMatch(teaser, /cineDoorLead/);
  assert.match(form, /variant === 'gate'/);
  assert.match(form, /gateWaitlistSubmit/, 'gate submit uses Notify me');
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
