/**
 * CapResult remount after identity inject.
 *
 * Judge ≠ builder: snapshots and deny codes are hardcoded here —
 * not read back from GUEST_IDENTITY / HEALTH_MINI_SCOPES. A remount
 * that still shows the leftover override, or that rewrites B.read,
 * would mean inject occupancy survived unmount.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createMiniHost, injectIdentitySnapshot } from './host';
import { mountHealthMini } from './health';
import { mountClearShotMini } from './clearshot';
import { mountTestGrantedMini } from './allowProbe';
import { mountTestNoIdentityMini } from './identityProbe';
import { resolveMiniDeeplink } from './deeplink';
import type { CapResult, MountedMini } from './types';

const here = import.meta.dirname;
const repoRoot = path.join(here, '..', '..', '..');

function sourceOf(file: string): string {
  return readFileSync(path.join(here, file), 'utf8');
}

/** Hardcoded — do not use STORAGE_MAX_* as the overflow size. */
const MAX_KEYS = 32;

const HEALTH_ID = 'l1.health';
const GRANTED_ID = 'test.granted';
const CLEARSHOT_ID = 'utility.clearshot';
const NOIDENTITY_ID = 'test.noidentity';

const HEALTH_SNAP = { missionId: 11, callSign: 'alpha' };
const GRANTED_SNAP = { missionId: 22, callSign: 'bravo' };
const SHOT_SNAP = { missionId: 44, callSign: 'shot' };
const HEALTH_OVERRIDE = { missionId: 33, callSign: 'alpha-2' };
const HEALTH_AFTER = { missionId: 55, callSign: 'alpha-3' };
const SHOT_OVERRIDE = { missionId: 66, callSign: 'shot-2' };

const HEALTH_OK: CapResult<{ missionId: number; callSign: string }> = {
  ok: true,
  value: { missionId: 11, callSign: 'alpha' },
};
const GRANTED_OK: CapResult<{ missionId: number; callSign: string }> = {
  ok: true,
  value: { missionId: 22, callSign: 'bravo' },
};
const SHOT_OK: CapResult<{ missionId: number; callSign: string }> = {
  ok: true,
  value: { missionId: 44, callSign: 'shot' },
};
const HEALTH_OVERRIDE_OK: CapResult<{ missionId: number; callSign: string }> = {
  ok: true,
  value: { missionId: 33, callSign: 'alpha-2' },
};
const HEALTH_AFTER_OK: CapResult<{ missionId: number; callSign: string }> = {
  ok: true,
  value: { missionId: 55, callSign: 'alpha-3' },
};
const SHOT_OVERRIDE_OK: CapResult<{ missionId: number; callSign: string }> = {
  ok: true,
  value: { missionId: 66, callSign: 'shot-2' },
};

const SCOPE_DENIED: CapResult<never> = { ok: false, code: 'scope_denied' };
const NOT_MOUNTED: CapResult<never> = { ok: false, code: 'not_mounted' };
const STORAGE_CAP: CapResult<never> = { ok: false, code: 'storage_cap' };
const PHOTOS_STUB: CapResult<never> = { ok: false, code: 'photos_stub' };
const ALREADY_MOUNTED: CapResult<never> = { ok: false, code: 'already_mounted' };
const UNKNOWN: CapResult<never> = { ok: false, code: 'unknown_mini' };
const BAD_DEEPLINK: CapResult<never> = { ok: false, code: 'bad_deeplink' };
const UNKNOWN_METHOD: CapResult<never> = { ok: false, code: 'unknown_method' };
const UNKNOWN_CAPABILITY: CapResult<never> = { ok: false, code: 'unknown_capability' };
const SET_OK: CapResult<void> = { ok: true, value: undefined };
const MISS: CapResult<string | undefined> = { ok: true, value: undefined };
const MUTED_READ: CapResult<{ bundle: 'none'; muted: true }> = {
  ok: true,
  value: { bundle: 'none', muted: true },
};

const KEY = 'secret';
const GRANTED_VALUE = 'granted-only';
const HEALTH_VALUE = 'health-only';

function assertMounted(result: CapResult<MountedMini>): MountedMini {
  assert.equal(result.ok, true, 'mount must succeed');
  if (!result.ok) throw new Error('unreachable');
  return result.value;
}

function assertHostBound(
  result: CapResult<unknown>,
  expected: CapResult<{ missionId: number; callSign: string }>,
  leftover: { missionId: number; callSign: string },
  label: string
): void {
  assert.deepEqual(result, expected, label);
  assert.equal(result.ok, true, label);
  if (!result.ok) return;
  const value = result.value as { missionId: number; callSign: string };
  assert.notEqual(value.missionId, leftover.missionId, label);
  assert.notEqual(value.callSign, leftover.callSign, label);
}

