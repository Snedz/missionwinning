/**
 * CapResult remount leftover old-fake storage writes.
 *
 * Judge ≠ builder: keys, values, bounds, and deny codes are
 * hardcoded here — not read back from STORAGE_MAX_* as the overflow
 * size. A remount that still shows the leftover set, or that lets
 * the old fake write remounted occupancy, would mean unmount
 * cleared the map without detaching it.
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
import { mountTestNoStorageMini } from './storageProbe';
import { resolveMiniDeeplink } from './deeplink';
import type { CapResult, MountedMini } from './types';

const here = import.meta.dirname;
const repoRoot = path.join(here, '..', '..', '..');

function sourceOf(file: string): string {
  return readFileSync(path.join(here, file), 'utf8');
}

/** Hardcoded — do not use STORAGE_MAX_* as the overflow size. */
const MAX_KEYS = 32;

const HEALTH_ID = 'l1.health';
const CLEARSHOT_ID = 'utility.clearshot';
const NOSTORAGE_ID = 'test.nostorage';
const BILLING_ID = 'test.billing';

const KEY = 'secret';
const HEALTH_VALUE = 'health-only';
const GRANTED_VALUE = 'granted-only';
const SHOT_VALUE = 'shot-only';
const LEFTOVER_VALUE = 'old-fake-only';
const AFTER_VALUE = 'remounted-only';

const SET_OK: CapResult<void> = { ok: true, value: undefined };
const MISS: CapResult<string | undefined> = { ok: true, value: undefined };
const SCOPE_DENIED: CapResult<never> = { ok: false, code: 'scope_denied' };
const NOT_MOUNTED: CapResult<never> = { ok: false, code: 'not_mounted' };
const STORAGE_CAP: CapResult<never> = { ok: false, code: 'storage_cap' };
const PHOTOS_STUB: CapResult<never> = { ok: false, code: 'photos_stub' };
const ALREADY_MOUNTED: CapResult<never> = { ok: false, code: 'already_mounted' };
const UNKNOWN: CapResult<never> = { ok: false, code: 'unknown_mini' };
const BAD_DEEPLINK: CapResult<never> = { ok: false, code: 'bad_deeplink' };
const UNKNOWN_METHOD: CapResult<never> = { ok: false, code: 'unknown_method' };
const UNKNOWN_CAPABILITY: CapResult<never> = { ok: false, code: 'unknown_capability' };
const GUEST_STUB: CapResult<{ missionId: null; callSign: null }> = {
  ok: true,
  value: { missionId: null, callSign: null },
};
const MUTED_READ: CapResult<{ bundle: 'none'; muted: true }> = {
  ok: true,
  value: { bundle: 'none', muted: true },
};

function assertMounted(result: CapResult<MountedMini>): MountedMini {
  assert.equal(result.ok, true, 'mount must succeed');
  if (!result.ok) throw new Error('unreachable');
  return result.value;
}

function assertMissNotLeftover(
  result: CapResult<unknown>,
  leftover: string,
  label: string
): void {
  assert.deepEqual(result, MISS, label);
  assert.equal(result.ok, true, label);
  if (!result || !result.ok) return;
  assert.notEqual(result.value, leftover, label);
}

function fillKeys(mini: MountedMini, count: number): void {
  for (let i = 0; i < count; i++) {
    assert.deepEqual(mini.storage.set(`k${i}`, 'v'), SET_OK, `fill k${i}`);
  }
}

