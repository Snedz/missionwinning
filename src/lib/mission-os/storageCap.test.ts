/**
 * CapResult storage_cap — MiniHost write-bound consistency.
 *
 * Judge ≠ builder: deny codes and bounds are hardcoded here, not
 * read back from production constants for the overflow values. A
 * 4097-byte set that returns ok, scope_denied, or writes the key
 * would mean the host grew a silent extra write.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  STORAGE_MAX_KEYS,
  STORAGE_MAX_VALUE_BYTES,
} from '../../../packages/mw-core/src/module';
import { createMiniHost } from './host';
import { mountHealthMini } from './health';
import { mountClearShotMini } from './clearshot';
import { mountTestGrantedMini } from './allowProbe';
import { mountTestNoStorageMini } from './storageProbe';
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
const NOSTORAGE_ID = 'test.nostorage';
const OVERSIZED = 'x'.repeat(MAX_VALUE_BYTES + 1);
const EXACT = 'y'.repeat(MAX_VALUE_BYTES);
const KEY = 'secret';
const GRANTED_VALUE = 'granted-only';

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
  assert.notEqual(result.code, 'unknown_method', label);
  assert.notEqual(result.code, 'unknown_capability', label);
  assert.notEqual(result.code, 'not_mounted', label);
  assert.notEqual(result.code, 'unknown_mini', label);
  assert.notEqual(result.code, 'stub', label);
  assert.notEqual(result.code, 'photos_stub', label);
}

test('closed write bounds stay 32 keys / 4096 bytes', () => {
  assert.equal(STORAGE_MAX_KEYS, MAX_KEYS);
  assert.equal(STORAGE_MAX_VALUE_BYTES, MAX_VALUE_BYTES);
  assert.equal(OVERSIZED.length, MAX_VALUE_BYTES + 1);
  assert.equal(EXACT.length, MAX_VALUE_BYTES);
});

test('Health oversized set is storage_cap, does not throw, does not write', () => {
  const host = createMiniHost();
  const health = assertMounted(mountHealthMini(host));

  let threw = false;
  let refused: CapResult<unknown> | undefined;
  try {
    refused = health.storage.set(KEY, OVERSIZED);
  } catch {
    threw = true;
  }
  assert.equal(threw, false, 'storage.set must not throw');
  assertStorageCap(refused as CapResult<unknown>, 'health.set oversized');
  assert.deepEqual(health.storage.get(KEY), { ok: true, value: undefined });

  assertStorageCap(
    host.call(HEALTH_ID, 'storage', 'set', { key: KEY, value: OVERSIZED }),
    'host.call health oversized'
  );
  assert.deepEqual(host.call(HEALTH_ID, 'storage', 'get', { key: KEY }), {
    ok: true,
    value: undefined,
  });
});

test('exactly 4096 bytes still succeeds', () => {
  const host = createMiniHost();
  const health = assertMounted(mountHealthMini(host));
  assert.deepEqual(health.storage.set(KEY, EXACT), SET_OK);
  assert.deepEqual(health.storage.get(KEY), { ok: true, value: EXACT });
  assert.deepEqual(host.call(HEALTH_ID, 'storage', 'get', { key: KEY }), {
    ok: true,
    value: EXACT,
  });
});

test('33rd distinct key is storage_cap; overwrite at 32 still succeeds', () => {
  const host = createMiniHost();
  const granted = assertMounted(mountTestGrantedMini(host));

  for (let i = 0; i < MAX_KEYS; i++) {
    assert.deepEqual(granted.storage.set(`k${i}`, 'v'), SET_OK, `fill k${i}`);
  }
  assert.deepEqual(granted.storage.get('k0'), { ok: true, value: 'v' });

  let threw = false;
  let overflow: CapResult<unknown> | undefined;
  try {
    overflow = granted.storage.set('overflow', 'v');
  } catch {
    threw = true;
  }
  assert.equal(threw, false, '33rd set must not throw');
  assertStorageCap(overflow as CapResult<unknown>, '33rd key fake');
  assert.deepEqual(granted.storage.get('overflow'), { ok: true, value: undefined });

  assertStorageCap(
    host.call(GRANTED_ID, 'storage', 'set', { key: 'overflow', value: 'v' }),
    '33rd key host.call'
  );
  assert.deepEqual(host.call(GRANTED_ID, 'storage', 'get', { key: 'overflow' }), {
    ok: true,
    value: undefined,
  });

  assert.deepEqual(granted.storage.set('k0', 'replaced'), SET_OK);
  assert.deepEqual(granted.storage.get('k0'), { ok: true, value: 'replaced' });
  assert.deepEqual(granted.storage.get('k31'), { ok: true, value: 'v' });
});

test('unscoped huge set stays scope_denied — not storage_cap — and does not write', () => {
  const host = createMiniHost();
  const denied = assertMounted(mountTestNoStorageMini(host));
  const storePeek = denied.storage.set(KEY, OVERSIZED);
  assert.deepEqual(storePeek, SCOPE_DENIED);
  if (storePeek.ok) return;
  assert.equal(storePeek.code, 'scope_denied');
  assert.notEqual(storePeek.code, 'storage_cap');
  assert.deepEqual(denied.storage.get(KEY), SCOPE_DENIED);
  assert.deepEqual(
    host.call(NOSTORAGE_ID, 'storage', 'set', { key: KEY, value: OVERSIZED }),
    SCOPE_DENIED
  );
});

test('ClearShot oversized set is storage_cap; get stays scope_denied', () => {
  const host = createMiniHost();
  const shot = assertMounted(mountClearShotMini(host));
  assertStorageCap(shot.storage.set(KEY, OVERSIZED), 'clearshot oversized');
  assert.deepEqual(shot.storage.get(KEY), SCOPE_DENIED);
  assertStorageCap(
    host.call(CLEARSHOT_ID, 'storage', 'set', { key: KEY, value: OVERSIZED }),
    'clearshot host.call oversized'
  );
  assert.deepEqual(host.call(CLEARSHOT_ID, 'storage', 'get', { key: KEY }), SCOPE_DENIED);
});

test('Health overflow does not wipe test.granted keys', () => {
  const host = createMiniHost();
  const health = assertMounted(mountHealthMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));

  assert.deepEqual(granted.storage.set(KEY, GRANTED_VALUE), SET_OK);
  assertStorageCap(health.storage.set(KEY, OVERSIZED), 'health overflow beside granted');
  assert.deepEqual(granted.storage.get(KEY), { ok: true, value: GRANTED_VALUE });
  assert.deepEqual(health.storage.get(KEY), { ok: true, value: undefined });
  assert.deepEqual(host.call(GRANTED_ID, 'storage', 'get', { key: KEY }), {
    ok: true,
    value: GRANTED_VALUE,
  });
  assert.deepEqual(granted.storage.set('other', 'ok'), SET_OK);
  assert.deepEqual(granted.storage.get('other'), { ok: true, value: 'ok' });
});

test('unmounted id + oversized set stays not_mounted — lifecycle first', () => {
  const host = createMiniHost();
  assert.deepEqual(
    host.call(HEALTH_ID, 'storage', 'set', { key: KEY, value: OVERSIZED }),
    NOT_MOUNTED
  );
  assertMounted(mountHealthMini(host));
  assert.deepEqual(host.unmount(HEALTH_ID), { ok: true, value: undefined });
  const after = host.call(HEALTH_ID, 'storage', 'set', { key: KEY, value: OVERSIZED });
  assert.deepEqual(after, NOT_MOUNTED);
  if (after.ok) return;
  assert.notEqual(after.code, 'storage_cap');
  assert.deepEqual(host.listMounted(), { ok: true, value: [] });
});

test('known-method envelopes stay .1079–.1096 while a live write is under the cap', () => {
  const host = createMiniHost();
  const health = assertMounted(mountHealthMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));
  const shot = assertMounted(mountClearShotMini(host));

  assert.deepEqual(health.storage.set(KEY, 'ok'), SET_OK);
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
  assert.equal(hop.includes('1097'), false);
  assert.equal(hop.includes('storage_cap'), false);
  assert.equal(hop.includes('l1.health'), false);
});

test('storage cap path never imports Stripe, camera, or Android wiring', () => {
  for (const file of ['fakes.ts', 'host.ts', 'types.ts', 'call.ts']) {
    const src = sourceOf(file);
    assert.equal(/from\s+['"][^'"]*stripe/i.test(src), false, `${file} must not import Stripe`);
    assert.equal(src.includes('premiumServer'), false, `${file} must not import premiumServer`);
    assert.equal(src.includes('getUserMedia'), false, `${file} must not open a camera`);
    assert.equal(/android\.provider\.MediaStore/i.test(src), false, `${file} must not import MediaStore`);
    assert.equal(src.includes('apps/android'), false, `${file} must not wire Android`);
    assert.equal(src.includes('safeStorage'), false, `${file} must not import safeStorage`);
    assert.equal(src.includes('localStorage'), false, `${file} must not call localStorage`);
  }

  const fakeSrc = sourceOf('fakes.ts');
  assert.equal(fakeSrc.includes('writeStorage'), true);
  assert.equal(fakeSrc.includes('readStorage'), true);
});
