/**
 * Storage CapResult deny consistency on MiniHost bus fakes.
 *
 * Judge ≠ builder: deny codes and stub-success snapshots are hardcoded
 * here, not read back from production constants. A method that returns
 * `photos_stub` or throws, or a deny that writes the map, would mean
 * the door grew a second shape.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  STORAGE_METHODS,
  type CapResult,
  type StorageCapability,
  type StorageMethod,
} from './types';
import { createStorageFake } from './fakes';
import { createMiniHost } from './host';
import { HEALTH_MINI_MANIFEST, mountHealthMini } from './health';
import { mountClearShotMini } from './clearshot';
import { TEST_BILLING_MANIFEST, mountTestBillingMini } from './billingProbe';
import { TEST_NO_STORAGE_MANIFEST, mountTestNoStorageMini } from './storageProbe';
import { MINI_LAST_SEGMENT_ROUTES, resolveMiniDeeplink } from './deeplink';
import { lookupMini } from '../minis/registry';

const here = import.meta.dirname;

function sourceOf(file: string): string {
  return readFileSync(path.join(here, file), 'utf8');
}

const SCOPE_DENIED: CapResult<never> = { ok: false, code: 'scope_denied' };

function callStorage(storage: StorageCapability, method: StorageMethod): CapResult<unknown> {
  if (method === 'get') return storage.get('note');
  if (method === 'set') return storage.set('note', 'ok');
  return storage.remove('note');
}

function assertMounted<T extends { ok: boolean }>(
  result: T
): asserts result is T & { ok: true } {
  assert.equal(result.ok, true, 'mount must succeed');
}

function assertEveryStorageDenied(storage: StorageCapability, label: string): void {
  for (const method of STORAGE_METHODS) {
    const result = callStorage(storage, method);
    assert.deepEqual(result, SCOPE_DENIED, `${label} ${method} must be scope_denied`);
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.code, 'scope_denied');
    assert.notEqual(result.code, 'photos_stub');
    assert.notEqual(result.code, 'stub');
  }
}

test('closed storage methods are get + set + remove', () => {
  assert.deepEqual([...STORAGE_METHODS], ['get', 'set', 'remove']);
  const fake = createStorageFake(HEALTH_MINI_MANIFEST);
  assert.deepEqual(Object.keys(fake).sort(), [...STORAGE_METHODS].sort());
});

test('test.nostorage: every storage method is scope_denied and does not write', () => {
  const store = new Map<string, string>();
  store.set('note', 'secret');
  const fake = createStorageFake(TEST_NO_STORAGE_MANIFEST, store);
  assertEveryStorageDenied(fake, 'test.nostorage fake');
  assert.equal(store.get('note'), 'secret', 'deny must not write or delete');

  const mounted = mountTestNoStorageMini(createMiniHost());
  assertMounted(mounted);
  assert.equal(mounted.value.manifest.id, 'test.nostorage');
  assertEveryStorageDenied(mounted.value.storage, 'test.nostorage host');
});

test('test.billing: every storage method is scope_denied — not one-id hardcoded', () => {
  const store = new Map<string, string>();
  store.set('note', 'secret');
  const fake = createStorageFake(TEST_BILLING_MANIFEST, store);
  assertEveryStorageDenied(fake, 'test.billing fake');
  assert.equal(store.get('note'), 'secret', 'deny must not write or delete');

  const mounted = mountTestBillingMini(createMiniHost());
  assertMounted(mounted);
  assert.equal(mounted.value.manifest.id, 'test.billing');
  assertEveryStorageDenied(mounted.value.storage, 'test.billing host');
});

test('Health: get, set, and remove are stub success', () => {
  const mounted = mountHealthMini(createMiniHost());
  assertMounted(mounted);
  assert.equal(mounted.value.manifest.id, 'l1.health');
  assert.deepEqual(mounted.value.storage.set('note', 'ok'), { ok: true, value: undefined });
  assert.deepEqual(mounted.value.storage.get('note'), { ok: true, value: 'ok' });
  for (const method of STORAGE_METHODS) {
    const result = callStorage(mounted.value.storage, method);
    assert.equal(result.ok, true, `Health ${method} must stub-succeed`);
  }
});

test('ClearShot: set is stub success; get stays scope_denied', () => {
  const mounted = mountClearShotMini(createMiniHost());
  assertMounted(mounted);
  assert.equal(mounted.value.manifest.id, 'utility.clearshot');
  assert.deepEqual(mounted.value.storage.set('note', 'ok'), { ok: true, value: undefined });
  const read = mounted.value.storage.get('note');
  assert.deepEqual(read, SCOPE_DENIED);
  assert.deepEqual(mounted.value.storage.remove('note'), { ok: true, value: undefined });
  assert.equal(read.ok, false);
  if (read.ok) return;
  assert.equal(read.code, 'scope_denied');
  assert.notEqual(read.code, 'photos_stub');
  assert.notEqual(read.code, 'stub');
});

test('test.nostorage is not a product mount — unknown to deeplink and registry', () => {
  assert.equal(Object.hasOwn(MINI_LAST_SEGMENT_ROUTES, 'nostorage'), false);
  assert.deepEqual(resolveMiniDeeplink('mission://minis/nostorage'), {
    ok: false,
    code: 'unknown_mini',
  });
  assert.deepEqual(lookupMini('test.nostorage'), { ok: false, code: 'unknown_mini' });
  assert.equal(TEST_NO_STORAGE_MANIFEST.id, 'test.nostorage');
  assert.notEqual(TEST_NO_STORAGE_MANIFEST.id, 'utility.clearshot');
  assert.notEqual(TEST_NO_STORAGE_MANIFEST.id, 'l1.health');
  assert.equal(TEST_NO_STORAGE_MANIFEST.scopes.includes('storage.read'), false);
  assert.equal(TEST_NO_STORAGE_MANIFEST.scopes.includes('storage.write'), false);
});

test('storage fakes never import safeStorage, localStorage, Stripe, camera, or Android', () => {
  for (const file of [
    'fakes.ts',
    'storageProbe.ts',
    'types.ts',
    'host.ts',
    'health.ts',
    'clearshot.ts',
  ]) {
    const src = sourceOf(file);
    assert.equal(src.includes('safeStorage'), false, `${file} must not import safeStorage`);
    assert.equal(src.includes('localStorage'), false, `${file} must not call localStorage`);
    assert.equal(/from\s+['"][^'"]*stripe/i.test(src), false, `${file} must not import Stripe`);
    assert.equal(src.includes('premiumServer'), false, `${file} must not import premiumServer`);
    assert.equal(src.includes('getUserMedia'), false, `${file} must not open a camera`);
    assert.equal(/android\.provider\.MediaStore/i.test(src), false, `${file} must not import MediaStore`);
    assert.equal(src.includes('apps/android'), false, `${file} must not wire Android`);
  }
});