test('set then unmount+remount Health starts empty; old-fake set does not write remounted', () => {
  const host = createMiniHost();
  const health = assertMounted(mountHealthMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));

  assert.deepEqual(health.storage.set(KEY, HEALTH_VALUE), SET_OK);
  assert.deepEqual(granted.storage.set(KEY, GRANTED_VALUE), SET_OK);
  assert.deepEqual(health.storage.get(KEY), { ok: true, value: HEALTH_VALUE });

  assert.deepEqual(host.unmount(HEALTH_ID), { ok: true, value: undefined });
  assert.deepEqual(granted.storage.get(KEY), { ok: true, value: GRANTED_VALUE });
  assert.deepEqual(host.call(HEALTH_ID, 'storage', 'get', { key: KEY }), NOT_MOUNTED);

  let threw = false;
  let remount: CapResult<MountedMini> | undefined;
  try {
    remount = mountHealthMini(host);
  } catch {
    threw = true;
  }
  assert.equal(threw, false, 'storage remount must not throw');
  const remounted = assertMounted(remount ?? { ok: false, code: 'stub' });
  assert.notEqual(remounted.storage, health.storage);

  assertMissNotLeftover(remounted.storage.get(KEY), HEALTH_VALUE, 'remounted fake');
  assertMissNotLeftover(
    host.call(HEALTH_ID, 'storage', 'get', { key: KEY }),
    HEALTH_VALUE,
    'remounted host.call'
  );

  assert.deepEqual(health.storage.set(KEY, LEFTOVER_VALUE), SET_OK);
  assert.deepEqual(health.storage.get(KEY), { ok: true, value: LEFTOVER_VALUE });
  assertMissNotLeftover(remounted.storage.get(KEY), LEFTOVER_VALUE, 'old-fake set');
  assertMissNotLeftover(
    host.call(HEALTH_ID, 'storage', 'get', { key: KEY }),
    LEFTOVER_VALUE,
    'old-fake host.call'
  );
  assert.deepEqual(granted.storage.get(KEY), { ok: true, value: GRANTED_VALUE });
});

test('remove on the old fake after remount does not delete remounted keys', () => {
  const host = createMiniHost();
  const health = assertMounted(mountHealthMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));

  assert.deepEqual(health.storage.set(KEY, HEALTH_VALUE), SET_OK);
  assert.deepEqual(granted.storage.set(KEY, GRANTED_VALUE), SET_OK);
  assert.deepEqual(host.unmount(HEALTH_ID), { ok: true, value: undefined });
  const remounted = assertMounted(mountHealthMini(host));

  assert.deepEqual(remounted.storage.set(KEY, AFTER_VALUE), SET_OK);
  assert.deepEqual(health.storage.remove(KEY), SET_OK);
  assert.deepEqual(health.storage.get(KEY), MISS);
  assert.deepEqual(remounted.storage.get(KEY), { ok: true, value: AFTER_VALUE });
  assert.deepEqual(host.call(HEALTH_ID, 'storage', 'get', { key: KEY }), {
    ok: true,
    value: AFTER_VALUE,
  });
  assert.deepEqual(granted.storage.get(KEY), { ok: true, value: GRANTED_VALUE });
});

test('set on remounted still does not change Granted storage', () => {
  const host = createMiniHost();
  const health = assertMounted(mountHealthMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));

  assert.deepEqual(health.storage.set(KEY, HEALTH_VALUE), SET_OK);
  assert.deepEqual(granted.storage.set(KEY, GRANTED_VALUE), SET_OK);
  assert.deepEqual(host.unmount(HEALTH_ID), { ok: true, value: undefined });
  const remounted = assertMounted(mountHealthMini(host));

  assert.deepEqual(remounted.storage.set(KEY, AFTER_VALUE), SET_OK);
  assert.deepEqual(granted.storage.get(KEY), { ok: true, value: GRANTED_VALUE });
  const b = granted.storage.get(KEY);
  if (!b || !b.ok) return;
  assert.notEqual(b.value, AFTER_VALUE);
  assert.notEqual(b.value, HEALTH_VALUE);
});

