/**
 * Deeplink resolve then remount of the same id is already_mounted.
 *
 * Judge ≠ builder: deny codes, ids, and entries are hardcoded here —
 * not read back from MINI_LAST_SEGMENT_ROUTES / HEALTH_MINI_SCOPES.
 * A remount that throws, returns ok, wipes storage, or replaces the
 * live instance would mean the deeplink door grew a silent swap.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  mountMiniByDeeplink,
  resolveMiniDeeplink,
} from './deeplink';
import { createMiniHost } from './host';
import { mountHealthMini } from './health';
import type { CapResult, ModuleManifest, MountedMini } from './types';

const here = import.meta.dirname;
const repoRoot = path.join(here, '..', '..', '..');

function sourceOf(file: string): string {
  return readFileSync(path.join(here, file), 'utf8');
}

const HEALTH_ENTRY = 'mission://minis/health';
const CLEARSHOT_ENTRY = 'mission://minis/clearshot';
const HEALTH_ID = 'l1.health';
const CLEARSHOT_ID = 'utility.clearshot';

/** Hardcoded — do not import HEALTH_MINI_SCOPES. */
const HEALTH_DECLARED = ['identity.read', 'storage.read', 'storage.write'] as const;

const ALREADY_MOUNTED: CapResult<never> = { ok: false, code: 'already_mounted' };
const UNKNOWN: CapResult<never> = { ok: false, code: 'unknown_mini' };
const BAD_DEEPLINK: CapResult<never> = { ok: false, code: 'bad_deeplink' };
const NOT_MOUNTED: CapResult<never> = { ok: false, code: 'not_mounted' };
const SCOPE_DENIED: CapResult<never> = { ok: false, code: 'scope_denied' };
const PHOTOS_STUB: CapResult<never> = { ok: false, code: 'photos_stub' };
const SET_OK: CapResult<void> = { ok: true, value: undefined };
const MISS: CapResult<string | undefined> = { ok: true, value: undefined };
const GUEST_STUB: CapResult<{ missionId: null; callSign: null }> = {
  ok: true,
  value: { missionId: null, callSign: null },
};

const KEY = 'secret';
const HEALTH_VALUE = 'health-only';
const SHOT_VALUE = 'shot-only';

function assertMounted(result: CapResult<MountedMini>): MountedMini {
  assert.equal(result.ok, true, 'mount must succeed');
  if (!result.ok) throw new Error('unreachable');
  return result.value;
}

function assertAlreadyMounted(result: CapResult<unknown>, label: string): void {
  assert.deepEqual(result, ALREADY_MOUNTED, label);
  assert.equal(result.ok, false, label);
  if (result.ok) return;
  assert.equal(result.code, 'already_mounted', label);
  assert.notEqual(result.code, 'unknown_mini', label);
  assert.notEqual(result.code, 'not_mounted', label);
  assert.notEqual(result.code, 'bad_deeplink', label);
  assert.notEqual(result.code, 'stub', label);
  assert.notEqual(result.code, 'scope_denied', label);
}

test('resolve of a known URI does not mount', () => {
  const host = createMiniHost();
  let threw = false;
  let resolved: CapResult<ModuleManifest> | undefined;
  try {
    resolved = resolveMiniDeeplink(HEALTH_ENTRY);
  } catch {
    threw = true;
  }
  assert.equal(threw, false, 'resolve must not throw');
  assert.equal(resolved?.ok, true);
  if (!resolved || !resolved.ok) return;
  assert.equal(resolved.value.id, HEALTH_ID);
  assert.equal(resolved.value.entry, HEALTH_ENTRY);
  assert.deepEqual(host.listMounted(), { ok: true, value: [] });
});

