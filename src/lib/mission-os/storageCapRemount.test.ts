/**
 * CapResult remount after storage_cap.
 *
 * Judge ≠ builder: deny codes, bounds, and miss envelopes are
 * hardcoded here — not read back from STORAGE_MAX_* as the overflow
 * size. A remount that is still capped, still holds prior keys, or
 * wipes B would mean overflow occupancy survived unmount.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createMiniHost } from './host';
import { mountHealthMini } from './health';
import { mountClearShotMini } from './clearshot';
import { mountTestGrantedMini } from './allowProbe';
import { resolveMiniDeeplink } from './deeplink';
import type { CapResult, MountedMini } from './types';

const here = import.meta.dirname;

function sourceOf(file: string): string {
  return readFileSync(path.join(here, file), 'utf8');
}

/** Hardcoded — do not use STORAGE_MAX_* as the overflow size. */
const MAX_KEYS = 32;
const MAX_VALUE_BYTES = 4096;

const STORAGE_CAP: CapResult<never> = { ok: false, code: 'storage_cap' };
const SCOPE_DENIED: CapResult<never> = { ok: false, code: 'scope_denied' };
const NOT_MOUNTED: CapResult<never> = { ok: false, code: 'not_mounted' };
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
const UNKNOWN_METHOD: CapResult<never> = { ok: false, code: 'unknown_method' };
const UNKNOWN_CAPABILITY: CapResult<never> = { ok: false, code: 'unknown_capability' };
const ALREADY_MOUNTED: CapResult<never> = { ok: false, code: 'already_mounted' };
const UNKNOWN: CapResult<never> = { ok: false, code: 'unknown_mini' };
const BAD_DEEPLINK: CapResult<never> = { ok: false, code: 'bad_deeplink' };

const HEALTH_ID = 'l1.health';
const CLEARSHOT_ID = 'utility.clearshot';
const GRANTED_ID = 'test.granted';
const OVERSIZED = 'x'.repeat(MAX_VALUE_BYTES + 1);
const EXACT = 'y'.repeat(MAX_VALUE_BYTES);
const KEY = 'secret';
const GRANTED_VALUE = 'granted-only';
const HEALTH_VALUE = 'health-only';

function assertMounted(result: CapResult<MountedMini>): MountedMini {
  assert.equal(result.ok, true, 'mount must succeed');
  if (!result.ok) throw new Error('unreachable');
  return result.value;
}

function assertStorageCap(result: CapResult<unknown>, label: string): void {
  assert.deepEqual(result, STORAGE_CAP, label);
  assert.equal(result.ok, false, label);
  if (result.ok) return;
  assert.equal(result.code, 'storage_cap', label);
  assert.notEqual(result.code, 'scope_denied', label);
  assert.notEqual(result.code, 'not_mounted', label);
  assert.notEqual(result.code, 'unknown_method', label);
  assert.notEqual(result.code, 'leftover_overflow', label);
}

function fillKeys(mini: MountedMini, count: number): void {
  for (let i = 0; i < count; i++) {
    assert.deepEqual(mini.storage.set(`k${i}`, 'v'), SET_OK, `fill k${i}`);
  }
}

