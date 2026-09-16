/**
 * CapResult leftover Health manifest-scope mutation cannot grant billing.
 *
 * Judge ≠ builder: scopes, ids, and deny codes are hardcoded here —
 * not read back from HEALTH_MINI_SCOPES / HEALTH_BOUND_SCOPES. A
 * mount that still shows leftover extras, or that lets remount pick
 * up billing.read from the passed document, would mean bind stored
 * the live grant instead of a frozen copy.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createMiniHost } from './host';
import { mountHealthMini } from './health';
import { mountClearShotMini } from './clearshot';
import { mountTestBillingMini } from './billingProbe';
import { mountTestGrantedMini } from './allowProbe';
import { resolveMiniDeeplink } from './deeplink';
import type { ModuleScope } from '../../../packages/mw-core/src/module';
import type { CapResult, ModuleManifest, MountedMini } from './types';

const here = import.meta.dirname;
const repoRoot = path.join(here, '..', '..', '..');

function sourceOf(file: string): string {
  return readFileSync(path.join(here, file), 'utf8');
}

/** Hardcoded — do not use STORAGE_MAX_* as the overflow size. */
const MAX_KEYS = 32;

const HEALTH_ID = 'l1.health';
const GRANTED_ID = 'test.granted';
const CLEARSHOT_ID = 'utility.clearshot';
const BILLING_ID = 'test.billing';

/** Hardcoded — do not import HEALTH_MINI_SCOPES. */
const HEALTH_DECLARED = ['identity.read', 'storage.read', 'storage.write'] as const;

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
const MUTED_READ: CapResult<{ bundle: 'none'; muted: true }> = {
  ok: true,
  value: { bundle: 'none', muted: true },
};
const HELD: CapResult<{ held: true }> = { ok: true, value: { held: true } };

const KEY = 'secret';
const GRANTED_VALUE = 'granted-only';
const HEALTH_VALUE = 'health-only';

function assertMounted(result: CapResult<MountedMini>): MountedMini {
  assert.equal(result.ok, true, 'mount must succeed');
  if (!result.ok) throw new Error('unreachable');
  return result.value;
}

function mutableHealth(extras: ModuleScope[] = []): ModuleManifest {
  return {
    id: HEALTH_ID,
    name: 'Health',
    version: '0.1.0',
    scopes: [...HEALTH_DECLARED, ...extras],
    surfaces: ['web'],
    freeCore: true,
    entry: 'mission://minis/health',
  };
}

function assertBillingDenied(result: CapResult<unknown>, label: string): void {
  assert.deepEqual(result, SCOPE_DENIED, label);
  assert.equal(result.ok, false, label);
  if (result.ok) return;
  assert.equal(result.code, 'scope_denied', label);
  assert.notEqual(result.code, 'unknown_method', label);
  assert.notEqual(result.code, 'unknown_capability', label);
  assert.notEqual(result.code, 'not_mounted', label);
  assert.notEqual(result.code, 'stub', label);
}

function assertHealthBound(mini: MountedMini, label: string): void {
  assert.deepEqual([...mini.manifest.scopes], [...HEALTH_DECLARED], label);
  assert.equal(mini.manifest.scopes.includes('billing.read'), false, label);
  assertBillingDenied(mini.billing.read(), `${label} read`);
  assertBillingDenied(mini.billing.checkout(), `${label} checkout`);
  assertBillingDenied(mini.billing.portal(), `${label} portal`);
  assert.deepEqual(mini.identity.read(), GUEST_STUB, `${label} identity`);
}

function fillKeys(mini: MountedMini, count: number): void {
  for (let i = 0; i < count; i++) {
    assert.deepEqual(mini.storage.set(`k${i}`, 'v'), SET_OK, `fill k${i}`);
  }
}

test('leftover extras on a Health-shaped document cannot grant billing; B untouched', () => {
  const host = createMiniHost();
  const doc = mutableHealth(['billing.read']);
  const granted = assertMounted(mountTestGrantedMini(host));

  let threw = false;
  let mount: CapResult<MountedMini> | undefined;
  try {
    mount = host.mount(doc);
  } catch {
    threw = true;
  }
  assert.equal(threw, false, 'Health bind must not throw');
  const health = assertMounted(mount ?? { ok: false, code: 'stub' });
  assertHealthBound(health, 'first mount extras');
  assertBillingDenied(host.call(HEALTH_ID, 'billing', 'read'), 'host.call extras');
  assert.deepEqual(host.listMounted(HEALTH_ID, 'billing.read'), SCOPE_DENIED);
  const peek = host.listMounted(HEALTH_ID);
  assert.equal(peek.ok, true);
  if (peek.ok) {
    assert.deepEqual([...peek.value.scopes], [...HEALTH_DECLARED]);
    assert.equal(peek.value.scopes.includes('billing.read'), false);
  }
  assert.deepEqual(granted.billing.read(), MUTED_READ);
  assert.deepEqual(granted.billing.checkout(), HELD);
});

