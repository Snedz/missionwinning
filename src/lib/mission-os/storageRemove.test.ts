/**
 * CapResult storage.remove consistency.
 *
 * Judge ≠ builder: deny codes and closed-method names are hardcoded
 * here — not read back from STORAGE_METHODS / production constants
 * as the source of truth. A remove that throws, returns
 * unknown_method, deletes on deny, or leaves occupancy after a
 * successful delete would mean the door grew a second shape.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { STORAGE_METHODS, type CapResult, type MountedMini } from './types';
import { createStorageFake } from './fakes';
import { createMiniHost } from './host';
import { HEALTH_MINI_MANIFEST, mountHealthMini } from './health';
import { mountClearShotMini } from './clearshot';
import { mountTestGrantedMini } from './allowProbe';
import { TEST_NO_STORAGE_MANIFEST, mountTestNoStorageMini } from './storageProbe';
import { mountTestBillingMini } from './billingProbe';
import { resolveMiniDeeplink } from './deeplink';

const here = import.meta.dirname;

function sourceOf(file: string): string {
  return readFileSync(path.join(here, file), 'utf8');
}

/** Hardcoded — do not use STORAGE_MAX_* as the overflow size. */
const MAX_KEYS = 32;

/** Hardcoded closed set — do not read STORAGE_METHODS as truth. */
const CLOSED = ['get', 'set', 'remove'] as const;

const SCOPE_DENIED: CapResult<never> = { ok: false, code: 'scope_denied' };
const NOT_MOUNTED: CapResult<never> = { ok: false, code: 'not_mounted' };
const UNKNOWN_METHOD: CapResult<never> = { ok: false, code: 'unknown_method' };
const UNKNOWN_CAPABILITY: CapResult<never> = { ok: false, code: 'unknown_capability' };
const STORAGE_CAP: CapResult<never> = { ok: false, code: 'storage_cap' };
const ALREADY_MOUNTED: CapResult<never> = { ok: false, code: 'already_mounted' };
const UNKNOWN: CapResult<never> = { ok: false, code: 'unknown_mini' };
const BAD_DEEPLINK: CapResult<never> = { ok: false, code: 'bad_deeplink' };
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
const PHOTOS_STUB: CapResult<never> = { ok: false, code: 'photos_stub' };

const HEALTH_ID = 'l1.health';
const GRANTED_ID = 'test.granted';
const KEY = 'secret';
const HEALTH_VALUE = 'health-only';
const GRANTED_VALUE = 'granted-only';

function assertMounted(result: CapResult<MountedMini>): MountedMini {
  assert.equal(result.ok, true, 'mount must succeed');
  if (!result.ok) throw new Error('unreachable');
  return result.value;
}

function assertScopeDenied(result: CapResult<unknown>, label: string): void {
  assert.deepEqual(result, SCOPE_DENIED, label);
  assert.equal(result.ok, false, label);
  if (result.ok) return;
  assert.equal(result.code, 'scope_denied', label);
  assert.notEqual(result.code, 'unknown_method', label);
  assert.notEqual(result.code, 'not_mounted', label);
  assert.notEqual(result.code, 'storage_cap', label);
}

function fillKeys(mini: MountedMini, count: number): void {
  for (let i = 0; i < count; i++) {
    assert.deepEqual(mini.storage.set(`k${i}`, 'v'), SET_OK, `fill k${i}`);
  }
}

test('closed storage methods are exactly get + set + remove', () => {
  assert.deepEqual([...CLOSED], ['get', 'set', 'remove']);
  assert.deepEqual([...STORAGE_METHODS], [...CLOSED]);
  const fake = createStorageFake(HEALTH_MINI_MANIFEST);
  assert.deepEqual(Object.keys(fake).sort(), [...CLOSED].sort());
});

test('Health: remove of a live key is ok; get after is miss; miss remove is ok', () => {
  const host = createMiniHost();
  const health = assertMounted(mountHealthMini(host));

  assert.deepEqual(health.storage.set(KEY, HEALTH_VALUE), SET_OK);
  assert.deepEqual(health.storage.get(KEY), { ok: true, value: HEALTH_VALUE });

  let threw = false;
  let removed: CapResult<unknown> | undefined;
  try {
    removed = health.storage.remove(KEY);
  } catch {
    threw = true;
  }
  assert.equal(threw, false, 'remove must not throw');
  assert.deepEqual(removed, SET_OK);
  assert.deepEqual(health.storage.get(KEY), MISS);

  assert.deepEqual(health.storage.remove(KEY), SET_OK, 'miss remove is idempotent ok');
  assert.deepEqual(health.storage.get(KEY), MISS);
});