test('33rd-key storage_cap then unmount+remount A starts empty; B untouched', () => {
  const host = createMiniHost();
  const health = assertMounted(mountHealthMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));

  fillKeys(health, MAX_KEYS);
  assert.deepEqual(granted.storage.set(KEY, GRANTED_VALUE), SET_OK);

  let threw = false;
  let overflow: CapResult<unknown> | undefined;
  try {
    overflow = health.storage.set('overflow', 'v');
  } catch {
    threw = true;
  }
  assert.equal(threw, false, '33rd set must not throw');
  assertStorageCap(overflow as CapResult<unknown>, 'health 33rd before unmount');
  assert.deepEqual(health.storage.get('overflow'), MISS);
  assert.deepEqual(health.storage.get('k0'), { ok: true, value: 'v' });

  assert.deepEqual(host.unmount(HEALTH_ID), { ok: true, value: undefined });
  assert.deepEqual(granted.storage.get(KEY), { ok: true, value: GRANTED_VALUE });
  assert.deepEqual(host.call(GRANTED_ID, 'storage', 'get', { key: KEY }), {
    ok: true,
    value: GRANTED_VALUE,
  });
  assert.deepEqual(host.call(HEALTH_ID, 'storage', 'get', { key: 'k0' }), NOT_MOUNTED);

  const remounted = assertMounted(mountHealthMini(host));
  assert.notEqual(remounted, health);

  const leftover0 = remounted.storage.get('k0');
  assert.deepEqual(leftover0, MISS, 'remount must miss prior k0');
  if (!leftover0.ok) return;
  assert.notEqual(leftover0.value, 'v');

  const leftoverOverflow = remounted.storage.get('overflow');
  assert.deepEqual(leftoverOverflow, MISS, 'refused overflow key must not appear');

  const first = remounted.storage.set('fresh', HEALTH_VALUE);
  if (first.ok) {
    assert.deepEqual(first, SET_OK, 'first in-bound write after remount must succeed');
  } else {
    assert.notEqual(first.code, 'storage_cap', 'remount must not still be capped');
  }
  assert.deepEqual(remounted.storage.get('fresh'), { ok: true, value: HEALTH_VALUE });
  assert.deepEqual(granted.storage.get(KEY), { ok: true, value: GRANTED_VALUE });
});

test('remount after 33rd-key cap can fill 32 again; 33rd is still storage_cap', () => {
  const host = createMiniHost();
  const health = assertMounted(mountHealthMini(host));
  fillKeys(health, MAX_KEYS);
  assertStorageCap(health.storage.set('overflow', 'v'), 'pre-unmount 33rd');

  assert.deepEqual(host.unmount(HEALTH_ID), { ok: true, value: undefined });
  const remounted = assertMounted(mountHealthMini(host));
  assert.deepEqual(remounted.storage.get('k0'), MISS, 'refill must start from empty');
  assert.deepEqual(remounted.storage.get('k31'), MISS);

  fillKeys(remounted, MAX_KEYS);
  assert.deepEqual(remounted.storage.get('k0'), { ok: true, value: 'v' });
  assert.deepEqual(remounted.storage.get('k31'), { ok: true, value: 'v' });
  assertStorageCap(remounted.storage.set('overflow', 'v'), 'post-remount 33rd');
  assert.deepEqual(remounted.storage.get('overflow'), MISS);
});

test('oversized refuse then unmount+remount misses the prior valid key', () => {
  const host = createMiniHost();
  const health = assertMounted(mountHealthMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));

  assert.deepEqual(health.storage.set(KEY, HEALTH_VALUE), SET_OK);
  assert.deepEqual(granted.storage.set(KEY, GRANTED_VALUE), SET_OK);
  assertStorageCap(health.storage.set(KEY, OVERSIZED), 'oversized overwrite refused');
  assert.deepEqual(health.storage.get(KEY), { ok: true, value: HEALTH_VALUE });

  assert.deepEqual(host.unmount(HEALTH_ID), { ok: true, value: undefined });
  assert.deepEqual(granted.storage.get(KEY), { ok: true, value: GRANTED_VALUE });

  const remounted = assertMounted(mountHealthMini(host));
  const leftover = remounted.storage.get(KEY);
  assert.deepEqual(leftover, MISS);
  if (!leftover.ok) return;
  assert.notEqual(leftover.value, HEALTH_VALUE);

  assert.deepEqual(remounted.storage.set(KEY, EXACT), SET_OK);
  assert.deepEqual(remounted.storage.get(KEY), { ok: true, value: EXACT });
  assertStorageCap(remounted.storage.set('big', OVERSIZED), 'oversized after remount');
  assert.deepEqual(remounted.storage.get('big'), MISS);
  assert.deepEqual(granted.storage.get(KEY), { ok: true, value: GRANTED_VALUE });
});