test('storage_cap then remount: old-fake set does not write remounted; not still capped', () => {
  const host = createMiniHost();
  const health = assertMounted(mountHealthMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));

  fillKeys(health, MAX_KEYS);
  assert.deepEqual(granted.storage.set(KEY, GRANTED_VALUE), SET_OK);
  assert.deepEqual(health.storage.set('overflow', 'v'), STORAGE_CAP);

  assert.deepEqual(host.unmount(HEALTH_ID), { ok: true, value: undefined });
  const remounted = assertMounted(mountHealthMini(host));
  assertMissNotLeftover(remounted.storage.get('k0'), 'v', 'cap remount k0');
  assertMissNotLeftover(remounted.storage.get('overflow'), 'v', 'cap remount overflow');

  assert.deepEqual(health.storage.set('overflow', LEFTOVER_VALUE), SET_OK);
  assertMissNotLeftover(
    remounted.storage.get('overflow'),
    LEFTOVER_VALUE,
    'old-fake cap leftover'
  );
  assert.deepEqual(remounted.storage.set('fresh', HEALTH_VALUE), SET_OK);
  assert.deepEqual(remounted.storage.get('fresh'), { ok: true, value: HEALTH_VALUE });
  assert.deepEqual(granted.storage.get(KEY), { ok: true, value: GRANTED_VALUE });
});

test('ClearShot remount: old-fake set does not occupy remounted', () => {
  const host = createMiniHost();
  const shot = assertMounted(mountClearShotMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));

  assert.deepEqual(shot.storage.set(KEY, SHOT_VALUE), SET_OK);
  assert.deepEqual(granted.storage.set(KEY, GRANTED_VALUE), SET_OK);
  assert.deepEqual(shot.storage.get(KEY), SCOPE_DENIED);

  assert.deepEqual(host.unmount(CLEARSHOT_ID), { ok: true, value: undefined });
  const remounted = assertMounted(mountClearShotMini(host));
  assert.notEqual(remounted.storage, shot.storage);
  assert.deepEqual(remounted.storage.get(KEY), SCOPE_DENIED);
  assert.deepEqual(remounted.storage.set(KEY, AFTER_VALUE), SET_OK);

  assert.deepEqual(shot.storage.set('leftover', LEFTOVER_VALUE), SET_OK);
  assert.deepEqual(remounted.storage.get(KEY), SCOPE_DENIED);
  fillKeys(remounted, MAX_KEYS - 1);
  assert.deepEqual(remounted.storage.set('overflow', 'v'), STORAGE_CAP);
  assert.deepEqual(granted.storage.get(KEY), { ok: true, value: GRANTED_VALUE });
});

test('test.nostorage remount stays scope_denied — leftover set cannot grant write', () => {
  const host = createMiniHost();
  const denied = assertMounted(mountTestNoStorageMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));

  assert.deepEqual(denied.storage.set(KEY, HEALTH_VALUE), SCOPE_DENIED);
  assert.deepEqual(denied.storage.get(KEY), SCOPE_DENIED);
  assert.deepEqual(granted.storage.set(KEY, GRANTED_VALUE), SET_OK);

  assert.deepEqual(host.unmount(NOSTORAGE_ID), { ok: true, value: undefined });
  const remounted = assertMounted(mountTestNoStorageMini(host));
  assert.notEqual(remounted.storage, denied.storage);
  assert.deepEqual(denied.storage.set(KEY, LEFTOVER_VALUE), SCOPE_DENIED);
  assert.deepEqual(remounted.storage.set(KEY, AFTER_VALUE), SCOPE_DENIED);
  assert.deepEqual(remounted.storage.get(KEY), SCOPE_DENIED);
  assert.deepEqual(host.call(NOSTORAGE_ID, 'storage', 'set', { key: KEY, value: AFTER_VALUE }), {
    ok: false,
    code: 'scope_denied',
  });
  assert.deepEqual(granted.storage.get(KEY), { ok: true, value: GRANTED_VALUE });
  assert.deepEqual(remounted.identity.read(), GUEST_STUB);
});

