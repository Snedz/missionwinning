/**
 * Dual-mount CapResult storage isolation.
 *
 * Judge ≠ builder: ids, keys, values, and miss envelopes are hardcoded
 * here — not read back from HEALTH_MINI_SCOPES / TEST_GRANTED_SCOPES.
 * A shared last-write-wins map, or unmount A wiping B, would mean the
 * host grew one keyspace for every mounted mini.
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
import type { CapResult, MiniInventoryEntry, MountedMini } from './types';

const here = import.meta.dirname;

function sourceOf(file: string): string {
  return readFileSync(path.join(here, file), 'utf8');
}

const HEALTH_ID = 'l1.health';
const CLEARSHOT_ID = 'utility.clearshot';
const GRANTED_ID = 'test.granted';

const KEY = 'secret';
const HEALTH_VALUE = 'health-only';
const GRANTED_VALUE = 'granted-only';
const SHOT_VALUE = 'shot-only';

const SET_OK: CapResult<void> = { ok: true, value: undefined };
const MISS: CapResult<string | undefined> = { ok: true, value: undefined };
const SCOPE_DENIED: CapResult<never> = { ok: false, code: 'scope_denied' };
const PHOTOS_STUB: CapResult<never> = { ok: false, code: 'photos_stub' };
const ALREADY_MOUNTED: CapResult<never> = { ok: false, code: 'already_mounted' };
const NOT_MOUNTED: CapResult<never> = { ok: false, code: 'not_mounted' };
const UNKNOWN: CapResult<never> = { ok: false, code: 'unknown_mini' };
const BAD_DEEPLINK: CapResult<never> = { ok: false, code: 'bad_deeplink' };
const UNKNOWN_METHOD: CapResult<never> = { ok: false, code: 'unknown_method' };

function assertMounted(result: CapResult<MountedMini>): MountedMini {
  assert.equal(result.ok, true, 'mount must succeed');
  if (!result.ok) throw new Error('unreachable');
  return result.value;
}

function assertOk<T>(result: CapResult<T>): T {
  assert.equal(result.ok, true, 'CapResult must succeed');
  if (!result.ok) throw new Error('unreachable');
  return result.value;
}

function listedIds(entries: readonly MiniInventoryEntry[]): string[] {
  return entries.map((row) => row.id);
}

test('Health set is invisible to test.granted get — miss, not Health value', () => {
  const host = createMiniHost();
  const health = assertMounted(mountHealthMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));

  assert.deepEqual(health.storage.set(KEY, HEALTH_VALUE), SET_OK);
  const cross = granted.storage.get(KEY);
  assert.deepEqual(cross, MISS);
  if (!cross.ok) return;
  assert.notEqual(cross.value, HEALTH_VALUE);

  const viaCall = host.call(GRANTED_ID, 'storage', 'get', { key: KEY });
  assert.deepEqual(viaCall, MISS);
  if (!viaCall.ok) return;
  assert.notEqual(viaCall.value, HEALTH_VALUE);
});

test('test.granted set is invisible to Health get', () => {
  const host = createMiniHost();
  const health = assertMounted(mountHealthMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));

  assert.deepEqual(granted.storage.set(KEY, GRANTED_VALUE), SET_OK);
  const cross = health.storage.get(KEY);
  assert.deepEqual(cross, MISS);
  if (!cross.ok) return;
  assert.notEqual(cross.value, GRANTED_VALUE);

  assert.deepEqual(host.call(HEALTH_ID, 'storage', 'get', { key: KEY }), MISS);
});

test('same key on both mounts keeps each value — not last-write-wins', () => {
  const host = createMiniHost();
  const health = assertMounted(mountHealthMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));

  assert.deepEqual(health.storage.set(KEY, HEALTH_VALUE), SET_OK);
  assert.deepEqual(granted.storage.set(KEY, GRANTED_VALUE), SET_OK);

  assert.deepEqual(health.storage.get(KEY), { ok: true, value: HEALTH_VALUE });
  assert.deepEqual(granted.storage.get(KEY), { ok: true, value: GRANTED_VALUE });

  const healthRead = health.storage.get(KEY);
  if (!healthRead.ok) return;
  assert.notEqual(healthRead.value, GRANTED_VALUE);
  const grantedRead = granted.storage.get(KEY);
  if (!grantedRead.ok) return;
  assert.notEqual(grantedRead.value, HEALTH_VALUE);
});

test('ClearShot get of Health key is scope_denied — not Health value', () => {
  const host = createMiniHost();
  const health = assertMounted(mountHealthMini(host));
  const shot = assertMounted(mountClearShotMini(host));

  assert.deepEqual(health.storage.set(KEY, HEALTH_VALUE), SET_OK);
  const cross = shot.storage.get(KEY);
  assert.deepEqual(cross, SCOPE_DENIED);
  if (cross.ok) return;
  assert.notEqual(cross.code, 'ok');
  assert.deepEqual(shot.storage.set(KEY, SHOT_VALUE), SET_OK);
  assert.deepEqual(health.storage.get(KEY), { ok: true, value: HEALTH_VALUE });
});

test('unmount Health does not wipe test.granted keys; remount Health starts empty', () => {
  const host = createMiniHost();
  const health = assertMounted(mountHealthMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));

  assert.deepEqual(health.storage.set(KEY, HEALTH_VALUE), SET_OK);
  assert.deepEqual(granted.storage.set(KEY, GRANTED_VALUE), SET_OK);

  assert.deepEqual(host.unmount(HEALTH_ID), { ok: true, value: undefined });

  assert.deepEqual(granted.storage.get(KEY), { ok: true, value: GRANTED_VALUE });
  assert.deepEqual(host.call(GRANTED_ID, 'storage', 'get', { key: KEY }), {
    ok: true,
    value: GRANTED_VALUE,
  });
  assert.deepEqual(host.call(HEALTH_ID, 'storage', 'get', { key: KEY }), NOT_MOUNTED);

  const remounted = assertMounted(mountHealthMini(host));
  const leftover = remounted.storage.get(KEY);
  assert.deepEqual(leftover, MISS);
  if (!leftover.ok) return;
  assert.notEqual(leftover.value, HEALTH_VALUE);
  assert.deepEqual(granted.storage.get(KEY), { ok: true, value: GRANTED_VALUE });
});

test('listMounted includes both ids while both live', () => {
  const host = createMiniHost();
  assertMounted(mountHealthMini(host));
  assertMounted(mountTestGrantedMini(host));

  const listed = assertOk(host.listMounted());
  assert.equal(listed.length, 2);
  const ids = listedIds(listed);
  assert.equal(ids.includes(HEALTH_ID), true);
  assert.equal(ids.includes(GRANTED_ID), true);
  assert.equal(ids.includes(CLEARSHOT_ID), false);

  assert.equal(assertOk(host.listMounted(HEALTH_ID)).id, HEALTH_ID);
  assert.equal(assertOk(host.listMounted(GRANTED_ID)).id, GRANTED_ID);
});

test('listMounted includes Health and ClearShot while both live', () => {
  const host = createMiniHost();
  assertMounted(mountHealthMini(host));
  assertMounted(mountClearShotMini(host));

  const listed = assertOk(host.listMounted());
  assert.equal(listed.length, 2);
  const ids = listedIds(listed);
  assert.equal(ids.includes(HEALTH_ID), true);
  assert.equal(ids.includes(CLEARSHOT_ID), true);

  assert.deepEqual(host.unmount(HEALTH_ID), { ok: true, value: undefined });
  const after = assertOk(host.listMounted());
  assert.equal(after.length, 1);
  assert.equal(listedIds(after).includes(CLEARSHOT_ID), true);
  assert.equal(listedIds(after).includes(HEALTH_ID), false);
});

test('known-method envelopes stay .1079–.1091 while both live', () => {
  const host = createMiniHost();
  const health = assertMounted(mountHealthMini(host));
  const shot = assertMounted(mountClearShotMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));

  assert.deepEqual(health.identity.read(), {
    ok: true,
    value: { missionId: null, callSign: null },
  });
  assert.deepEqual(health.billing.read(), SCOPE_DENIED);
  assert.deepEqual(health.photos.read(), SCOPE_DENIED);
  assert.deepEqual(shot.photos.read(), PHOTOS_STUB);
  assert.deepEqual(shot.billing.read(), SCOPE_DENIED);
  assert.deepEqual(shot.storage.get(KEY), SCOPE_DENIED);
  assert.deepEqual(granted.billing.read(), {
    ok: true,
    value: { bundle: 'none', muted: true },
  });
  assert.deepEqual(granted.photos.read(), PHOTOS_STUB);
  assert.deepEqual(host.call(HEALTH_ID, 'identity', 'foo'), UNKNOWN_METHOD);
  assert.deepEqual(host.call(HEALTH_ID, 'billing', 'read'), SCOPE_DENIED);
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
  assert.equal(hop.includes('1092'), false);
  assert.equal(hop.includes('dual-mount'), false);
  assert.equal(hop.includes('l1.health'), false);
});

test('host isolates stores by mount id — unmount drops only that map', () => {
  const src = sourceOf('host.ts');
  assert.equal(src.includes('storeFor(stores, manifest.id)'), true);
  assert.equal(src.includes('stores.delete(id)'), true);
  assert.equal(src.includes('store.clear()'), true);
  assert.equal(src.includes('stores.clear()'), false);
  assert.equal(/from\s+['"][^'"]*stripe/i.test(src), false);
  assert.equal(src.includes('premiumServer'), false);
  assert.equal(src.includes('getUserMedia'), false);
  assert.equal(/android\.provider\.MediaStore/i.test(src), false);
  assert.equal(src.includes('apps/android'), false);
  assert.equal(src.includes('safeStorage'), false);
});