test('second mountMiniByDeeplink of health is already_mounted — no wipe', () => {
  const host = createMiniHost();
  const first = assertMounted(mountMiniByDeeplink(host, HEALTH_ENTRY));
  assert.equal(first.manifest.id, HEALTH_ID);
  assert.deepEqual(first.storage.set(KEY, HEALTH_VALUE), SET_OK);
  assert.deepEqual(first.identity.read(), GUEST_STUB);

  const lookup = resolveMiniDeeplink(HEALTH_ENTRY);
  assert.equal(lookup.ok, true, 'resolve while mounted is still a lookup');
  if (!lookup.ok) return;
  assert.equal(lookup.value.id, HEALTH_ID);
  assert.deepEqual(first.storage.get(KEY), { ok: true, value: HEALTH_VALUE });

  let threw = false;
  let second: CapResult<MountedMini> | undefined;
  try {
    second = mountMiniByDeeplink(host, HEALTH_ENTRY);
  } catch {
    threw = true;
  }
  assert.equal(threw, false, 'deeplink remount must not throw');
  assertAlreadyMounted(second ?? { ok: true, value: first }, 'health deeplink remount');

  assert.deepEqual(first.storage.get(KEY), { ok: true, value: HEALTH_VALUE });
  assert.deepEqual(first.identity.read(), GUEST_STUB);
  assert.deepEqual(host.call(HEALTH_ID, 'storage', 'get', { key: KEY }), {
    ok: true,
    value: HEALTH_VALUE,
  });

  const listed = host.listMounted();
  assert.equal(listed.ok, true);
  if (!listed.ok) return;
  assert.equal(listed.value.length, 1);
  assert.equal(listed.value[0]?.id, HEALTH_ID);
  assert.deepEqual([...(listed.value[0]?.scopes ?? [])], [...HEALTH_DECLARED]);
});

test('host.mount of a resolved live manifest is already_mounted', () => {
  const host = createMiniHost();
  const first = assertMounted(mountMiniByDeeplink(host, HEALTH_ENTRY));
  assert.deepEqual(first.storage.set(KEY, HEALTH_VALUE), SET_OK);

  const resolved = resolveMiniDeeplink(HEALTH_ENTRY);
  assert.equal(resolved.ok, true);
  if (!resolved.ok) return;

  let threw = false;
  let remount: CapResult<MountedMini> | undefined;
  try {
    remount = host.mount(resolved.value);
  } catch {
    threw = true;
  }
  assert.equal(threw, false);
  assertAlreadyMounted(remount ?? { ok: true, value: first }, 'mount resolved live id');
  assert.deepEqual(first.storage.get(KEY), { ok: true, value: HEALTH_VALUE });
});

test('second mountMiniByDeeplink of clearshot is already_mounted — no wipe', () => {
  const host = createMiniHost();
  const first = assertMounted(mountMiniByDeeplink(host, CLEARSHOT_ENTRY));
  assert.equal(first.manifest.id, CLEARSHOT_ID);
  assert.deepEqual(first.storage.set(KEY, SHOT_VALUE), SET_OK);
  assert.deepEqual(first.photos.read(), PHOTOS_STUB);
  assert.deepEqual(first.storage.get(KEY), SCOPE_DENIED);

  let threw = false;
  let second: CapResult<MountedMini> | undefined;
  try {
    second = mountMiniByDeeplink(host, CLEARSHOT_ENTRY);
  } catch {
    threw = true;
  }
  assert.equal(threw, false);
  assertAlreadyMounted(second ?? { ok: true, value: first }, 'clearshot deeplink remount');
  assert.deepEqual(first.photos.read(), PHOTOS_STUB);
  assert.deepEqual(first.storage.get(KEY), SCOPE_DENIED);
  assert.deepEqual(first.identity.read(), GUEST_STUB);

  const listed = host.listMounted();
  assert.equal(listed.ok, true);
  if (!listed.ok) return;
  assert.equal(listed.value.length, 1);
  assert.equal(listed.value[0]?.id, CLEARSHOT_ID);
});

