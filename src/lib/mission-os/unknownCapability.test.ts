/**
 * CapResult unknown_capability — closed door set consistency.
 *
 * Judge ≠ builder: deny codes are hardcoded here, not read back from
 * production constants. A fifth door name that returns scope_denied,
 * unknown_method, not_mounted, throws, or undefined would mean the
 * bus grew a silent extra door.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createMiniHost } from './host';
import { mountHealthMini } from './health';
import { mountClearShotMini } from './clearshot';
import { mountTestGrantedMini } from './allowProbe';
import { mountTestNoIdentityMini } from './identityProbe';
import { callDoor, callMountedDoor, isMissionOsDoor } from './call';
import { MISSION_OS_CAPABILITIES, type CapResult, type MountedMini } from './types';

const here = import.meta.dirname;

function sourceOf(file: string): string {
  return readFileSync(path.join(here, file), 'utf8');
}

const UNKNOWN_CAPABILITY: CapResult<never> = { ok: false, code: 'unknown_capability' };
const SCOPE_DENIED: CapResult<never> = { ok: false, code: 'scope_denied' };
const UNKNOWN_METHOD: CapResult<never> = { ok: false, code: 'unknown_method' };
const NOT_MOUNTED: CapResult<never> = { ok: false, code: 'not_mounted' };
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

const HEALTH_ID = 'l1.health';
const CLEARSHOT_ID = 'utility.clearshot';
const GRANTED_ID = 'test.granted';
const NEVER_MOUNTED_ID = 'never.mounted';

/** Hardcoded unknown door names — not read from production. */
const UNKNOWN_DOORS = ['camera', 'health', 'location', 'foo', '', 'identity.read'] as const;

function assertMounted(result: CapResult<MountedMini>): MountedMini {
  assert.equal(result.ok, true, 'mount must succeed');
  if (!result.ok) throw new Error('unreachable');
  return result.value;
}

function assertUnknownCapability(result: CapResult<unknown>, label: string): void {
  assert.deepEqual(result, UNKNOWN_CAPABILITY, label);
  assert.equal(result.ok, false, label);
  if (result.ok) return;
  assert.equal(result.code, 'unknown_capability', label);
  assert.notEqual(result.code, 'scope_denied', label);
  assert.notEqual(result.code, 'unknown_method', label);
  assert.notEqual(result.code, 'not_mounted', label);
  assert.notEqual(result.code, 'unknown_mini', label);
  assert.notEqual(result.code, 'stub', label);
  assert.notEqual(result.code, 'photos_stub', label);
}

test('closed door set stays identity, billing, photos, storage', () => {
  assert.deepEqual([...MISSION_OS_CAPABILITIES], ['identity', 'billing', 'photos', 'storage']);
  for (const door of MISSION_OS_CAPABILITIES) {
    assert.equal(isMissionOsDoor(door), true, door);
  }
  for (const door of UNKNOWN_DOORS) {
    assert.equal(isMissionOsDoor(door), false, door);
  }
});

test('mounted granted: unknown door names are unknown_capability and do not throw', () => {
  const host = createMiniHost();
  const mounted = assertMounted(mountTestGrantedMini(host));
  for (const door of UNKNOWN_DOORS) {
    let threw = false;
    let refused: CapResult<unknown> | undefined;
    try {
      refused = callDoor(mounted, door, 'read');
    } catch {
      threw = true;
    }
    assert.equal(threw, false, `${door} must not throw`);
    assertUnknownCapability(refused as CapResult<unknown>, `callDoor ${door}`);
    assertUnknownCapability(host.call(GRANTED_ID, door, 'read'), `host.call ${door}`);
  }
});

test('Health and ClearShot: unknown door is unknown_capability, not scope_denied', () => {
  const healthHost = createMiniHost();
  const health = assertMounted(mountHealthMini(healthHost));
  assert.equal(health.manifest.id, HEALTH_ID);
  assertUnknownCapability(callDoor(health, 'camera', 'read'), 'health camera');
  assertUnknownCapability(healthHost.call(HEALTH_ID, 'health', 'write'), 'health health.write');
  assert.deepEqual(healthHost.call(HEALTH_ID, 'billing', 'read'), SCOPE_DENIED);
  assert.deepEqual(healthHost.call(HEALTH_ID, 'photos', 'read'), SCOPE_DENIED);

  const shotHost = createMiniHost();
  const shot = assertMounted(mountClearShotMini(shotHost));
  assert.equal(shot.manifest.id, CLEARSHOT_ID);
  assertUnknownCapability(callDoor(shot, 'location', 'read'), 'clearshot location');
  assertUnknownCapability(shotHost.call(CLEARSHOT_ID, 'foo', 'write'), 'clearshot foo');
  assert.deepEqual(shotHost.call(CLEARSHOT_ID, 'billing', 'checkout'), SCOPE_DENIED);
});

