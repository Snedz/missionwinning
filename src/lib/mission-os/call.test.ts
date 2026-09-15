/**
 * CapResult unknown-method consistency on MiniHost bus fakes.
 *
 * Judge ≠ builder: deny codes are hardcoded here, not read back from
 * production constants. A declared-door unknown that returns
 * `scope_denied`, throws, or `undefined` would mean the door grew a
 * second shape. An undeclared-door unknown that returns
 * `unknown_method` would invert deny-before-unknown.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  BILLING_METHODS,
  IDENTITY_METHODS,
  MISSION_OS_CAPABILITIES,
  PHOTOS_METHODS,
  STORAGE_METHODS,
  type CapResult,
  type MountedMini,
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
import { mountTestNoIdentityMini } from './identityProbe';
import { TEST_NO_STORAGE_MANIFEST, mountTestNoStorageMini } from './storageProbe';
import { TEST_GRANTED_MANIFEST, mountTestGrantedMini } from './allowProbe';
import { callDoor, doorIsDeclared, type MissionOsDoor } from './call';

const here = import.meta.dirname;

function sourceOf(file: string): string {
  return readFileSync(path.join(here, file), 'utf8');
}

const UNKNOWN_METHOD: CapResult<never> = { ok: false, code: 'unknown_method' };
const SCOPE_DENIED: CapResult<never> = { ok: false, code: 'scope_denied' };
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

/** Hardcoded unknown names — not read from production. */
const UNKNOWN: Record<MissionOsDoor, string> = {
  identity: 'foo',
  billing: 'cancel',
  photos: 'delete',
  storage: 'clear',
};

function assertMounted<T extends { ok: boolean }>(
  result: T
): asserts result is T & { ok: true } {
  assert.equal(result.ok, true, 'mount must succeed');
}

function bindFakes(
  manifest: MountedMini['manifest'],
  store: Map<string, string> = new Map()
): MountedMini {
  return {
    manifest,
    identity: createIdentityFake(manifest),
    billing: createBillingFake(manifest),
    photos: createPhotosFake(manifest),
    storage: createStorageFake(manifest, store),
  };
}

function assertCapResult(result: CapResult<unknown>): void {
  assert.notEqual(result, undefined);
  assert.equal(typeof result, 'object');
  assert.equal(typeof result.ok, 'boolean');
}

test('closed methods stay identity.read, billing trio, photos pair, storage pair', () => {
  assert.deepEqual([...IDENTITY_METHODS], ['read']);
  assert.deepEqual([...BILLING_METHODS], ['read', 'checkout', 'portal']);
  assert.deepEqual([...PHOTOS_METHODS], ['read', 'write']);
  assert.deepEqual([...STORAGE_METHODS], ['get', 'set']);
  assert.deepEqual([...MISSION_OS_CAPABILITIES], ['identity', 'billing', 'photos', 'storage']);
});

test('test.granted: unknown method on every declared door is unknown_method', () => {
  const mounted = mountTestGrantedMini(createMiniHost());
  assertMounted(mounted);
  for (const door of MISSION_OS_CAPABILITIES) {
    const result = callDoor(mounted.value, door, UNKNOWN[door]);
    assertCapResult(result);
    assert.deepEqual(result, UNKNOWN_METHOD, `${door}.${UNKNOWN[door]} must be unknown_method`);
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.code, 'unknown_method');
    assert.notEqual(result.code, 'scope_denied');
    assert.notEqual(result.code, 'photos_stub');
    assert.notEqual(result.code, 'stub');
  }
});

test('Health: declared identity/storage unknown is unknown_method; billing/photos stay scope_denied', () => {
  const mounted = mountHealthMini(createMiniHost());
  assertMounted(mounted);
  assert.equal(mounted.value.manifest.id, 'l1.health');
  assert.equal(doorIsDeclared(mounted.value.manifest, 'identity'), true);
  assert.equal(doorIsDeclared(mounted.value.manifest, 'storage'), true);
  assert.equal(doorIsDeclared(mounted.value.manifest, 'billing'), false);
  assert.equal(doorIsDeclared(mounted.value.manifest, 'photos'), false);

  assert.deepEqual(callDoor(mounted.value, 'identity', 'foo'), UNKNOWN_METHOD);
  assert.deepEqual(callDoor(mounted.value, 'storage', 'clear'), UNKNOWN_METHOD);
  assert.deepEqual(callDoor(mounted.value, 'billing', 'cancel'), SCOPE_DENIED);
  assert.deepEqual(callDoor(mounted.value, 'photos', 'delete'), SCOPE_DENIED);
});

test('ClearShot: declared identity/photos/storage unknown is unknown_method; billing stays scope_denied', () => {
  const mounted = mountClearShotMini(createMiniHost());
  assertMounted(mounted);
  assert.equal(mounted.value.manifest.id, 'utility.clearshot');
  assert.equal(doorIsDeclared(mounted.value.manifest, 'identity'), true);
  assert.equal(doorIsDeclared(mounted.value.manifest, 'photos'), true);
  assert.equal(doorIsDeclared(mounted.value.manifest, 'storage'), true);
  assert.equal(doorIsDeclared(mounted.value.manifest, 'billing'), false);

  assert.deepEqual(callDoor(mounted.value, 'identity', 'foo'), UNKNOWN_METHOD);
  assert.deepEqual(callDoor(mounted.value, 'photos', 'delete'), UNKNOWN_METHOD);
  assert.deepEqual(callDoor(mounted.value, 'storage', 'clear'), UNKNOWN_METHOD);
  assert.deepEqual(callDoor(mounted.value, 'billing', 'cancel'), SCOPE_DENIED);
});