test('test.billing remount stays scope_denied — leftover set cannot grant storage', () => {
  const host = createMiniHost();
  const billing = assertMounted(mountTestBillingMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));

  assert.deepEqual(billing.storage.set(KEY, HEALTH_VALUE), SCOPE_DENIED);
  assert.deepEqual(granted.storage.set(KEY, GRANTED_VALUE), SET_OK);

  assert.deepEqual(host.unmount(BILLING_ID), { ok: true, value: undefined });
  const remounted = assertMounted(mountTestBillingMini(host));
  assert.notEqual(remounted.storage, billing.storage);
  assert.deepEqual(billing.storage.set(KEY, LEFTOVER_VALUE), SCOPE_DENIED);
  assert.deepEqual(remounted.storage.set(KEY, AFTER_VALUE), SCOPE_DENIED);
  assert.deepEqual(host.call(BILLING_ID, 'storage', 'get', { key: KEY }), SCOPE_DENIED);
  assert.deepEqual(granted.storage.get(KEY), { ok: true, value: GRANTED_VALUE });
  assert.deepEqual(remounted.billing.read(), MUTED_READ);
});

test('known-method envelopes stay .1079–.1107 after leftover storage remount', () => {
  const host = createMiniHost();
  const health = assertMounted(mountHealthMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));
  const shot = assertMounted(mountClearShotMini(host));

  assert.deepEqual(health.storage.set(KEY, HEALTH_VALUE), SET_OK);
  assert.deepEqual(host.unmount(HEALTH_ID), { ok: true, value: undefined });
  const remounted = assertMounted(mountHealthMini(host));
  assert.deepEqual(health.storage.set(KEY, LEFTOVER_VALUE), SET_OK);
  assert.deepEqual(remounted.storage.get(KEY), MISS);

  assert.deepEqual(remounted.identity.read(), GUEST_STUB);
  assert.deepEqual(remounted.billing.read(), SCOPE_DENIED);
  assert.deepEqual(remounted.photos.read(), SCOPE_DENIED);
  assert.deepEqual(granted.billing.read(), MUTED_READ);
  assert.deepEqual(granted.photos.read(), PHOTOS_STUB);
  assert.deepEqual(shot.photos.read(), PHOTOS_STUB);
  assert.deepEqual(shot.storage.get(KEY), SCOPE_DENIED);
  assert.deepEqual(host.call(HEALTH_ID, 'storage', 'foo'), UNKNOWN_METHOD);
  assert.deepEqual(host.call(HEALTH_ID, 'camera', 'read'), UNKNOWN_CAPABILITY);
  assert.deepEqual(mountHealthMini(host), ALREADY_MOUNTED);
  assert.deepEqual(host.mount('totally.unknown'), UNKNOWN);
  assert.deepEqual(host.unmount('utility.probe'), NOT_MOUNTED);
  assert.deepEqual(resolveMiniDeeplink('https://evil'), BAD_DEEPLINK);
  assert.deepEqual(resolveMiniDeeplink('mission://minis/totally-unknown'), UNKNOWN);
  assert.deepEqual(remounted.storage.set(KEY, AFTER_VALUE), SET_OK);
});

test('docs/harness/HOP.md stays the empty template', () => {
  const hop = readFileSync(path.join(repoRoot, 'docs', 'harness', 'HOP.md'), 'utf8');
  assert.match(hop, /^# Live hop\n/);
  assert.match(hop, /^ticket:\n/m);
  assert.match(hop, /^done_means:\n/m);
  assert.match(hop, /^accept:\n/m);
  assert.equal(hop.includes('1108'), false);
  assert.equal(hop.includes('storage remount'), false);
  assert.equal(hop.includes('old-fake'), false);
  assert.equal(hop.includes('l1.health'), false);
});

test('remount binds a new store — leftover old-fake writes die', () => {
  const src = sourceOf('host.ts');
  assert.equal(src.includes('storeFor(stores, manifest.id)'), true);
  assert.equal(src.includes('stores.delete(id)'), true);
  assert.equal(src.includes('store.clear()'), true);
  assert.equal(src.includes('stores.clear()'), false);
  assert.equal(src.includes('.1108'), true);
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
  assert.equal(fakeSrc.includes('export function createStorageFake'), true);
  assert.equal(fakeSrc.includes('.1108'), true);
  assert.equal(/from\s+['"][^'"]*stripe/i.test(fakeSrc), false);
  assert.equal(fakeSrc.includes('safeStorage'), false);
  assert.equal(fakeSrc.includes('localStorage'), false);
});