function fillKeys(mini: MountedMini, count: number): void {
  for (let i = 0; i < count; i++) {
    assert.deepEqual(mini.storage.set(`k${i}`, 'v'), SET_OK, `fill k${i}`);
  }
}

function hostWithSnaps() {
  return createMiniHost({
    identities: {
      [HEALTH_ID]: HEALTH_SNAP,
      [GRANTED_ID]: GRANTED_SNAP,
      [CLEARSHOT_ID]: SHOT_SNAP,
      [NOIDENTITY_ID]: HEALTH_SNAP,
    },
  });
}

test('inject then unmount+remount Health rebinds host snapshot; B untouched', () => {
  const host = hostWithSnaps();
  const health = assertMounted(mountHealthMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));

  injectIdentitySnapshot(health.identity, HEALTH_OVERRIDE);
  assert.deepEqual(health.identity.read(), HEALTH_OVERRIDE_OK);
  assert.deepEqual(granted.identity.read(), GRANTED_OK);

  assert.deepEqual(host.unmount(HEALTH_ID), { ok: true, value: undefined });
  assert.deepEqual(granted.identity.read(), GRANTED_OK);
  assert.deepEqual(host.call(GRANTED_ID, 'identity', 'read'), GRANTED_OK);
  assert.deepEqual(host.call(HEALTH_ID, 'identity', 'read'), NOT_MOUNTED);

  let threw = false;
  let remount: CapResult<MountedMini> | undefined;
  try {
    remount = mountHealthMini(host);
  } catch {
    threw = true;
  }
  assert.equal(threw, false, 'identity remount must not throw');
  const remounted = assertMounted(remount ?? { ok: false, code: 'stub' });
  assert.notEqual(remounted.identity, health.identity);

  assertHostBound(remounted.identity.read(), HEALTH_OK, HEALTH_OVERRIDE, 'remounted fake');
  assertHostBound(
    host.call(HEALTH_ID, 'identity', 'read'),
    HEALTH_OK,
    HEALTH_OVERRIDE,
    'remounted host.call'
  );
  assert.deepEqual(granted.identity.read(), GRANTED_OK);
  assert.deepEqual(host.call(GRANTED_ID, 'identity', 'read'), GRANTED_OK);
});

test('inject on the old fake after remount does not change remounted.read', () => {
  const host = hostWithSnaps();
  const health = assertMounted(mountHealthMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));

  injectIdentitySnapshot(health.identity, HEALTH_OVERRIDE);
  assert.deepEqual(host.unmount(HEALTH_ID), { ok: true, value: undefined });
  const remounted = assertMounted(mountHealthMini(host));

  injectIdentitySnapshot(health.identity, HEALTH_AFTER);
  assertHostBound(remounted.identity.read(), HEALTH_OK, HEALTH_AFTER, 'old-fake inject');
  assert.deepEqual(health.identity.read(), HEALTH_AFTER_OK);
  assert.deepEqual(granted.identity.read(), GRANTED_OK);
});

test('inject on remounted still does not change Granted.read', () => {
  const host = hostWithSnaps();
  const health = assertMounted(mountHealthMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));

  injectIdentitySnapshot(health.identity, HEALTH_OVERRIDE);
  assert.deepEqual(host.unmount(HEALTH_ID), { ok: true, value: undefined });
  const remounted = assertMounted(mountHealthMini(host));

  injectIdentitySnapshot(remounted.identity, HEALTH_AFTER);
  assert.deepEqual(remounted.identity.read(), HEALTH_AFTER_OK);
  assert.deepEqual(granted.identity.read(), GRANTED_OK);
  const b = granted.identity.read();
  if (!b.ok) return;
  assert.notEqual(b.value.missionId, HEALTH_AFTER.missionId);
  assert.notEqual(b.value.callSign, HEALTH_AFTER.callSign);
});

test('storage_cap then inject then remount: identity is host-bound; B untouched', () => {
  const host = hostWithSnaps();
  const health = assertMounted(mountHealthMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));

  fillKeys(health, MAX_KEYS);
  assert.deepEqual(granted.storage.set(KEY, GRANTED_VALUE), SET_OK);
  assert.deepEqual(health.storage.set('overflow', 'v'), STORAGE_CAP);
  injectIdentitySnapshot(health.identity, HEALTH_OVERRIDE);
  assert.deepEqual(health.identity.read(), HEALTH_OVERRIDE_OK);

  assert.deepEqual(host.unmount(HEALTH_ID), { ok: true, value: undefined });
  assert.deepEqual(granted.identity.read(), GRANTED_OK);
  assert.deepEqual(granted.storage.get(KEY), { ok: true, value: GRANTED_VALUE });

  const remounted = assertMounted(mountHealthMini(host));
  assertHostBound(
    remounted.identity.read(),
    HEALTH_OK,
    HEALTH_OVERRIDE,
    'cap+inject remount identity'
  );
  assert.deepEqual(remounted.storage.get('k0'), MISS);
  assert.deepEqual(remounted.storage.get('overflow'), MISS);
  assert.deepEqual(remounted.storage.set('fresh', HEALTH_VALUE), SET_OK);
  assert.deepEqual(granted.identity.read(), GRANTED_OK);
  assert.deepEqual(granted.storage.get(KEY), { ok: true, value: GRANTED_VALUE });
});