test('test.granted: host.call remove matches the fake — ok then miss', () => {
  const host = createMiniHost();
  const granted = assertMounted(mountTestGrantedMini(host));

  assert.deepEqual(granted.storage.set(KEY, GRANTED_VALUE), SET_OK);
  assert.deepEqual(host.call(GRANTED_ID, 'storage', 'remove', { key: KEY }), SET_OK);
  assert.deepEqual(granted.storage.get(KEY), MISS);
  assert.deepEqual(host.call(GRANTED_ID, 'storage', 'get', { key: KEY }), MISS);
  assert.deepEqual(host.call(GRANTED_ID, 'storage', 'remove', { key: KEY }), SET_OK);
});

test('unscoped remove is scope_denied and does not delete a seeded key', () => {
  const store = new Map<string, string>();
  store.set(KEY, 'seed');
  const fake = createStorageFake(TEST_NO_STORAGE_MANIFEST, store);

  let threw = false;
  let refused: CapResult<unknown> | undefined;
  try {
    refused = fake.remove(KEY);
  } catch {
    threw = true;
  }
  assert.equal(threw, false, 'unscoped remove must not throw');
  assertScopeDenied(refused as CapResult<unknown>, 'test.nostorage fake remove');
  assert.equal(store.get(KEY), 'seed');

  const denied = assertMounted(mountTestNoStorageMini(createMiniHost()));
  assertScopeDenied(denied.storage.remove(KEY), 'test.nostorage host remove');
  assertScopeDenied(denied.storage.get(KEY), 'test.nostorage host get');
  assertScopeDenied(denied.storage.set(KEY, 'x'), 'test.nostorage host set');

  const billing = assertMounted(mountTestBillingMini(createMiniHost()));
  assertScopeDenied(billing.storage.remove(KEY), 'test.billing host remove');
});

test('ClearShot: remove is ok (write); get stays scope_denied', () => {
  const host = createMiniHost();
  const shot = assertMounted(mountClearShotMini(host));

  assert.deepEqual(shot.storage.set(KEY, 'ok'), SET_OK);
  assert.deepEqual(shot.storage.get(KEY), SCOPE_DENIED);
  assert.deepEqual(shot.storage.remove(KEY), SET_OK);
  assert.deepEqual(shot.storage.get(KEY), SCOPE_DENIED);
  assert.deepEqual(shot.storage.remove(KEY), SET_OK);
});

test('unmounted host.call remove is not_mounted — does not throw, does not auto-mount', () => {
  const host = createMiniHost();
  let threw = false;
  let refused: CapResult<unknown> | undefined;
  try {
    refused = host.call(HEALTH_ID, 'storage', 'remove', { key: KEY });
  } catch {
    threw = true;
  }
  assert.equal(threw, false);
  assert.deepEqual(refused, NOT_MOUNTED);
  if (!refused || refused.ok) return;
  assert.equal(refused.code, 'not_mounted');
  assert.notEqual(refused.code, 'scope_denied');
  assert.notEqual(refused.code, 'unknown_method');
  assert.deepEqual(host.listMounted(), { ok: true, value: [] });
});

test('storage.clear and storage.delete stay unknown_method; remove is known', () => {
  const host = createMiniHost();
  const health = assertMounted(mountHealthMini(host));
  assert.deepEqual(health.storage.set(KEY, HEALTH_VALUE), SET_OK);

  assert.deepEqual(host.call(HEALTH_ID, 'storage', 'clear', { key: KEY }), UNKNOWN_METHOD);
  assert.deepEqual(host.call(HEALTH_ID, 'storage', 'delete', { key: KEY }), UNKNOWN_METHOD);
  assert.deepEqual(health.storage.get(KEY), { ok: true, value: HEALTH_VALUE });

  assert.deepEqual(host.call(HEALTH_ID, 'storage', 'remove', { key: KEY }), SET_OK);
  assert.deepEqual(health.storage.get(KEY), MISS);

  const deniedHost = createMiniHost();
  const denied = assertMounted(mountTestNoStorageMini(deniedHost));
  assertScopeDenied(denied.storage.remove(KEY), 'undeclared remove');
  assert.deepEqual(deniedHost.call('test.nostorage', 'storage', 'clear'), SCOPE_DENIED);
  assert.deepEqual(deniedHost.call('test.nostorage', 'storage', 'delete'), SCOPE_DENIED);
});

test('A.remove does not delete B — dual-mount isolation stays', () => {
  const host = createMiniHost();
  const health = assertMounted(mountHealthMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));

  assert.deepEqual(health.storage.set(KEY, HEALTH_VALUE), SET_OK);
  assert.deepEqual(granted.storage.set(KEY, GRANTED_VALUE), SET_OK);

  assert.deepEqual(health.storage.remove(KEY), SET_OK);
  assert.deepEqual(health.storage.get(KEY), MISS);
  assert.deepEqual(granted.storage.get(KEY), { ok: true, value: GRANTED_VALUE });
  assert.deepEqual(host.call(GRANTED_ID, 'storage', 'get', { key: KEY }), {
    ok: true,
    value: GRANTED_VALUE,
  });
});