test('unknown door is not unknown_method and is not scope_denied', () => {
  const noIdentity = assertMounted(mountTestNoIdentityMini(createMiniHost()));
  assert.deepEqual(callDoor(noIdentity, 'identity', 'read'), SCOPE_DENIED);
  assert.deepEqual(callDoor(noIdentity, 'identity', 'foo'), SCOPE_DENIED);
  assertUnknownCapability(callDoor(noIdentity, 'camera', 'read'), 'noidentity camera');
  assertUnknownCapability(callDoor(noIdentity, 'identity.read', 'read'), 'scope-shaped door');

  const granted = assertMounted(mountTestGrantedMini(createMiniHost()));
  assert.deepEqual(callDoor(granted, 'identity', 'foo'), UNKNOWN_METHOD);
  assert.deepEqual(callDoor(granted, 'billing', 'cancel'), UNKNOWN_METHOD);
  assert.deepEqual(callDoor(granted, 'photos', 'delete'), UNKNOWN_METHOD);
  assert.deepEqual(callDoor(granted, 'storage', 'clear'), UNKNOWN_METHOD);
  assertUnknownCapability(callDoor(granted, 'camera', 'foo'), 'granted camera.foo');
});

test('unmounted id stays not_mounted even when the door is unknown', () => {
  const host = createMiniHost();
  assert.deepEqual(host.call(HEALTH_ID, 'camera', 'read'), NOT_MOUNTED);
  assert.deepEqual(host.call(NEVER_MOUNTED_ID, 'foo', 'read'), NOT_MOUNTED);
  assert.deepEqual(callMountedDoor(new Map(), HEALTH_ID, 'camera', 'read'), NOT_MOUNTED);
  assert.deepEqual(host.listMounted(), { ok: true, value: [] });
});

test('unknown door does not write storage and does not auto-mount', () => {
  const host = createMiniHost();
  const granted = assertMounted(mountTestGrantedMini(host));
  assert.deepEqual(granted.storage.set('note', 'ok'), STORAGE_SET_OK);
  assert.deepEqual(granted.storage.get('note'), { ok: true, value: 'ok' });
  assertUnknownCapability(host.call(GRANTED_ID, 'camera', 'set', { key: 'note', value: 'leak' }), 'camera set');
  assert.deepEqual(granted.storage.get('note'), { ok: true, value: 'ok' });
  assert.deepEqual(host.listMounted(GRANTED_ID).ok, true);
  assert.deepEqual(host.call(CLEARSHOT_ID, 'camera', 'read'), NOT_MOUNTED);
  assert.deepEqual(host.listMounted(CLEARSHOT_ID), { ok: false, code: 'unknown_mini' });
});

test('known methods keep .1079–.1095 envelopes through call / callDoor', () => {
  const host = createMiniHost();
  assertMounted(mountTestGrantedMini(host));
  assert.deepEqual(host.call(GRANTED_ID, 'identity', 'read'), GUEST_STUB);
  assert.deepEqual(host.call(GRANTED_ID, 'billing', 'read'), MUTED_READ);
  assert.deepEqual(host.call(GRANTED_ID, 'billing', 'checkout'), BILLING_HOLD);
  assert.deepEqual(host.call(GRANTED_ID, 'billing', 'portal'), BILLING_HOLD);
  assert.deepEqual(host.call(GRANTED_ID, 'photos', 'read'), PHOTOS_STUB);
  assert.deepEqual(host.call(GRANTED_ID, 'photos', 'write'), PHOTOS_STUB);
  assert.deepEqual(host.call(GRANTED_ID, 'storage', 'set'), STORAGE_SET_OK);
  assert.deepEqual(host.call(GRANTED_ID, 'storage', 'get'), { ok: true, value: 'ok' });

  const healthHost = createMiniHost();
  assertMounted(mountHealthMini(healthHost));
  assert.deepEqual(healthHost.call(HEALTH_ID, 'identity', 'read'), GUEST_STUB);
  assert.deepEqual(healthHost.call(HEALTH_ID, 'billing', 'read'), SCOPE_DENIED);
  assert.deepEqual(healthHost.call(HEALTH_ID, 'photos', 'read'), SCOPE_DENIED);
  assert.deepEqual(healthHost.call(HEALTH_ID, 'storage', 'set'), STORAGE_SET_OK);

  const shotHost = createMiniHost();
  assertMounted(mountClearShotMini(shotHost));
  assert.deepEqual(shotHost.call(CLEARSHOT_ID, 'photos', 'write'), PHOTOS_STUB);
  assert.deepEqual(shotHost.call(CLEARSHOT_ID, 'storage', 'get'), SCOPE_DENIED);
  assert.deepEqual(shotHost.call(CLEARSHOT_ID, 'billing', 'checkout'), SCOPE_DENIED);
});

test('unknown-capability dispatch never imports Stripe, camera, Supabase, or Android', () => {
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

  const callSrc = sourceOf('call.ts');
  assert.equal(callSrc.includes("code: 'unknown_capability'"), true);
  assert.equal(callSrc.includes('isMissionOsDoor'), true);
});
