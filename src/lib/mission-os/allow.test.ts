/**
 * CapResult allow-path consistency on MiniHost bus fakes.
 *
 * Judge ≠ builder: granted envelopes are hardcoded here, not read back
 * from production constants. A method that returns `scope_denied` when
 * the mini declared the door, or photos that flip to `ok: true`, would
 * mean the door grew a second shape.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  BILLING_METHODS,
  IDENTITY_METHODS,
  PHOTOS_METHODS,
  STORAGE_METHODS,
  type BillingCapability,
  type BillingMethod,
  type CapResult,
  type IdentityCapability,
  type IdentityMethod,
  type PhotosCapability,
  type PhotosMethod,
  type StorageCapability,
  type StorageMethod,
} from './types';
import {
  createBillingFake,
  createIdentityFake,
  createPhotosFake,
  createStorageFake,
} from './fakes';
import { createMiniHost } from './host';
import { mountHealthMini } from './health';
import { mountClearShotMini } from './clearshot';
import { mountTestBillingMini } from './billingProbe';
import { TEST_GRANTED_MANIFEST, mountTestGrantedMini } from './allowProbe';
import { MINI_LAST_SEGMENT_ROUTES, resolveMiniDeeplink } from './deeplink';
import { lookupMini } from '../minis/registry';

const here = import.meta.dirname;

function sourceOf(file: string): string {
  return readFileSync(path.join(here, file), 'utf8');
}

const GUEST_STUB: CapResult<{ missionId: null; callSign: null }> = {
  ok: true,
  value: { missionId: null, callSign: null },
};
const MUTED_READ: CapResult<{ bundle: 'none'; muted: true }> = {
  ok: true,
  value: { bundle: 'none', muted: true },
};
const BILLING_HOLD: CapResult<{ held: true }> = { ok: true, value: { held: true } };
const PHOTOS_STUB: CapResult<never> = { ok: false, code: 'photos_stub' };
const STORAGE_SET_OK: CapResult<void> = { ok: true, value: undefined };

function callIdentity(identity: IdentityCapability, method: IdentityMethod): CapResult<unknown> {
  return identity[method]();
}

function callBilling(billing: BillingCapability, method: BillingMethod): CapResult<unknown> {
  return billing[method]();
}

function callPhotos(photos: PhotosCapability, method: PhotosMethod): CapResult<unknown> {
  return photos[method]();
}

function callStorage(storage: StorageCapability, method: StorageMethod): CapResult<unknown> {
  return method === 'get' ? storage.get('note') : storage.set('note', 'ok');
}

function assertMounted<T extends { ok: boolean }>(
  result: T
): asserts result is T & { ok: true } {
  assert.equal(result.ok, true, 'mount must succeed');
}

test('closed methods stay identity.read, billing trio, photos pair, storage pair', () => {
  assert.deepEqual([...IDENTITY_METHODS], ['read']);
  assert.deepEqual([...BILLING_METHODS], ['read', 'checkout', 'portal']);
  assert.deepEqual([...PHOTOS_METHODS], ['read', 'write']);
  assert.deepEqual([...STORAGE_METHODS], ['get', 'set']);

  const identity = createIdentityFake(TEST_GRANTED_MANIFEST);
  const billing = createBillingFake(TEST_GRANTED_MANIFEST);
  const photos = createPhotosFake(TEST_GRANTED_MANIFEST);
  const storage = createStorageFake(TEST_GRANTED_MANIFEST);
  assert.deepEqual(Object.keys(identity).sort(), [...IDENTITY_METHODS].sort());
  assert.deepEqual(Object.keys(billing).sort(), [...BILLING_METHODS].sort());
  assert.deepEqual(Object.keys(photos).sort(), [...PHOTOS_METHODS].sort());
  assert.deepEqual(Object.keys(storage).sort(), [...STORAGE_METHODS].sort());
});

test('test.granted: every identity method is the guest stub envelope', () => {
  const mounted = mountTestGrantedMini(createMiniHost());
  assertMounted(mounted);
  assert.equal(mounted.value.manifest.id, 'test.granted');
  for (const method of IDENTITY_METHODS) {
    const result = callIdentity(mounted.value.identity, method);
    assert.deepEqual(result, GUEST_STUB, `${method} must stub-succeed when granted`);
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.notEqual(result.value, undefined);
  }
});

test('test.granted: every billing method is the muted / held stub', () => {
  const mounted = mountTestGrantedMini(createMiniHost());
  assertMounted(mounted);
  assert.deepEqual(mounted.value.billing.read(), MUTED_READ);
  assert.deepEqual(mounted.value.billing.checkout(), BILLING_HOLD);
  assert.deepEqual(mounted.value.billing.portal(), BILLING_HOLD);
  for (const method of BILLING_METHODS) {
    const result = callBilling(mounted.value.billing, method);
    assert.equal(result.ok, true, `${method} must stub-succeed when granted`);
  }
});

test('test.granted: every photos method stays photos_stub — not ok: true', () => {
  const mounted = mountTestGrantedMini(createMiniHost());
  assertMounted(mounted);
  for (const method of PHOTOS_METHODS) {
    const result = callPhotos(mounted.value.photos, method);
    assert.deepEqual(result, PHOTOS_STUB, `${method} must stay photos_stub`);
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.code, 'photos_stub');
    assert.notEqual(result.code, 'scope_denied');
    assert.notEqual(result.code, 'stub');
  }
});

test('test.granted: every storage method is stub success on the in-memory map', () => {
  const mounted = mountTestGrantedMini(createMiniHost());
  assertMounted(mounted);
  assert.deepEqual(mounted.value.storage.set('note', 'ok'), STORAGE_SET_OK);
  assert.deepEqual(mounted.value.storage.get('note'), { ok: true, value: 'ok' });
  for (const method of STORAGE_METHODS) {
    const result = callStorage(mounted.value.storage, method);
    assert.equal(result.ok, true, `${method} must stub-succeed when granted`);
  }
});

test('Health: granted identity + storage stay stub success', () => {
  const mounted = mountHealthMini(createMiniHost());
  assertMounted(mounted);
  assert.equal(mounted.value.manifest.id, 'l1.health');
  for (const method of IDENTITY_METHODS) {
    assert.deepEqual(callIdentity(mounted.value.identity, method), GUEST_STUB);
  }
  assert.deepEqual(mounted.value.storage.set('note', 'ok'), STORAGE_SET_OK);
  assert.deepEqual(mounted.value.storage.get('note'), { ok: true, value: 'ok' });
  for (const method of STORAGE_METHODS) {
    assert.equal(callStorage(mounted.value.storage, method).ok, true);
  }
});

test('ClearShot: granted identity + photos_stub + storage.write stay existing stubs', () => {
  const mounted = mountClearShotMini(createMiniHost());
  assertMounted(mounted);
  assert.equal(mounted.value.manifest.id, 'utility.clearshot');
  for (const method of IDENTITY_METHODS) {
    assert.deepEqual(callIdentity(mounted.value.identity, method), GUEST_STUB);
  }
  for (const method of PHOTOS_METHODS) {
    assert.deepEqual(callPhotos(mounted.value.photos, method), PHOTOS_STUB);
  }
  assert.deepEqual(mounted.value.storage.set('note', 'ok'), STORAGE_SET_OK);
});

test('test.billing: granted billing methods stay the muted / held stub', () => {
  const mounted = mountTestBillingMini(createMiniHost());
  assertMounted(mounted);
  assert.deepEqual(mounted.value.billing.read(), MUTED_READ);
  assert.deepEqual(mounted.value.billing.checkout(), BILLING_HOLD);
  assert.deepEqual(mounted.value.billing.portal(), BILLING_HOLD);
  for (const method of BILLING_METHODS) {
    assert.equal(callBilling(mounted.value.billing, method).ok, true);
  }
});

test('granted identity injects the snapshot — nothing is minted', () => {
  const host = createMiniHost({ identity: { missionId: 7, callSign: '07' } });
  const granted = mountTestGrantedMini(host);
  assertMounted(granted);
  const injected: CapResult<{ missionId: number; callSign: string }> = {
    ok: true,
    value: { missionId: 7, callSign: '07' },
  };
  for (const method of IDENTITY_METHODS) {
    assert.deepEqual(callIdentity(granted.value.identity, method), injected);
  }
});

test('test.granted is not a product mount — unknown to deeplink and registry', () => {
  assert.equal(Object.hasOwn(MINI_LAST_SEGMENT_ROUTES, 'granted'), false);
  assert.deepEqual(resolveMiniDeeplink('mission://minis/granted'), {
    ok: false,
    code: 'unknown_mini',
  });
  assert.deepEqual(lookupMini('test.granted'), { ok: false, code: 'unknown_mini' });
  assert.equal(TEST_GRANTED_MANIFEST.id, 'test.granted');
  assert.equal(TEST_GRANTED_MANIFEST.scopes.includes('identity.read'), true);
  assert.equal(TEST_GRANTED_MANIFEST.scopes.includes('billing.read'), true);
  assert.equal(TEST_GRANTED_MANIFEST.scopes.includes('photos.read'), true);
  assert.equal(TEST_GRANTED_MANIFEST.scopes.includes('photos.write'), true);
  assert.equal(TEST_GRANTED_MANIFEST.scopes.includes('storage.read'), true);
  assert.equal(TEST_GRANTED_MANIFEST.scopes.includes('storage.write'), true);
  assert.notEqual(TEST_GRANTED_MANIFEST.id, 'utility.clearshot');
  assert.notEqual(TEST_GRANTED_MANIFEST.id, 'l1.health');
  assert.notEqual(TEST_GRANTED_MANIFEST.id, 'test.billing');
  assert.notEqual(TEST_GRANTED_MANIFEST.id, 'test.noidentity');
});

test('allow-path fakes never import Stripe, camera, Supabase, or Android', () => {
  for (const file of ['fakes.ts', 'allowProbe.ts', 'types.ts', 'host.ts']) {
    const src = sourceOf(file);
    assert.equal(/from\s+['"][^'"]*stripe/i.test(src), false, `${file} must not import Stripe`);
    assert.equal(src.includes('premiumServer'), false, `${file} must not import premiumServer`);
    assert.equal(/checkout\.sessions/i.test(src), false, `${file} must not open checkout`);
    assert.equal(src.includes('stripe.com'), false, `${file} must not name stripe.com`);
    assert.equal(src.includes('STRIPE'), false, `${file} must not name Stripe keys`);
    assert.equal(/from\s+['"][^'"]*supabase/i.test(src), false, `${file} must not import supabase`);
    assert.equal(src.includes('createClient'), false, `${file} must not open a Supabase client`);
    assert.equal(src.includes('getUserMedia'), false, `${file} must not open a camera`);
    assert.equal(/android\.provider\.MediaStore/i.test(src), false, `${file} must not import MediaStore`);
    assert.equal(src.includes('apps/android'), false, `${file} must not wire Android`);
    assert.equal(src.includes('safeStorage'), false, `${file} must not import safeStorage`);
    assert.equal(src.includes('localStorage'), false, `${file} must not call localStorage`);
  }
});