test('leftover push on the passed document after mount does not grant billing', () => {
  const host = createMiniHost();
  const doc = mutableHealth();
  const health = assertMounted(host.mount(doc));
  const granted = assertMounted(mountTestGrantedMini(host));

  (doc.scopes as ModuleScope[]).push('billing.read');
  assert.equal(doc.scopes.includes('billing.read'), true);
  assertHealthBound(health, 'live leftover push');
  assertBillingDenied(host.call(HEALTH_ID, 'billing', 'read'), 'live leftover host.call');
  assert.deepEqual(granted.billing.read(), MUTED_READ);
});

test('leftover push on the bound manifest after mount does not grant billing', () => {
  const host = createMiniHost();
  const health = assertMounted(mountHealthMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));

  let leftoverThrew = false;
  try {
    (health.manifest.scopes as ModuleScope[]).push('billing.read');
  } catch {
    leftoverThrew = true;
  }
  assert.equal(health.manifest.scopes.includes('billing.read'), false);
  assertHealthBound(health, 'bound leftover push');
  assertBillingDenied(host.call(HEALTH_ID, 'billing', 'read'), 'bound leftover host.call');
  assert.deepEqual(granted.billing.read(), MUTED_READ);
  assert.equal(leftoverThrew || Object.isFrozen(health.manifest.scopes), true);
});

test('unmount + remount of a leftover extras document still cannot grant billing', () => {
  const host = createMiniHost();
  const doc = mutableHealth();
  const health = assertMounted(host.mount(doc));
  const granted = assertMounted(mountTestGrantedMini(host));

  (doc.scopes as ModuleScope[]).push('billing.read');
  assert.deepEqual(host.unmount(HEALTH_ID), { ok: true, value: undefined });
  assert.deepEqual(granted.billing.read(), MUTED_READ);
  assert.deepEqual(host.call(HEALTH_ID, 'billing', 'read'), NOT_MOUNTED);

  let threw = false;
  let remount: CapResult<MountedMini> | undefined;
  try {
    remount = host.mount(doc);
  } catch {
    threw = true;
  }
  assert.equal(threw, false, 'Health remount must not throw');
  const remounted = assertMounted(remount ?? { ok: false, code: 'stub' });
  assert.notEqual(remounted.billing, health.billing);
  assertHealthBound(remounted, 'remount leftover extras');
  assertBillingDenied(host.call(HEALTH_ID, 'billing', 'read'), 'remount leftover host.call');
  assert.deepEqual(host.listMounted(HEALTH_ID, 'billing.read'), SCOPE_DENIED);
  assert.deepEqual(granted.billing.read(), MUTED_READ);
});

test('storage_cap then leftover extras then remount: billing still denied; B untouched', () => {
  const host = createMiniHost();
  const doc = mutableHealth();
  const health = assertMounted(host.mount(doc));
  const granted = assertMounted(mountTestGrantedMini(host));

  fillKeys(health, MAX_KEYS);
  assert.deepEqual(granted.storage.set(KEY, GRANTED_VALUE), SET_OK);
  assert.deepEqual(health.storage.set('overflow', 'v'), STORAGE_CAP);
  (doc.scopes as ModuleScope[]).push('billing.read');

  assert.deepEqual(host.unmount(HEALTH_ID), { ok: true, value: undefined });
  assert.deepEqual(granted.billing.read(), MUTED_READ);

  const remounted = assertMounted(host.mount(doc));
  assertHealthBound(remounted, 'cap+extras remount');
  assert.deepEqual(remounted.storage.get('k0'), MISS);
  assert.deepEqual(remounted.storage.get('overflow'), MISS);
  assert.deepEqual(remounted.storage.set('fresh', HEALTH_VALUE), SET_OK);
  assert.deepEqual(granted.billing.read(), MUTED_READ);
  assert.deepEqual(granted.storage.get(KEY), { ok: true, value: GRANTED_VALUE });
});

test('ClearShot remount leftover extras cannot grant billing; Health pin stays', () => {
  const host = createMiniHost();
  const shot = assertMounted(mountClearShotMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));

  const boundPushThrew = (() => {
    try {
      (shot.manifest.scopes as ModuleScope[]).push('billing.read');
      return false;
    } catch {
      return true;
    }
  })();
  assert.equal(shot.manifest.scopes.includes('billing.read'), false);
  assertBillingDenied(shot.billing.read(), 'clearshot live leftover');
  assert.equal(boundPushThrew || Object.isFrozen(shot.manifest.scopes), true);

  assert.deepEqual(host.unmount(CLEARSHOT_ID), { ok: true, value: undefined });
  const remounted = assertMounted(mountClearShotMini(host));
  assertBillingDenied(remounted.billing.read(), 'clearshot remount');
  assert.deepEqual(host.call(CLEARSHOT_ID, 'billing', 'read'), SCOPE_DENIED);
  assert.deepEqual(granted.billing.read(), MUTED_READ);
  assert.deepEqual(remounted.photos.read(), PHOTOS_STUB);
});