test('ClearShot remount after inject rebinds its host snapshot', () => {
  const host = hostWithSnaps();
  const shot = assertMounted(mountClearShotMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));

  injectIdentitySnapshot(shot.identity, SHOT_OVERRIDE);
  assert.deepEqual(shot.identity.read(), SHOT_OVERRIDE_OK);
  assert.deepEqual(granted.identity.read(), GRANTED_OK);

  assert.deepEqual(host.unmount(CLEARSHOT_ID), { ok: true, value: undefined });
  const remounted = assertMounted(mountClearShotMini(host));
  assertHostBound(remounted.identity.read(), SHOT_OK, SHOT_OVERRIDE, 'clearshot remount');
  assert.deepEqual(granted.identity.read(), GRANTED_OK);
  assert.deepEqual(remounted.photos.read(), PHOTOS_STUB);
});

test('test.noidentity remount stays scope_denied even with a host snapshot', () => {
  const host = hostWithSnaps();
  const denied = assertMounted(mountTestNoIdentityMini(host));
  const health = assertMounted(mountHealthMini(host));

  injectIdentitySnapshot(denied.identity, HEALTH_OVERRIDE);
  assert.deepEqual(denied.identity.read(), SCOPE_DENIED);
  assert.deepEqual(health.identity.read(), HEALTH_OK);

  assert.deepEqual(host.unmount(NOIDENTITY_ID), { ok: true, value: undefined });
  const remounted = assertMounted(mountTestNoIdentityMini(host));
  assert.deepEqual(remounted.identity.read(), SCOPE_DENIED);
  assert.deepEqual(host.call(NOIDENTITY_ID, 'identity', 'read'), SCOPE_DENIED);
  assert.deepEqual(health.identity.read(), HEALTH_OK);
});

test('known-method envelopes stay .1079–.1101 after identity remount', () => {
  const host = hostWithSnaps();
  const health = assertMounted(mountHealthMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));
  const shot = assertMounted(mountClearShotMini(host));

  injectIdentitySnapshot(health.identity, HEALTH_OVERRIDE);
  assert.deepEqual(host.unmount(HEALTH_ID), { ok: true, value: undefined });
  const remounted = assertMounted(mountHealthMini(host));
  assert.deepEqual(remounted.identity.read(), HEALTH_OK);

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
  const hop = readFileSync(path.join(repoRoot, 'docs', 'harness', 'HOP.md'), 'utf8');
  assert.match(hop, /^# Live hop\n/);
  assert.match(hop, /^ticket:\n/m);
  assert.match(hop, /^done_means:\n/m);
  assert.match(hop, /^accept:\n/m);
  assert.equal(hop.includes('1102'), false);
  assert.equal(hop.includes('identity remount'), false);
  assert.equal(hop.includes('injectIdentitySnapshot'), false);
  assert.equal(hop.includes('l1.health'), false);
});

test('remount rebinds identity from host options — leftover inject dies', () => {
  const src = sourceOf('host.ts');
  assert.equal(src.includes('snapshotFor(opts, manifest.id)'), true);
  assert.equal(src.includes('opts.identities'), true);
  assert.equal(src.includes('.1102'), true);
  assert.equal(/from\s+['"][^'"]*supabase/i.test(src), false);
  assert.equal(src.includes('createClient'), false);
  assert.equal(src.includes('premiumServer'), false);
  assert.equal(/from\s+['"][^'"]*stripe/i.test(src), false);
  assert.equal(src.includes('getUserMedia'), false);
  assert.equal(/android\.provider\.MediaStore/i.test(src), false);
  assert.equal(src.includes('apps/android'), false);
  assert.equal(src.includes('AuthProvider'), false);
  assert.equal(src.includes('safeStorage'), false);
  assert.equal(src.includes('localStorage'), false);

  const fakeSrc = sourceOf('fakes.ts');
  assert.equal(fakeSrc.includes('export function injectIdentitySnapshot'), true);
  assert.equal(fakeSrc.includes('copyIdentity'), true);
  assert.equal(fakeSrc.includes('.1102'), true);
  assert.equal(/from\s+['"][^'"]*supabase/i.test(fakeSrc), false);
  assert.equal(fakeSrc.includes('createClient'), false);
  assert.equal(/signInWith/i.test(fakeSrc), false);
});