test('Health deeplink remount does not touch live ClearShot', () => {
  const host = createMiniHost();
  const health = assertMounted(mountMiniByDeeplink(host, HEALTH_ENTRY));
  const shot = assertMounted(mountMiniByDeeplink(host, CLEARSHOT_ENTRY));
  assert.deepEqual(health.storage.set(KEY, HEALTH_VALUE), SET_OK);
  assert.deepEqual(shot.storage.set(KEY, SHOT_VALUE), SET_OK);

  assertAlreadyMounted(
    mountMiniByDeeplink(host, HEALTH_ENTRY),
    'health remount while both live'
  );
  assertAlreadyMounted(
    mountMiniByDeeplink(host, CLEARSHOT_ENTRY),
    'clearshot remount while both live'
  );

  assert.deepEqual(health.storage.get(KEY), { ok: true, value: HEALTH_VALUE });
  assert.deepEqual(shot.storage.get(KEY), SCOPE_DENIED);
  assert.deepEqual(shot.photos.read(), PHOTOS_STUB);
  assert.deepEqual(health.photos.read(), SCOPE_DENIED);

  const listed = host.listMounted();
  assert.equal(listed.ok, true);
  if (!listed.ok) return;
  assert.equal(listed.value.length, 2);
  assert.equal(
    listed.value.some((row) => row.id === HEALTH_ID),
    true
  );
  assert.equal(
    listed.value.some((row) => row.id === CLEARSHOT_ID),
    true
  );
});

test('after unmount, the same deeplink remounts empty', () => {
  const host = createMiniHost();
  const first = assertMounted(mountMiniByDeeplink(host, HEALTH_ENTRY));
  assert.deepEqual(first.storage.set(KEY, HEALTH_VALUE), SET_OK);
  assert.deepEqual(host.unmount(HEALTH_ID), { ok: true, value: undefined });

  const remounted = assertMounted(mountMiniByDeeplink(host, HEALTH_ENTRY));
  assert.equal(remounted.manifest.id, HEALTH_ID);
  const leftover = remounted.storage.get(KEY);
  assert.deepEqual(leftover, MISS);
  if (!leftover.ok) return;
  assert.notEqual(leftover.value, HEALTH_VALUE);
  assert.deepEqual(remounted.identity.read(), GUEST_STUB);
});

test('unknown / bad deeplink and direct remount stay .1086 / .1090 / .1091', () => {
  const host = createMiniHost();
  assert.deepEqual(resolveMiniDeeplink('https://evil'), BAD_DEEPLINK);
  assert.deepEqual(mountMiniByDeeplink(host, 'https://evil'), BAD_DEEPLINK);
  assert.deepEqual(resolveMiniDeeplink('mission://minis/totally-unknown'), UNKNOWN);
  assert.deepEqual(mountMiniByDeeplink(host, 'mission://minis/totally-unknown'), UNKNOWN);
  assert.deepEqual(host.listMounted(), { ok: true, value: [] });

  assertMounted(mountMiniByDeeplink(host, HEALTH_ENTRY));
  assertAlreadyMounted(mountHealthMini(host), 'direct remount stays already_mounted');
  assert.deepEqual(host.unmount('utility.probe'), NOT_MOUNTED);
  assert.deepEqual(host.mount('totally.unknown'), UNKNOWN);
});

test('docs/harness/HOP.md stays the empty template', () => {
  const hop = readFileSync(path.join(repoRoot, 'docs', 'harness', 'HOP.md'), 'utf8');
  assert.match(hop, /^# Live hop\n/);
  assert.match(hop, /^ticket:\n/m);
  assert.match(hop, /^done_means:\n/m);
  assert.match(hop, /^accept:\n/m);
  assert.equal(hop.includes('1101'), false);
  assert.equal(hop.includes('already_mounted'), false);
  assert.equal(hop.includes('mountMiniByDeeplink'), false);
  assert.equal(hop.includes('l1.health'), false);
});

test('deeplink remount never imports Stripe, camera, or Android', () => {
  const src = sourceOf('deeplink.ts');
  assert.equal(/from\s+['"][^'"]*stripe/i.test(src), false);
  assert.equal(src.includes('premiumServer'), false);
  assert.equal(src.includes('getUserMedia'), false);
  assert.equal(/android\.provider\.MediaStore/i.test(src), false);
  assert.equal(src.includes('apps/android'), false);
  assert.equal(src.includes('safeStorage'), false);
  assert.equal(src.includes('localStorage'), false);
  assert.equal(src.includes('host.mount(resolved.value)'), true);
  assert.equal(src.includes('already_mounted'), true);
});