test('test.billing remount still has billing — leftover Health extras cannot steal it', () => {
  const host = createMiniHost();
  const doc = mutableHealth(['billing.read']);
  const health = assertMounted(host.mount(doc));
  const billing = assertMounted(mountTestBillingMini(host));

  assertHealthBound(health, 'health beside billing');
  assert.deepEqual(billing.billing.read(), MUTED_READ);

  assert.deepEqual(host.unmount(BILLING_ID), { ok: true, value: undefined });
  const remounted = assertMounted(mountTestBillingMini(host));
  assert.deepEqual(remounted.billing.read(), MUTED_READ);
  assert.deepEqual(host.call(BILLING_ID, 'billing', 'read'), MUTED_READ);
  assertBillingDenied(health.billing.read(), 'health still denied');
});

test('known-method envelopes stay .1079–.1108 after leftover Health extras', () => {
  const host = createMiniHost();
  const doc = mutableHealth(['billing.read']);
  assertMounted(host.mount(doc));
  const granted = assertMounted(mountTestGrantedMini(host));
  const shot = assertMounted(mountClearShotMini(host));

  (doc.scopes as ModuleScope[]).push('photos.read');
  assert.deepEqual(host.unmount(HEALTH_ID), { ok: true, value: undefined });
  const remounted = assertMounted(host.mount(doc));
  assertHealthBound(remounted, 'envelopes remount');

  assert.deepEqual(remounted.identity.read(), GUEST_STUB);
  assert.deepEqual(remounted.photos.read(), SCOPE_DENIED);
  assert.deepEqual(granted.billing.read(), MUTED_READ);
  assert.deepEqual(granted.photos.read(), PHOTOS_STUB);
  assert.deepEqual(shot.photos.read(), PHOTOS_STUB);
  assert.deepEqual(shot.storage.get(KEY), SCOPE_DENIED);
  assert.deepEqual(host.call(HEALTH_ID, 'billing', 'foo'), SCOPE_DENIED);
  assert.deepEqual(host.call(HEALTH_ID, 'camera', 'read'), UNKNOWN_CAPABILITY);
  assert.deepEqual(host.call(GRANTED_ID, 'billing', 'foo'), UNKNOWN_METHOD);
  assert.deepEqual(mountHealthMini(host), ALREADY_MOUNTED);
  assert.deepEqual(host.mount('totally.unknown'), UNKNOWN);
  assert.deepEqual(host.unmount('utility.probe'), NOT_MOUNTED);
  assert.deepEqual(resolveMiniDeeplink('https://evil'), BAD_DEEPLINK);
  assert.deepEqual(resolveMiniDeeplink('mission://minis/totally-unknown'), UNKNOWN);
  assert.deepEqual(remounted.storage.set(KEY, HEALTH_VALUE), SET_OK);
});

test('docs/harness/HOP.md stays the empty template', () => {
  const hop = readFileSync(path.join(repoRoot, 'docs', 'harness', 'HOP.md'), 'utf8');
  assert.match(hop, /^# Live hop\n/);
  assert.match(hop, /^ticket:\n/m);
  assert.match(hop, /^done_means:\n/m);
  assert.match(hop, /^accept:\n/m);
  assert.equal(hop.includes('1109'), false);
  assert.equal(hop.includes('leftover extras'), false);
  assert.equal(hop.includes('HEALTH_BOUND_SCOPES'), false);
  assert.equal(hop.includes('l1.health'), false);
});

test('bind copies + freezes Health scopes — leftover extras die', () => {
  const src = sourceOf('host.ts');
  assert.equal(src.includes('bindManifest'), true);
  assert.equal(src.includes("manifest.id === 'l1.health'"), true);
  assert.equal(src.includes('Object.freeze'), true);
  assert.equal(src.includes('.1109'), true);
  assert.equal(src.includes('createIdentityFake(bound'), true);
  assert.equal(src.includes('createBillingFake(bound'), true);
  assert.equal(src.includes('createPhotosFake(bound'), true);
  assert.equal(src.includes('createStorageFake(bound'), true);
  assert.equal(src.includes('storeFor(stores, bound.id)'), true);
  assert.equal(src.includes("inventoryFromManifest(mini.manifest)"), true);
  assert.equal(/from\s+['"][^'"]*stripe/i.test(src), false);
  assert.equal(src.includes('createClient'), false);
  assert.equal(src.includes('premiumServer'), false);
  assert.equal(src.includes('getUserMedia'), false);
  assert.equal(/android\.provider\.MediaStore/i.test(src), false);
  assert.equal(src.includes('apps/android'), false);
  assert.equal(src.includes('AuthProvider'), false);
  assert.equal(src.includes('safeStorage'), false);
  assert.equal(src.includes('localStorage'), false);

  const fakeSrc = sourceOf('fakes.ts');
  assert.equal(fakeSrc.includes('.1109'), true);
  assert.equal(/from\s+['"][^'"]*stripe/i.test(fakeSrc), false);
  assert.equal(fakeSrc.includes('safeStorage'), false);
  assert.equal(fakeSrc.includes('localStorage'), false);
});
