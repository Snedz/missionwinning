/**
 * CapResult remount after billing inject.
 *
 * Judge ≠ builder: snapshots and deny codes are hardcoded here —
 * not read back from MUTED_BILLING / TEST_BILLING_SCOPES. A remount
 * that still shows the leftover override, or that rewrites B.read,
 * would mean inject occupancy survived unmount.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createMiniHost, injectBillingSnapshot } from './host';
import { mountHealthMini } from './health';
import { mountClearShotMini } from './clearshot';
import { mountTestBillingMini } from './billingProbe';
import { mountTestGrantedMini } from './allowProbe';
import { resolveMiniDeeplink } from './deeplink';
import type { BillingSnapshot, CapResult, MountedMini } from './types';

const here = import.meta.dirname;
const repoRoot = path.join(here, '..', '..', '..');

function sourceOf(file: string): string {
  return readFileSync(path.join(here, file), 'utf8');
}

/** Hardcoded — do not use STORAGE_MAX_* as the overflow size. */
const MAX_KEYS = 32;

const BILLING_ID = 'test.billing';
const GRANTED_ID = 'test.granted';
const HEALTH_ID = 'l1.health';
const CLEARSHOT_ID = 'utility.clearshot';

const BILLING_SNAP: BillingSnapshot = { bundle: 'none', muted: true };
const GRANTED_SNAP: BillingSnapshot = { bundle: 'super', muted: true };
const BILLING_OVERRIDE: BillingSnapshot = { bundle: 'super', muted: false };
const BILLING_AFTER: BillingSnapshot = { bundle: 'none', muted: false };
const SHOT_OVERRIDE: BillingSnapshot = { bundle: 'super', muted: false };

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
const BILLING_AFTER_OK: CapResult<BillingSnapshot> = {
  ok: true,
  value: { bundle: 'none', muted: true },
};
const HELD_OK: CapResult<{ held: true }> = { ok: true, value: { held: true } };

const SCOPE_DENIED: CapResult<never> = { ok: false, code: 'scope_denied' };
const NOT_MOUNTED: CapResult<never> = { ok: false, code: 'not_mounted' };
const STORAGE_CAP: CapResult<never> = { ok: false, code: 'storage_cap' };
const PHOTOS_STUB: CapResult<never> = { ok: false, code: 'photos_stub' };
const ALREADY_MOUNTED: CapResult<never> = { ok: false, code: 'already_mounted' };
const UNKNOWN: CapResult<never> = { ok: false, code: 'unknown_mini' };
const BAD_DEEPLINK: CapResult<never> = { ok: false, code: 'bad_deeplink' };
const UNKNOWN_METHOD: CapResult<never> = { ok: false, code: 'unknown_method' };
const UNKNOWN_CAPABILITY: CapResult<never> = { ok: false, code: 'unknown_capability' };
const SET_OK: CapResult<void> = { ok: true, value: undefined };
const MISS: CapResult<string | undefined> = { ok: true, value: undefined };
const GUEST_STUB: CapResult<{ missionId: null; callSign: null }> = {
  ok: true,
  value: { missionId: null, callSign: null },
};

const KEY = 'secret';
const GRANTED_VALUE = 'granted-only';
const BILLING_VALUE = 'billing-only';

function assertMounted(result: CapResult<MountedMini>): MountedMini {
  assert.equal(result.ok, true, 'mount must succeed');
  if (!result.ok) throw new Error('unreachable');
  return result.value;
}

function assertHostBound(
  result: CapResult<unknown>,
  expected: CapResult<BillingSnapshot>,
  leftover: BillingSnapshot,
  label: string
): void {
  assert.deepEqual(result, expected, label);
  assert.equal(result.ok, true, label);
  if (!result || !result.ok) return;
  const value = result.value as BillingSnapshot;
  assert.notEqual(value.bundle, leftover.bundle, label);
  assert.equal(value.muted, true, label);
}

function fillKeys(mini: MountedMini, count: number): void {
  for (let i = 0; i < count; i++) {
    assert.deepEqual(mini.storage.set(`k${i}`, 'v'), SET_OK, `fill k${i}`);
  }
}