test('host.call after remount-after-cap matches the fake — miss / ok / cap', () => {
  const host = createMiniHost();
  const health = assertMounted(mountHealthMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));

  fillKeys(health, MAX_KEYS);
  assert.deepEqual(granted.storage.set(KEY, GRANTED_VALUE), SET_OK);
  assertStorageCap(
    host.call(HEALTH_ID, 'storage', 'set', { key: 'overflow', value: 'v' }),
    'host.call 33rd before unmount'
  );

  assert.deepEqual(host.unmount(HEALTH_ID), { ok: true, value: undefined });
  assertMounted(mountHealthMini(host));

  assert.deepEqual(host.call(HEALTH_ID, 'storage', 'get', { key: 'k0' }), MISS);
  assert.deepEqual(host.call(HEALTH_ID, 'storage', 'get', { key: 'overflow' }), MISS);
  assert.deepEqual(
    host.call(HEALTH_ID, 'storage', 'set', { key: 'fresh', value: HEALTH_VALUE }),
    SET_OK
  );
  assert.deepEqual(host.call(HEALTH_ID, 'storage', 'get', { key: 'fresh' }), {
    ok: true,
    value: HEALTH_VALUE,
  });
  assert.deepEqual(host.call(GRANTED_ID, 'storage', 'get', { key: KEY }), {
    ok: true,
    value: GRANTED_VALUE,
  });
});

test('ClearShot oversized cap then remount: write succeeds; get stays scope_denied', () => {
  const host = createMiniHost();
  const shot = assertMounted(mountClearShotMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));

  assert.deepEqual(shot.storage.set(KEY, 'ok'), SET_OK);
  assert.deepEqual(granted.storage.set(KEY, GRANTED_VALUE), SET_OK);
  assertStorageCap(shot.storage.set(KEY, OVERSIZED), 'clearshot oversized');
  assert.deepEqual(shot.storage.get(KEY), SCOPE_DENIED);

  assert.deepEqual(host.unmount(CLEARSHOT_ID), { ok: true, value: undefined });
  assert.deepEqual(granted.storage.get(KEY), { ok: true, value: GRANTED_VALUE });

  const remounted = assertMounted(mountClearShotMini(host));
  assert.deepEqual(remounted.storage.get(KEY), SCOPE_DENIED);
  assert.deepEqual(remounted.storage.set(KEY, 'after'), SET_OK);
  assert.deepEqual(remounted.storage.get(KEY), SCOPE_DENIED);
  assert.deepEqual(granted.storage.get(KEY), { ok: true, value: GRANTED_VALUE });
});

test('known-method envelopes stay .1079–.1098 after remount-after-cap', () => {
  const host = createMiniHost();
  const health = assertMounted(mountHealthMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));
  const shot = assertMounted(mountClearShotMini(host));

  fillKeys(health, MAX_KEYS);
  assertStorageCap(health.storage.set('overflow', 'v'), 'cap before remount');
  assert.deepEqual(host.unmount(HEALTH_ID), { ok: true, value: undefined });
  const remounted = assertMounted(mountHealthMini(host));
  assert.deepEqual(remounted.storage.set(KEY, 'ok'), SET_OK);

  assert.deepEqual(remounted.identity.read(), GUEST_STUB);
  assert.deepEqual(remounted.billing.read(), SCOPE_DENIED);
  assert.deepEqual(remounted.photos.read(), SCOPE_DENIED);
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
  assert.equal(hop.includes('1099'), false);
  assert.equal(hop.includes('storage_cap'), false);
  assert.equal(hop.includes('remount'), false);
  assert.equal(hop.includes('l1.health'), false);
});

test('unmount still drops only that map after a cap refuse — no leftover occupancy', () => {
  const src = sourceOf('host.ts');
  assert.equal(src.includes('storeFor(stores, manifest.id)'), true);
  assert.equal(src.includes('stores.delete(id)'), true);
  assert.equal(src.includes('store.clear()'), true);
  assert.equal(src.includes('stores.clear()'), false);
  assert.equal(src.includes('.1099'), true);
  assert.equal(/from\s+['"][^'"]*stripe/i.test(src), false);
  assert.equal(src.includes('premiumServer'), false);
  assert.equal(src.includes('getUserMedia'), false);
  assert.equal(/android\.provider\.MediaStore/i.test(src), false);
  assert.equal(src.includes('apps/android'), false);
  assert.equal(src.includes('safeStorage'), false);
  assert.equal(src.includes('localStorage'), false);
});
