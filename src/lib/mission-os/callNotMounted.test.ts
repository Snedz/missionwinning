/**
 * Capability call for an id that is not currently mounted is not_mounted.
 *
 * Judge ≠ builder: deny codes are hardcoded here, not read back from
 * production constants. A refuse that throws, auto-mounts, or reuses
 * unknown_mini would mean the host grew a silent lifecycle lie.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createMiniHost } from './host';
import { mountHealthMini } from './health';
import { mountClearShotMini } from './clearshot';
import { mountTestGrantedMini } from './allowProbe';
import { callMountedDoor } from './call';
import {
  MISSION_OS_CAPABILITIES,
  type CapResult,
  type MissionOsDoor,
  type MountedMini,
} from './types';

const here = import.meta.dirname;

function sourceOf(file: string): string {
  return readFileSync(path.join(here, file), 'utf8');
}

const NOT_MOUNTED: CapResult<never> = { ok: false, code: 'not_mounted' };
const UNKNOWN: CapResult<never> = { ok: false, code: 'unknown_mini' };
const ALREADY_MOUNTED: CapResult<never> = { ok: false, code: 'already_mounted' };
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

const NEVER_MOUNTED_ID = 'never.mounted';
const HEALTH_ID = 'l1.health';
const CLEARSHOT_ID = 'utility.clearshot';
const GRANTED_ID = 'test.granted';

/** Known methods — hardcoded, not imported from production closed sets. */
const KNOWN: ReadonlyArray<{ door: MissionOsDoor; method: string }> = [
  { door: 'identity', method: 'read' },
  { door: 'billing', method: 'read' },
  { door: 'billing', method: 'checkout' },
  { door: 'billing', method: 'portal' },
  { door: 'photos', method: 'read' },
  { door: 'photos', method: 'write' },
  { door: 'storage', method: 'get' },
  { door: 'storage', method: 'set' },
];

function assertMounted(result: CapResult<MountedMini>): MountedMini {
  assert.equal(result.ok, true, 'mount must succeed');
  if (!result.ok) throw new Error('unreachable');
  return result.value;
}

function assertNotMounted(result: CapResult<unknown>, label: string): void {
  assert.deepEqual(result, NOT_MOUNTED, label);
  assert.equal(result.ok, false, label);
  if (result.ok) return;
  assert.equal(result.code, 'not_mounted', label);
  assert.notEqual(result.code, 'unknown_mini', label);
  assert.notEqual(result.code, 'already_mounted', label);
  assert.notEqual(result.code, 'scope_denied', label);
  assert.notEqual(result.code, 'unknown_method', label);
  assert.notEqual(result.code, 'stub', label);
}

test('after no mounts, call known methods is not_mounted and does not throw', () => {
  const host = createMiniHost();
  for (const { door, method } of KNOWN) {
    let threw = false;
    let refused: CapResult<unknown> | undefined;
    try {
      refused = host.call(HEALTH_ID, door, method);
    } catch {
      threw = true;
    }
    assert.equal(threw, false, `${door}.${method} must not throw`);
    assertNotMounted(refused as CapResult<unknown>, `${door}.${method}`);
  }

  assert.deepEqual(host.call(NEVER_MOUNTED_ID, 'identity', 'read'), NOT_MOUNTED);
  assert.deepEqual(host.call(NEVER_MOUNTED_ID, 'storage', 'get'), NOT_MOUNTED);
  assert.deepEqual(host.call(CLEARSHOT_ID, 'photos', 'read'), NOT_MOUNTED);
  assert.deepEqual(host.listMounted(), { ok: true, value: [] });
});

test('call of an unmounted id does not auto-mount', () => {
  const host = createMiniHost();
  assert.deepEqual(host.call(HEALTH_ID, 'identity', 'read'), NOT_MOUNTED);
  assert.deepEqual(host.call(HEALTH_ID, 'storage', 'set', { key: 'note', value: 'leak' }), NOT_MOUNTED);
  assert.deepEqual(host.listMounted(), { ok: true, value: [] });
  assert.deepEqual(host.listMounted(HEALTH_ID), UNKNOWN);
  assert.deepEqual(host.unmount(HEALTH_ID), NOT_MOUNTED);

  const first = assertMounted(mountHealthMini(host));
  assert.deepEqual(first.storage.get('note'), { ok: true, value: undefined });
  assert.deepEqual(first.storage.get('leak'), { ok: true, value: undefined });
});

test('after unmount, call is not_mounted again', () => {
  const host = createMiniHost();
  assertMounted(mountHealthMini(host));
  assert.deepEqual(host.call(HEALTH_ID, 'identity', 'read'), GUEST_STUB);
  assert.deepEqual(host.unmount(HEALTH_ID), { ok: true, value: undefined });

  let threw = false;
  let refused: CapResult<unknown> | undefined;
  try {
    refused = host.call(HEALTH_ID, 'identity', 'read');
  } catch {
    threw = true;
  }
  assert.equal(threw, false);
  assertNotMounted(refused as CapResult<unknown>, 'identity.read after unmount');
  assert.deepEqual(host.call(HEALTH_ID, 'storage', 'get'), NOT_MOUNTED);
  assert.deepEqual(host.listMounted(), { ok: true, value: [] });
});