function hostWithSnaps() {
  return createMiniHost({
    billings: {
      [BILLING_ID]: BILLING_SNAP,
      [GRANTED_ID]: GRANTED_SNAP,
      [HEALTH_ID]: GRANTED_SNAP,
      [CLEARSHOT_ID]: GRANTED_SNAP,
    },
  });
}

test('inject then unmount+remount test.billing rebinds host snapshot; B untouched', () => {
  const host = hostWithSnaps();
  const billing = assertMounted(mountTestBillingMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));

  injectBillingSnapshot(billing.billing, BILLING_OVERRIDE);
  assert.deepEqual(billing.billing.read(), BILLING_OVERRIDE_OK);
  assert.deepEqual(granted.billing.read(), GRANTED_OK);

  assert.deepEqual(host.unmount(BILLING_ID), { ok: true, value: undefined });
  assert.deepEqual(granted.billing.read(), GRANTED_OK);
  assert.deepEqual(host.call(GRANTED_ID, 'billing', 'read'), GRANTED_OK);
  assert.deepEqual(host.call(BILLING_ID, 'billing', 'read'), NOT_MOUNTED);

  let threw = false;
  let remount: CapResult<MountedMini> | undefined;
  try {
    remount = mountTestBillingMini(host);
  } catch {
    threw = true;
  }
  assert.equal(threw, false, 'billing remount must not throw');
  const remounted = assertMounted(remount ?? { ok: false, code: 'stub' });
  assert.notEqual(remounted.billing, billing.billing);

  assertHostBound(remounted.billing.read(), BILLING_OK, BILLING_OVERRIDE, 'remounted fake');
  assertHostBound(
    host.call(BILLING_ID, 'billing', 'read'),
    BILLING_OK,
    BILLING_OVERRIDE,
    'remounted host.call'
  );
  assert.deepEqual(granted.billing.read(), GRANTED_OK);
  assert.deepEqual(host.call(GRANTED_ID, 'billing', 'read'), GRANTED_OK);
  assert.deepEqual(remounted.billing.checkout(), HELD_OK);
  assert.deepEqual(remounted.billing.portal(), HELD_OK);
});

test('inject on the old fake after remount does not change remounted.read', () => {
  const host = hostWithSnaps();
  const billing = assertMounted(mountTestBillingMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));

  injectBillingSnapshot(billing.billing, BILLING_OVERRIDE);
  assert.deepEqual(host.unmount(BILLING_ID), { ok: true, value: undefined });
  const remounted = assertMounted(mountTestBillingMini(host));

  injectBillingSnapshot(billing.billing, BILLING_OVERRIDE);
  assertHostBound(remounted.billing.read(), BILLING_OK, BILLING_OVERRIDE, 'old-fake inject');
  assert.deepEqual(billing.billing.read(), BILLING_OVERRIDE_OK);
  assert.deepEqual(granted.billing.read(), GRANTED_OK);
});

test('inject on remounted still does not change Granted.read', () => {
  const host = hostWithSnaps();
  const billing = assertMounted(mountTestBillingMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));

  injectBillingSnapshot(billing.billing, BILLING_OVERRIDE);
  assert.deepEqual(host.unmount(BILLING_ID), { ok: true, value: undefined });
  const remounted = assertMounted(mountTestBillingMini(host));

  injectBillingSnapshot(remounted.billing, BILLING_AFTER);
  assert.deepEqual(remounted.billing.read(), BILLING_AFTER_OK);
  assert.deepEqual(granted.billing.read(), GRANTED_OK);
  const b = granted.billing.read();
  if (!b || !b.ok) return;
  assert.notEqual(b.value.bundle, BILLING_AFTER.bundle);
  assert.equal(b.value.muted, true);
});