test('remove drops occupancy — after 32-key cap, remove one, next set is ok', () => {
  const host = createMiniHost();
  const health = assertMounted(mountHealthMini(host));
  fillKeys(health, MAX_KEYS);

  let overflow: CapResult<unknown> | undefined;
  let threw = false;
  try {
    overflow = health.storage.set('overflow', 'v');
  } catch {
    threw = true;
  }
  assert.equal(threw, false);
  assert.deepEqual(overflow, STORAGE_CAP);
  assert.deepEqual(health.storage.get('overflow'), MISS);

  assert.deepEqual(health.storage.remove('k0'), SET_OK);
  assert.deepEqual(health.storage.get('k0'), MISS);

  const next = health.storage.set('fresh', HEALTH_VALUE);
  if (next.ok) {
    assert.deepEqual(next, SET_OK);
  } else {
    assert.notEqual(next.code, 'storage_cap', 'remove must drop occupancy');
  }
  assert.deepEqual(health.storage.get('fresh'), { ok: true, value: HEALTH_VALUE });
  assert.deepEqual(health.storage.set('overflow', 'v'), STORAGE_CAP);
  assert.deepEqual(health.storage.get('overflow'), MISS);
});

test('known-method envelopes stay .1079–.1099 after remove', () => {
  const host = createMiniHost();
  const health = assertMounted(mountHealthMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));
  const shot = assertMounted(mountClearShotMini(host));

  assert.deepEqual(health.storage.set(KEY, HEALTH_VALUE), SET_OK);
  assert.deepEqual(health.storage.remove(KEY), SET_OK);

  assert.deepEqual(health.identity.read(), GUEST_STUB);
  assert.deepEqual(health.billing.read(), SCOPE_DENIED);
  assert.deepEqual(health.photos.read(), SCOPE_DENIED);
  assert.deepEqual(granted.billing.read(), MUTED_READ);
  assert.deepEqual(granted.photos.read(), PHOTOS_STUB);
  assert.deepEqual(shot.photos.read(), PHOTOS_STUB);
  assert.deepEqual(shot.storage.get(KEY), SCOPE_DENIED);
  assert.deepEqual(host.call(HEALTH_ID, 'identity', 'foo'), UNKNOWN_METHOD);
  assert.deepEqual(host.call(HEALTH_ID, 'camera', 'read'), UNKNOWN_CAPABILITY);
  assert.deepEqual(mountHealthMini(host), ALREADY_MOUNTED);
  assert.deepEqual(host.mount('totally.unknown'), UNKNOWN);
  assert.deepEqual(host.unmount('utility.probe'), NOT_MOUNTED);
  assert.deepEqual(resolveMiniDeeplink('https://evil'), BAD_DEEPLINK);
  assert.deepEqual(resolveMiniDeeplink('mission://minis/totally-unknown'), UNKNOWN);
});

test('docs/harness/HOP.md stays the empty template', () => {
  const hop = readFileSync(path.join(here, '..', '..', '..', 'docs', 'harness', 'HOP.md'), 'utf8');
  assert.match(hop, /^# Live hop\n/);
  assert.match(hop, /^ticket:\n/m);
  assert.match(hop, /^done_means:\n/m);
  assert.match(hop, /^accept:\n/m);
  assert.equal(hop.includes('1100'), false);
  assert.equal(hop.includes('storage.remove'), false);
  assert.equal(hop.includes('l1.health'), false);
});

test('remove wiring never imports Stripe, camera, or Android', () => {
  for (const file of ['fakes.ts', 'types.ts', 'call.ts', 'host.ts']) {
    const src = sourceOf(file);
    assert.equal(/from\s+['"][^'"]*stripe/i.test(src), false, `${file} must not import Stripe`);
    assert.equal(src.includes('premiumServer'), false, `${file} must not import premiumServer`);
    assert.equal(src.includes('getUserMedia'), false, `${file} must not open a camera`);
    assert.equal(/android\.provider\.MediaStore/i.test(src), false, `${file} must not import MediaStore`);
    assert.equal(src.includes('apps/android'), false, `${file} must not wire Android`);
    assert.equal(src.includes('safeStorage'), false, `${file} must not import safeStorage`);
    assert.equal(src.includes('localStorage'), false, `${file} must not call localStorage`);
  }

  const types = sourceOf('types.ts');
  assert.equal(types.includes("'remove'"), true);
  assert.equal(types.includes('remove(key: string)'), true);

  const fake = sourceOf('fakes.ts');
  assert.equal(fake.includes('removeStorage'), true);
  assert.equal(fake.includes('remove: (key)'), true);

  const call = sourceOf('call.ts');
  assert.equal(call.includes('mini.storage.remove'), true);
});