test('mount then call known methods keeps .1079–.1087 envelopes', () => {
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
  assert.deepEqual(healthHost.call(HEALTH_ID, 'storage', 'get'), { ok: true, value: 'ok' });

  const shotHost = createMiniHost();
  assertMounted(mountClearShotMini(shotHost));
  assert.deepEqual(shotHost.call(CLEARSHOT_ID, 'photos', 'write'), PHOTOS_STUB);
  assert.deepEqual(shotHost.call(CLEARSHOT_ID, 'storage', 'set'), STORAGE_SET_OK);
  assert.deepEqual(shotHost.call(CLEARSHOT_ID, 'storage', 'get'), SCOPE_DENIED);
  assert.deepEqual(shotHost.call(CLEARSHOT_ID, 'billing', 'checkout'), SCOPE_DENIED);
});

test('a live sibling does not make an unmounted id callable', () => {
  const host = createMiniHost();
  assertMounted(mountHealthMini(host));
  assert.deepEqual(host.call(CLEARSHOT_ID, 'photos', 'read'), NOT_MOUNTED);
  assert.deepEqual(host.call(HEALTH_ID, 'identity', 'read'), GUEST_STUB);
  assert.deepEqual(host.call(NEVER_MOUNTED_ID, 'identity', 'read'), NOT_MOUNTED);
});

test('unknown_mini / already_mounted / unmount not_mounted stay unchanged', () => {
  const host = createMiniHost();
  assert.deepEqual(host.mount(NEVER_MOUNTED_ID), UNKNOWN);
  assert.deepEqual(host.unmount(NEVER_MOUNTED_ID), NOT_MOUNTED);
  assert.deepEqual(host.unmount(HEALTH_ID), NOT_MOUNTED);
  assert.deepEqual(host.listMounted(HEALTH_ID), UNKNOWN);

  const health = assertMounted(mountHealthMini(host));
  assert.equal(health.manifest.id, HEALTH_ID);
  assert.deepEqual(mountHealthMini(host), ALREADY_MOUNTED);
  assert.deepEqual(host.mount(NEVER_MOUNTED_ID), UNKNOWN);
  assert.deepEqual(host.listMounted(NEVER_MOUNTED_ID), UNKNOWN);
  assert.deepEqual(host.unmount(CLEARSHOT_ID), NOT_MOUNTED);

  const shot = assertMounted(mountClearShotMini(host));
  assert.equal(shot.manifest.id, CLEARSHOT_ID);
  assert.deepEqual(mountClearShotMini(host), ALREADY_MOUNTED);
});

test('callMountedDoor on an empty table is not_mounted — no throw', () => {
  const empty = new Map<string, MountedMini>();
  for (const door of MISSION_OS_CAPABILITIES) {
    let threw = false;
    let refused: CapResult<unknown> | undefined;
    try {
      refused = callMountedDoor(empty, HEALTH_ID, door, 'read');
    } catch {
      threw = true;
    }
    assert.equal(threw, false, `${door} must not throw`);
    assertNotMounted(refused as CapResult<unknown>, `empty.${door}`);
  }
});

test('host call refuse never imports Stripe, camera, or Android wiring', () => {
  for (const file of ['host.ts', 'call.ts', 'types.ts', 'fakes.ts']) {
    const src = sourceOf(file);
    assert.equal(/from\s+['"][^'"]*stripe/i.test(src), false, `${file} must not import Stripe`);
    assert.equal(src.includes('premiumServer'), false, `${file} must not import premiumServer`);
    assert.equal(/checkout\.sessions/i.test(src), false, `${file} must not open checkout`);
    assert.equal(src.includes('getUserMedia'), false, `${file} must not open a camera`);
    assert.equal(/android\.provider\.MediaStore/i.test(src), false, `${file} must not import MediaStore`);
    assert.equal(src.includes('apps/android'), false, `${file} must not wire Android`);
    assert.equal(src.includes('safeStorage'), false, `${file} must not import safeStorage`);
    assert.equal(src.includes('localStorage'), false, `${file} must not call localStorage`);
  }

  const hostSrc = sourceOf('host.ts');
  assert.equal(hostSrc.includes("code: 'not_mounted'"), true);
  assert.equal(hostSrc.includes('callMountedDoor'), true);
  assert.equal(hostSrc.includes('instances.set'), true);
  assert.equal(hostSrc.includes('instances.delete'), true);
  assert.equal(/auto-?mount/i.test(hostSrc), false);
  assert.equal(hostSrc.includes(NEVER_MOUNTED_ID), false);

  const callSrc = sourceOf('call.ts');
  assert.equal(callSrc.includes("code: 'not_mounted'"), true);
  assert.equal(callSrc.includes('table.get(id)'), true);
});