test('storage_cap then inject then remount: billing is host-bound; B untouched', () => {
  const host = hostWithSnaps();
  const granted = assertMounted(mountTestGrantedMini(host));
  const billing = assertMounted(mountTestBillingMini(host));

  fillKeys(granted, MAX_KEYS);
  assert.deepEqual(billing.billing.read(), BILLING_OK);
  assert.deepEqual(granted.storage.set('overflow', 'v'), STORAGE_CAP);
  injectBillingSnapshot(granted.billing, BILLING_AFTER);
  assert.deepEqual(granted.billing.read(), BILLING_AFTER_OK);

  assert.deepEqual(host.unmount(GRANTED_ID), { ok: true, value: undefined });
  assert.deepEqual(billing.billing.read(), BILLING_OK);
  assert.deepEqual(host.call(BILLING_ID, 'billing', 'read'), BILLING_OK);

  const remounted = assertMounted(mountTestGrantedMini(host));
  assertHostBound(
    remounted.billing.read(),
    GRANTED_OK,
    BILLING_AFTER,
    'cap+inject remount billing'
  );
  assert.deepEqual(remounted.storage.get('k0'), MISS);
  assert.deepEqual(remounted.storage.get('overflow'), MISS);
  assert.deepEqual(remounted.storage.set('fresh', GRANTED_VALUE), SET_OK);
  assert.deepEqual(billing.billing.read(), BILLING_OK);
  assert.deepEqual(host.call(BILLING_ID, 'billing', 'read'), BILLING_OK);
});

test('ClearShot remount after inject rebinds its host billing snapshot', () => {
  const host = hostWithSnaps();
  const shot = assertMounted(mountClearShotMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));

  injectBillingSnapshot(shot.billing, SHOT_OVERRIDE);
  assert.deepEqual(shot.billing.read(), SCOPE_DENIED);
  assert.deepEqual(shot.billing.checkout(), SCOPE_DENIED);
  assert.deepEqual(shot.billing.portal(), SCOPE_DENIED);
  assert.deepEqual(granted.billing.read(), GRANTED_OK);

  assert.deepEqual(host.unmount(CLEARSHOT_ID), { ok: true, value: undefined });
  const remounted = assertMounted(mountClearShotMini(host));
  assert.notEqual(remounted.billing, shot.billing);
  assert.deepEqual(remounted.billing.read(), SCOPE_DENIED);
  assert.deepEqual(remounted.billing.checkout(), SCOPE_DENIED);
  assert.deepEqual(remounted.billing.portal(), SCOPE_DENIED);
  assert.deepEqual(host.call(CLEARSHOT_ID, 'billing', 'read'), SCOPE_DENIED);
  assert.deepEqual(granted.billing.read(), GRANTED_OK);
  assert.deepEqual(remounted.photos.read(), PHOTOS_STUB);

  injectBillingSnapshot(shot.billing, BILLING_AFTER);
  assert.deepEqual(remounted.billing.read(), SCOPE_DENIED);
  assert.deepEqual(granted.billing.read(), GRANTED_OK);
});

test('Health remount stays scope_denied even with a host billing snapshot', () => {
  const host = hostWithSnaps();
  const health = assertMounted(mountHealthMini(host));
  const billing = assertMounted(mountTestBillingMini(host));

  injectBillingSnapshot(health.billing, BILLING_OVERRIDE);
  assert.deepEqual(health.billing.read(), SCOPE_DENIED);
  assert.deepEqual(health.billing.checkout(), SCOPE_DENIED);
  assert.deepEqual(health.billing.portal(), SCOPE_DENIED);
  assert.deepEqual(billing.billing.read(), BILLING_OK);

  assert.deepEqual(host.unmount(HEALTH_ID), { ok: true, value: undefined });
  const remounted = assertMounted(mountHealthMini(host));
  assert.notEqual(remounted.billing, health.billing);
  assert.deepEqual(remounted.billing.read(), SCOPE_DENIED);
  assert.deepEqual(host.call(HEALTH_ID, 'billing', 'read'), SCOPE_DENIED);
  assert.deepEqual(billing.billing.read(), BILLING_OK);
  assert.deepEqual(remounted.identity.read(), GUEST_STUB);
});

