/**
 * Dual-mount CapResult billing isolation.
 *
 * Judge ≠ builder: snapshots and deny codes are hardcoded here — not
 * read back from MUTED_BILLING / TEST_BILLING_SCOPES. A shared host-wide
 * object, or inject-A rewriting B.read, would mean the host grew one
 * billing snapshot for every mounted mini.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createMiniHost, injectBillingSnapshot, injectIdentitySnapshot } from './host';
import { mountHealthMini } from './health';
import { mountClearShotMini } from './clearshot';
import { mountTestBillingMini } from './billingProbe';
import { mountTestGrantedMini } from './allowProbe';
import { resolveMiniDeeplink } from './deeplink';
import type { BillingSnapshot, CapResult, MountedMini } from './types';

const here = import.meta.dirname;

function sourceOf(file: string): string {
  return readFileSync(path.join(here, file), 'utf8');
}

const BILLING_ID = 'test.billing';
const GRANTED_ID = 'test.granted';
const HEALTH_ID = 'l1.health';

const BILLING_SNAP: BillingSnapshot = { bundle: 'none', muted: true };
const GRANTED_SNAP: BillingSnapshot = { bundle: 'super', muted: true };
const BILLING_OVERRIDE: BillingSnapshot = { bundle: 'super', muted: false };
const HEALTH_SNAP = { missionId: 11, callSign: 'alpha' };
const GRANTED_ID_SNAP = { missionId: 22, callSign: 'bravo' };

const BILLING_OK: CapResult<BillingSnapshot> = {
  ok: true,
  value: { bundle: 'none', muted: true },
};
const GRANTED_OK: CapResult<BillingSnapshot> = {
  ok: true,
  value: { bundle: 'super', muted: true },
};
const BILLING_OVERRIDE_OK: CapResult<BillingSnapshot> = {
  ok: true,
  value: { bundle: 'super', muted: true },
};
const HELD_OK: CapResult<{ held: true }> = { ok: true, value: { held: true } };

const SCOPE_DENIED: CapResult<never> = { ok: false, code: 'scope_denied' };
const PHOTOS_STUB: CapResult<never> = { ok: false, code: 'photos_stub' };
const ALREADY_MOUNTED: CapResult<never> = { ok: false, code: 'already_mounted' };
const NOT_MOUNTED: CapResult<never> = { ok: false, code: 'not_mounted' };
const UNKNOWN: CapResult<never> = { ok: false, code: 'unknown_mini' };
const BAD_DEEPLINK: CapResult<never> = { ok: false, code: 'bad_deeplink' };
const UNKNOWN_METHOD: CapResult<never> = { ok: false, code: 'unknown_method' };
const SET_OK: CapResult<void> = { ok: true, value: undefined };
const MISS: CapResult<string | undefined> = { ok: true, value: undefined };
const KEY = 'secret';
const HEALTH_VALUE = 'health-only';
const GRANTED_VALUE = 'granted-only';

function assertMounted(result: CapResult<MountedMini>): MountedMini {
  assert.equal(result.ok, true, 'mount must succeed');
  if (!result.ok) throw new Error('unreachable');
  return result.value;
}

test('test.billing read is not test.granted read — hardcoded envelopes', () => {
  const host = createMiniHost({
    billings: {
      [BILLING_ID]: BILLING_SNAP,
      [GRANTED_ID]: GRANTED_SNAP,
    },
  });
  const billing = assertMounted(mountTestBillingMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));

  const a = billing.billing.read();
  const b = granted.billing.read();
  assert.deepEqual(a, BILLING_OK);
  assert.deepEqual(b, GRANTED_OK);
  assert.notDeepEqual(a, b);
  if (!a.ok || !b.ok) return;
  assert.notEqual(a.value.bundle, b.value.bundle);
  assert.equal(a.value.muted, true);
  assert.equal(b.value.muted, true);

  assert.deepEqual(host.call(BILLING_ID, 'billing', 'read'), BILLING_OK);
  assert.deepEqual(host.call(GRANTED_ID, 'billing', 'read'), GRANTED_OK);
  assert.deepEqual(billing.billing.checkout(), HELD_OK);
  assert.deepEqual(billing.billing.portal(), HELD_OK);
  assert.deepEqual(granted.billing.checkout(), HELD_OK);
  assert.deepEqual(granted.billing.portal(), HELD_OK);
});

test('injecting test.billing snapshot does not alter test.granted read', () => {
  const host = createMiniHost({
    billings: {
      [BILLING_ID]: BILLING_SNAP,
      [GRANTED_ID]: GRANTED_SNAP,
    },
  });
  const billing = assertMounted(mountTestBillingMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));

  injectBillingSnapshot(billing.billing, { bundle: 'none', muted: false });
  assert.deepEqual(billing.billing.read(), BILLING_OK);
  assert.deepEqual(granted.billing.read(), GRANTED_OK);

  injectBillingSnapshot(billing.billing, BILLING_OVERRIDE);
  assert.deepEqual(billing.billing.read(), BILLING_OVERRIDE_OK);
  assert.deepEqual(granted.billing.read(), GRANTED_OK);
  assert.deepEqual(host.call(GRANTED_ID, 'billing', 'read'), GRANTED_OK);

  injectBillingSnapshot(granted.billing, { bundle: 'none', muted: true });
  assert.deepEqual(granted.billing.read(), BILLING_OK);
  assert.deepEqual(billing.billing.read(), BILLING_OVERRIDE_OK);
  assert.deepEqual(host.call(BILLING_ID, 'billing', 'read'), BILLING_OVERRIDE_OK);
});

test('mutating the injected test.billing object after mount does not change granted', () => {
  const billingSnap: BillingSnapshot = { bundle: 'none', muted: true };
  const grantedSnap: BillingSnapshot = { bundle: 'super', muted: true };
  const host = createMiniHost({
    billings: {
      [BILLING_ID]: billingSnap,
      [GRANTED_ID]: grantedSnap,
    },
  });
  const billing = assertMounted(mountTestBillingMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));

  billingSnap.bundle = 'super';
  grantedSnap.bundle = 'none';

  assert.deepEqual(billing.billing.read(), BILLING_OK);
  assert.deepEqual(granted.billing.read(), GRANTED_OK);
});

test('Health and ClearShot billing stay scope_denied even with an injected snapshot', () => {
  const host = createMiniHost({
    billings: {
      [HEALTH_ID]: GRANTED_SNAP,
      'utility.clearshot': GRANTED_SNAP,
      [BILLING_ID]: BILLING_SNAP,
    },
  });
  const health = assertMounted(mountHealthMini(host));
  const shot = assertMounted(mountClearShotMini(host));
  const billing = assertMounted(mountTestBillingMini(host));

  assert.deepEqual(health.billing.read(), SCOPE_DENIED);
  assert.deepEqual(health.billing.checkout(), SCOPE_DENIED);
  assert.deepEqual(health.billing.portal(), SCOPE_DENIED);
  assert.deepEqual(host.call(HEALTH_ID, 'billing', 'read'), SCOPE_DENIED);
  assert.deepEqual(shot.billing.read(), SCOPE_DENIED);
  assert.deepEqual(shot.billing.checkout(), SCOPE_DENIED);
  assert.deepEqual(shot.billing.portal(), SCOPE_DENIED);
  assert.deepEqual(billing.billing.read(), BILLING_OK);
});

test('identity isolation (.1093) stays while both billing mounts live', () => {
  const host = createMiniHost({
    identities: {
      [HEALTH_ID]: HEALTH_SNAP,
      [GRANTED_ID]: GRANTED_ID_SNAP,
    },
    billings: {
      [BILLING_ID]: BILLING_SNAP,
      [GRANTED_ID]: GRANTED_SNAP,
    },
  });
  const health = assertMounted(mountHealthMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));
  const billing = assertMounted(mountTestBillingMini(host));

  assert.deepEqual(health.identity.read(), {
    ok: true,
    value: { missionId: 11, callSign: 'alpha' },
  });
  assert.deepEqual(granted.identity.read(), {
    ok: true,
    value: { missionId: 22, callSign: 'bravo' },
  });
  injectIdentitySnapshot(health.identity, { missionId: 33, callSign: 'alpha-2' });
  assert.deepEqual(granted.identity.read(), {
    ok: true,
    value: { missionId: 22, callSign: 'bravo' },
  });
  assert.deepEqual(billing.billing.read(), BILLING_OK);
  assert.deepEqual(granted.billing.read(), GRANTED_OK);
});

test('storage isolation (.1092) stays while both billing mounts live', () => {
  const host = createMiniHost({
    billings: {
      [BILLING_ID]: BILLING_SNAP,
      [GRANTED_ID]: GRANTED_SNAP,
    },
  });
  const health = assertMounted(mountHealthMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));

  assert.deepEqual(health.storage.set(KEY, HEALTH_VALUE), SET_OK);
  assert.deepEqual(granted.storage.set(KEY, GRANTED_VALUE), SET_OK);
  assert.deepEqual(health.storage.get(KEY), { ok: true, value: HEALTH_VALUE });
  assert.deepEqual(granted.storage.get(KEY), { ok: true, value: GRANTED_VALUE });
  const cross = granted.storage.get(KEY);
  if (!cross.ok) return;
  assert.notEqual(cross.value, HEALTH_VALUE);
  assert.deepEqual(granted.billing.read(), GRANTED_OK);
});

test('known-method envelopes stay .1079–.1093 while both live', () => {
  const host = createMiniHost({
    identities: {
      [HEALTH_ID]: HEALTH_SNAP,
      [GRANTED_ID]: GRANTED_ID_SNAP,
    },
    billings: {
      [BILLING_ID]: BILLING_SNAP,
      [GRANTED_ID]: GRANTED_SNAP,
    },
  });
  const health = assertMounted(mountHealthMini(host));
  const shot = assertMounted(mountClearShotMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));
  const billing = assertMounted(mountTestBillingMini(host));

  assert.deepEqual(health.identity.read(), {
    ok: true,
    value: { missionId: 11, callSign: 'alpha' },
  });
  assert.deepEqual(health.billing.read(), SCOPE_DENIED);
  assert.deepEqual(health.photos.read(), SCOPE_DENIED);
  assert.deepEqual(shot.photos.read(), PHOTOS_STUB);
  assert.deepEqual(shot.billing.read(), SCOPE_DENIED);
  assert.deepEqual(shot.storage.get(KEY), SCOPE_DENIED);
  assert.deepEqual(billing.billing.read(), BILLING_OK);
  assert.deepEqual(granted.billing.read(), GRANTED_OK);
  assert.notDeepEqual(billing.billing.read(), granted.billing.read());
  assert.deepEqual(granted.photos.read(), PHOTOS_STUB);
  assert.deepEqual(host.call(HEALTH_ID, 'identity', 'foo'), UNKNOWN_METHOD);
  assert.deepEqual(host.call(HEALTH_ID, 'billing', 'read'), SCOPE_DENIED);
  assert.deepEqual(mountHealthMini(host), ALREADY_MOUNTED);
  assert.deepEqual(host.mount('totally.unknown'), UNKNOWN);
  assert.deepEqual(host.unmount('utility.probe'), NOT_MOUNTED);
  assert.deepEqual(resolveMiniDeeplink('https://evil'), BAD_DEEPLINK);
  assert.deepEqual(resolveMiniDeeplink('mission://minis/totally-unknown'), UNKNOWN);
  assert.deepEqual(granted.storage.get(KEY), MISS);
});

test('docs/harness/HOP.md stays the empty template', () => {
  const hop = readFileSync(path.join(here, '..', '..', '..', 'docs', 'harness', 'HOP.md'), 'utf8');
  assert.match(hop, /^# Live hop\n/);
  assert.match(hop, /^ticket:\n/m);
  assert.match(hop, /^done_means:\n/m);
  assert.match(hop, /^accept:\n/m);
  assert.equal(hop.includes('1094'), false);
  assert.equal(hop.includes('billing isolation'), false);
  assert.equal(hop.includes('test.billing'), false);
});

test('host binds per-mini billing — inject hook is fake-only', () => {
  const src = sourceOf('host.ts');
  assert.equal(src.includes('billingSnapshotFor(opts, manifest.id)'), true);
  assert.equal(src.includes('opts.billings'), true);
  assert.equal(src.includes('injectBillingSnapshot'), true);
  assert.equal(/from\s+['"][^'"]*stripe/i.test(src), false);
  assert.equal(src.includes('premiumServer'), false);
  assert.equal(/from\s+['"][^'"]*supabase/i.test(src), false);
  assert.equal(src.includes('createClient'), false);
  assert.equal(src.includes('getUserMedia'), false);
  assert.equal(/android\.provider\.MediaStore/i.test(src), false);
  assert.equal(src.includes('apps/android'), false);
  assert.equal(src.includes('checkout.sessions'), false);

  const fakeSrc = sourceOf('fakes.ts');
  assert.equal(fakeSrc.includes('export function injectBillingSnapshot'), true);
  assert.equal(fakeSrc.includes('copyBilling'), true);
  assert.equal(/from\s+['"][^'"]*stripe/i.test(fakeSrc), false);
  assert.equal(fakeSrc.includes('premiumServer'), false);
  assert.equal(/checkout\.sessions/i.test(fakeSrc), false);
});