test('undeclared door: unknown method is still scope_denied — deny-before-unknown', () => {
  const noIdentity = mountTestNoIdentityMini(createMiniHost());
  assertMounted(noIdentity);
  assert.deepEqual(callDoor(noIdentity.value, 'identity', 'foo'), SCOPE_DENIED);
  assert.equal(noIdentity.value.manifest.scopes.includes('identity.read'), false);
  assert.deepEqual(callDoor(noIdentity.value, 'storage', 'clear'), UNKNOWN_METHOD);

  const noStorage = mountTestNoStorageMini(createMiniHost());
  assertMounted(noStorage);
  assert.deepEqual(callDoor(noStorage.value, 'storage', 'clear'), SCOPE_DENIED);
  assert.deepEqual(callDoor(noStorage.value, 'identity', 'foo'), UNKNOWN_METHOD);

  const billingOnly = mountTestBillingMini(createMiniHost());
  assertMounted(billingOnly);
  assert.deepEqual(callDoor(billingOnly.value, 'identity', 'foo'), SCOPE_DENIED);
  assert.deepEqual(callDoor(billingOnly.value, 'photos', 'delete'), SCOPE_DENIED);
  assert.deepEqual(callDoor(billingOnly.value, 'storage', 'clear'), SCOPE_DENIED);
  assert.deepEqual(callDoor(billingOnly.value, 'billing', 'cancel'), UNKNOWN_METHOD);
});

test('known methods keep .1079–.1084 envelopes through callDoor', () => {
  const granted = mountTestGrantedMini(createMiniHost());
  assertMounted(granted);
  assert.deepEqual(callDoor(granted.value, 'identity', 'read'), GUEST_STUB);
  assert.deepEqual(callDoor(granted.value, 'billing', 'read'), MUTED_READ);
  assert.deepEqual(callDoor(granted.value, 'billing', 'checkout'), BILLING_HOLD);
  assert.deepEqual(callDoor(granted.value, 'billing', 'portal'), BILLING_HOLD);
  assert.deepEqual(callDoor(granted.value, 'photos', 'read'), PHOTOS_STUB);
  assert.deepEqual(callDoor(granted.value, 'photos', 'write'), PHOTOS_STUB);
  assert.deepEqual(callDoor(granted.value, 'storage', 'set'), STORAGE_SET_OK);
  assert.deepEqual(callDoor(granted.value, 'storage', 'get'), { ok: true, value: 'ok' });

  const health = mountHealthMini(createMiniHost());
  assertMounted(health);
  assert.deepEqual(callDoor(health.value, 'identity', 'read'), GUEST_STUB);
  assert.deepEqual(callDoor(health.value, 'billing', 'read'), SCOPE_DENIED);
  assert.deepEqual(callDoor(health.value, 'photos', 'read'), SCOPE_DENIED);
  assert.deepEqual(callDoor(health.value, 'storage', 'set'), STORAGE_SET_OK);
  assert.deepEqual(callDoor(health.value, 'storage', 'get'), { ok: true, value: 'ok' });

  const shot = mountClearShotMini(createMiniHost());
  assertMounted(shot);
  assert.deepEqual(callDoor(shot.value, 'photos', 'write'), PHOTOS_STUB);
  assert.deepEqual(callDoor(shot.value, 'storage', 'set'), STORAGE_SET_OK);
  assert.deepEqual(callDoor(shot.value, 'storage', 'get'), SCOPE_DENIED);
  assert.deepEqual(callDoor(shot.value, 'billing', 'checkout'), SCOPE_DENIED);
});

test('unknown storage method does not write the map — declared or not', () => {
  const grantedStore = new Map<string, string>();
  const granted = bindFakes(TEST_GRANTED_MANIFEST, grantedStore);
  assert.deepEqual(callDoor(granted, 'storage', 'set'), STORAGE_SET_OK);
  assert.equal(grantedStore.get('note'), 'ok');
  assert.deepEqual(callDoor(granted, 'storage', 'clear'), UNKNOWN_METHOD);
  assert.equal(grantedStore.get('note'), 'ok', 'unknown clear must not wipe a declared store');

  const deniedStore = new Map<string, string>();
  const denied = bindFakes(TEST_NO_STORAGE_MANIFEST, deniedStore);
  assert.deepEqual(callDoor(denied, 'storage', 'clear'), SCOPE_DENIED);
  assert.equal(deniedStore.size, 0, 'undeclared unknown must not write');
  assert.deepEqual(callDoor(denied, 'storage', 'set'), SCOPE_DENIED);
  assert.equal(deniedStore.size, 0);
});

test('unknown method never throws and never returns undefined', () => {
  const mounted = mountTestGrantedMini(createMiniHost());
  assertMounted(mounted);
  for (const door of MISSION_OS_CAPABILITIES) {
    let result: CapResult<unknown> | undefined;
    assert.doesNotThrow(() => {
      result = callDoor(mounted.value, door, UNKNOWN[door]);
    });
    assert.notEqual(result, undefined);
    assertCapResult(result as CapResult<unknown>);
    assert.deepEqual(result, UNKNOWN_METHOD);
  }

  const health = mountHealthMini(createMiniHost());
  assertMounted(health);
  let denied: CapResult<unknown> | undefined;
  assert.doesNotThrow(() => {
    denied = callDoor(health.value, 'billing', 'cancel');
  });
  assert.deepEqual(denied, SCOPE_DENIED);
});

test('unknown-method dispatch never imports Stripe, camera, Supabase, or Android', () => {
  for (const file of ['call.ts', 'fakes.ts', 'types.ts', 'host.ts']) {
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