test('known-method envelopes stay .1079–.1102 after billing remount', () => {
  const host = hostWithSnaps();
  const billing = assertMounted(mountTestBillingMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));
  const shot = assertMounted(mountClearShotMini(host));
  const health = assertMounted(mountHealthMini(host));

  injectBillingSnapshot(billing.billing, BILLING_OVERRIDE);
  assert.deepEqual(host.unmount(BILLING_ID), { ok: true, value: undefined });
  const remounted = assertMounted(mountTestBillingMini(host));
  assert.deepEqual(remounted.billing.read(), BILLING_OK);

  assert.deepEqual(health.billing.read(), SCOPE_DENIED);
  assert.deepEqual(health.photos.read(), SCOPE_DENIED);
  assert.deepEqual(granted.billing.read(), GRANTED_OK);
  assert.deepEqual(granted.photos.read(), PHOTOS_STUB);
  assert.deepEqual(shot.photos.read(), PHOTOS_STUB);
  assert.deepEqual(shot.billing.read(), SCOPE_DENIED);
  assert.deepEqual(shot.storage.get(KEY), SCOPE_DENIED);
  assert.deepEqual(host.call(GRANTED_ID, 'billing', 'foo'), UNKNOWN_METHOD);
  assert.deepEqual(host.call(GRANTED_ID, 'camera', 'read'), UNKNOWN_CAPABILITY);
  assert.deepEqual(mountTestBillingMini(host), ALREADY_MOUNTED);
  assert.deepEqual(host.mount('totally.unknown'), UNKNOWN);
  assert.deepEqual(host.unmount('utility.probe'), NOT_MOUNTED);
  assert.deepEqual(resolveMiniDeeplink('https://evil'), BAD_DEEPLINK);
  assert.deepEqual(resolveMiniDeeplink('mission://minis/totally-unknown'), UNKNOWN);
  assert.deepEqual(remounted.storage.set(KEY, BILLING_VALUE), SCOPE_DENIED);
});

test('docs/harness/HOP.md stays the empty template', () => {
  const hop = readFileSync(path.join(repoRoot, 'docs', 'harness', 'HOP.md'), 'utf8');
  assert.match(hop, /^# Live hop\n/);
  assert.match(hop, /^ticket:\n/m);
  assert.match(hop, /^done_means:\n/m);
  assert.match(hop, /^accept:\n/m);
  assert.equal(hop.includes('1103'), false);
  assert.equal(hop.includes('billing remount'), false);
  assert.equal(hop.includes('injectBillingSnapshot'), false);
  assert.equal(hop.includes('test.billing'), false);
});

test('remount rebinds billing from host options — leftover inject dies', () => {
  const src = sourceOf('host.ts');
  assert.equal(src.includes('billingSnapshotFor(opts, manifest.id)'), true);
  assert.equal(src.includes('opts.billings'), true);
  assert.equal(src.includes('.1103'), true);
  assert.equal(/from\s+['"][^'"]*stripe/i.test(src), false);
  assert.equal(src.includes('createClient'), false);
  assert.equal(src.includes('premiumServer'), false);
  assert.equal(/from\s+['"][^'"]*stripe/i.test(src), false);
  assert.equal(src.includes('getUserMedia'), false);
  assert.equal(/android\.provider\.MediaStore/i.test(src), false);
  assert.equal(src.includes('apps/android'), false);
  assert.equal(src.includes('AuthProvider'), false);
  assert.equal(src.includes('safeStorage'), false);
  assert.equal(src.includes('localStorage'), false);
  assert.equal(src.includes('checkout.sessions'), false);

  const fakeSrc = sourceOf('fakes.ts');
  assert.equal(fakeSrc.includes('export function injectBillingSnapshot'), true);
  assert.equal(fakeSrc.includes('copyBilling'), true);
  assert.equal(fakeSrc.includes('.1103'), true);
  assert.equal(/from\s+['"][^'"]*stripe/i.test(fakeSrc), false);
  assert.equal(fakeSrc.includes('premiumServer'), false);
  assert.equal(/checkout\.sessions/i.test(fakeSrc), false);
});
