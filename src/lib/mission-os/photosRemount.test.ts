/**
 * CapResult remount after photos inject.
 *
 * Judge ≠ builder: snapshots and deny codes are hardcoded here —
 * not read back from STUB_PHOTOS / CLEARSHOT_MINI_SCOPES. A remount
 * that still shows the leftover override, or that rewrites B.read,
 * would mean inject occupancy survived unmount.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createMiniHost, injectPhotosSnapshot } from './host';
import { mountHealthMini } from './health';
import { mountClearShotMini } from './clearshot';
import { mountTestBillingMini } from './billingProbe';
import { mountTestGrantedMini } from './allowProbe';
import { resolveMiniDeeplink } from './deeplink';
import type { CapResult, MountedMini, PhotosSnapshot } from './types';

const here = import.meta.dirname;
const repoRoot = path.join(here, '..', '..', '..');

function sourceOf(file: string): string {
  return readFileSync(path.join(here, file), 'utf8');
}

/** Hardcoded — do not use STORAGE_MAX_* as the overflow size. */
const MAX_KEYS = 32;

const GRANTED_ID = 'test.granted';
const CLEARSHOT_ID = 'utility.clearshot';
const HEALTH_ID = 'l1.health';
const BILLING_ID = 'test.billing';

const GRANTED_SNAP: PhotosSnapshot = { album: 'granted', stub: true };
const SHOT_SNAP: PhotosSnapshot = { album: 'shot', stub: true };
const GRANTED_OVERRIDE: PhotosSnapshot = { album: 'granted-2', stub: false };
const GRANTED_AFTER: PhotosSnapshot = { album: 'granted-3', stub: false };
const SHOT_OVERRIDE: PhotosSnapshot = { album: 'shot-2', stub: false };
const HEALTH_OVERRIDE: PhotosSnapshot = { album: 'health-2', stub: false };

const GRANTED_OK: CapResult<PhotosSnapshot> = {
  ok: true,
  value: { album: 'granted', stub: true },
};
const SHOT_OK: CapResult<PhotosSnapshot> = {
  ok: true,
  value: { album: 'shot', stub: true },
};
const GRANTED_OVERRIDE_OK: CapResult<PhotosSnapshot> = {
  ok: true,
  value: { album: 'granted-2', stub: true },
};
const GRANTED_AFTER_OK: CapResult<PhotosSnapshot> = {
  ok: true,
  value: { album: 'granted-3', stub: true },
};
const SHOT_OVERRIDE_OK: CapResult<PhotosSnapshot> = {
  ok: true,
  value: { album: 'shot-2', stub: true },
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
const GUEST_STUB: CapResult<{ missionId: null; callSign: null }> = {
  ok: true,
  value: { missionId: null, callSign: null },
};

const KEY = 'secret';
const GRANTED_VALUE = 'granted-only';
const SHOT_VALUE = 'shot-only';

function assertMounted(result: CapResult<MountedMini>): MountedMini {
  assert.equal(result.ok, true, 'mount must succeed');
  if (!result.ok) throw new Error('unreachable');
  return result.value;
}

function assertHostBound(
  result: CapResult<unknown>,
  expected: CapResult<PhotosSnapshot>,
  leftover: PhotosSnapshot,
  label: string
): void {
  assert.deepEqual(result, expected, label);
  assert.equal(result.ok, true, label);
  if (!result || !result.ok) return;
  const value = result.value as PhotosSnapshot;
  assert.notEqual(value.album, leftover.album, label);
  assert.equal(value.stub, true, label);
}

function fillKeys(mini: MountedMini, count: number): void {
  for (let i = 0; i < count; i++) {
    assert.deepEqual(mini.storage.set(`k${i}`, 'v'), SET_OK, `fill k${i}`);
  }
}

function hostWithSnaps() {
  return createMiniHost({
    photoses: {
      [GRANTED_ID]: GRANTED_SNAP,
      [CLEARSHOT_ID]: SHOT_SNAP,
      [HEALTH_ID]: GRANTED_SNAP,
      [BILLING_ID]: GRANTED_SNAP,
    },
  });
}

test('inject then unmount+remount test.granted rebinds host snapshot; B untouched', () => {
  const host = hostWithSnaps();
  const granted = assertMounted(mountTestGrantedMini(host));
  const shot = assertMounted(mountClearShotMini(host));

  injectPhotosSnapshot(granted.photos, GRANTED_OVERRIDE);
  assert.deepEqual(granted.photos.read(), GRANTED_OVERRIDE_OK);
  assert.deepEqual(granted.photos.write(), GRANTED_OVERRIDE_OK);
  assert.deepEqual(shot.photos.read(), SHOT_OK);

  assert.deepEqual(host.unmount(GRANTED_ID), { ok: true, value: undefined });
  assert.deepEqual(shot.photos.read(), SHOT_OK);
  assert.deepEqual(host.call(CLEARSHOT_ID, 'photos', 'read'), SHOT_OK);
  assert.deepEqual(host.call(GRANTED_ID, 'photos', 'read'), NOT_MOUNTED);

  let threw = false;
  let remount: CapResult<MountedMini> | undefined;
  try {
    remount = mountTestGrantedMini(host);
  } catch {
    threw = true;
  }
  assert.equal(threw, false, 'photos remount must not throw');
  const remounted = assertMounted(remount ?? { ok: false, code: 'stub' });
  assert.notEqual(remounted.photos, granted.photos);

  assertHostBound(remounted.photos.read(), GRANTED_OK, GRANTED_OVERRIDE, 'remounted fake');
  assertHostBound(remounted.photos.write(), GRANTED_OK, GRANTED_OVERRIDE, 'remounted write');
  assertHostBound(
    host.call(GRANTED_ID, 'photos', 'read'),
    GRANTED_OK,
    GRANTED_OVERRIDE,
    'remounted host.call'
  );
  assert.deepEqual(shot.photos.read(), SHOT_OK);
  assert.deepEqual(host.call(CLEARSHOT_ID, 'photos', 'read'), SHOT_OK);
});

test('inject on the old fake after remount does not change remounted.read', () => {
  const host = hostWithSnaps();
  const granted = assertMounted(mountTestGrantedMini(host));
  const shot = assertMounted(mountClearShotMini(host));

  injectPhotosSnapshot(granted.photos, GRANTED_OVERRIDE);
  assert.deepEqual(host.unmount(GRANTED_ID), { ok: true, value: undefined });
  const remounted = assertMounted(mountTestGrantedMini(host));

  injectPhotosSnapshot(granted.photos, GRANTED_OVERRIDE);
  assertHostBound(remounted.photos.read(), GRANTED_OK, GRANTED_OVERRIDE, 'old-fake inject');
  assert.deepEqual(granted.photos.read(), GRANTED_OVERRIDE_OK);
  assert.deepEqual(shot.photos.read(), SHOT_OK);
});

test('inject on remounted still does not change sibling photos.read', () => {
  const host = hostWithSnaps();
  const granted = assertMounted(mountTestGrantedMini(host));
  const shot = assertMounted(mountClearShotMini(host));

  injectPhotosSnapshot(granted.photos, GRANTED_OVERRIDE);
  assert.deepEqual(host.unmount(GRANTED_ID), { ok: true, value: undefined });
  const remounted = assertMounted(mountTestGrantedMini(host));

  injectPhotosSnapshot(remounted.photos, GRANTED_AFTER);
  assert.deepEqual(remounted.photos.read(), GRANTED_AFTER_OK);
  assert.deepEqual(shot.photos.read(), SHOT_OK);
  const b = shot.photos.read();
  if (!b || !b.ok) return;
  assert.notEqual(b.value.album, GRANTED_AFTER.album);
  assert.equal(b.value.stub, true);
});

test('storage_cap then inject then remount: photos is host-bound; B untouched', () => {
  const host = hostWithSnaps();
  const granted = assertMounted(mountTestGrantedMini(host));
  const shot = assertMounted(mountClearShotMini(host));

  fillKeys(granted, MAX_KEYS);
  assert.deepEqual(shot.photos.read(), SHOT_OK);
  assert.deepEqual(granted.storage.set('overflow', 'v'), STORAGE_CAP);
  injectPhotosSnapshot(granted.photos, GRANTED_AFTER);
  assert.deepEqual(granted.photos.read(), GRANTED_AFTER_OK);

  assert.deepEqual(host.unmount(GRANTED_ID), { ok: true, value: undefined });
  assert.deepEqual(shot.photos.read(), SHOT_OK);
  assert.deepEqual(host.call(CLEARSHOT_ID, 'photos', 'read'), SHOT_OK);

  const remounted = assertMounted(mountTestGrantedMini(host));
  assertHostBound(
    remounted.photos.read(),
    GRANTED_OK,
    GRANTED_AFTER,
    'cap+inject remount photos'
  );
  assert.deepEqual(remounted.storage.get('k0'), MISS);
  assert.deepEqual(remounted.storage.get('overflow'), MISS);
  assert.deepEqual(remounted.storage.set('fresh', GRANTED_VALUE), SET_OK);
  assert.deepEqual(shot.photos.read(), SHOT_OK);
  assert.deepEqual(host.call(CLEARSHOT_ID, 'photos', 'read'), SHOT_OK);
});

test('ClearShot remount after inject rebinds its host photos snapshot', () => {
  const host = hostWithSnaps();
  const shot = assertMounted(mountClearShotMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));

  injectPhotosSnapshot(shot.photos, SHOT_OVERRIDE);
  assert.deepEqual(shot.photos.read(), SHOT_OVERRIDE_OK);
  assert.deepEqual(shot.photos.write(), SHOT_OVERRIDE_OK);
  assert.deepEqual(granted.photos.read(), GRANTED_OK);

  assert.deepEqual(host.unmount(CLEARSHOT_ID), { ok: true, value: undefined });
  const remounted = assertMounted(mountClearShotMini(host));
  assert.notEqual(remounted.photos, shot.photos);
  assertHostBound(remounted.photos.read(), SHOT_OK, SHOT_OVERRIDE, 'clearshot remount');
  assertHostBound(remounted.photos.write(), SHOT_OK, SHOT_OVERRIDE, 'clearshot remount write');
  assert.deepEqual(host.call(CLEARSHOT_ID, 'photos', 'read'), SHOT_OK);
  assert.deepEqual(granted.photos.read(), GRANTED_OK);

  injectPhotosSnapshot(shot.photos, GRANTED_AFTER);
  assertHostBound(remounted.photos.read(), SHOT_OK, GRANTED_AFTER, 'old-fake clearshot');
  assert.deepEqual(granted.photos.read(), GRANTED_OK);
});

test('ClearShot remount without a host snapshot stays photos_stub — leftover inject cannot grant', () => {
  const host = createMiniHost({
    photoses: {
      [GRANTED_ID]: GRANTED_SNAP,
    },
  });
  const shot = assertMounted(mountClearShotMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));

  assert.deepEqual(shot.photos.read(), PHOTOS_STUB);
  injectPhotosSnapshot(shot.photos, SHOT_OVERRIDE);
  assert.deepEqual(shot.photos.read(), SHOT_OVERRIDE_OK);
  assert.deepEqual(granted.photos.read(), GRANTED_OK);

  assert.deepEqual(host.unmount(CLEARSHOT_ID), { ok: true, value: undefined });
  const remounted = assertMounted(mountClearShotMini(host));
  assert.notEqual(remounted.photos, shot.photos);
  assert.deepEqual(remounted.photos.read(), PHOTOS_STUB);
  assert.deepEqual(remounted.photos.write(), PHOTOS_STUB);
  assert.deepEqual(host.call(CLEARSHOT_ID, 'photos', 'read'), PHOTOS_STUB);
  assert.deepEqual(granted.photos.read(), GRANTED_OK);

  injectPhotosSnapshot(shot.photos, GRANTED_AFTER);
  assert.deepEqual(remounted.photos.read(), PHOTOS_STUB);
  assert.deepEqual(granted.photos.read(), GRANTED_OK);
});

test('Health remount stays scope_denied even with a host photos snapshot', () => {
  const host = hostWithSnaps();
  const health = assertMounted(mountHealthMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));

  injectPhotosSnapshot(health.photos, HEALTH_OVERRIDE);
  assert.deepEqual(health.photos.read(), SCOPE_DENIED);
  assert.deepEqual(health.photos.write(), SCOPE_DENIED);
  assert.deepEqual(granted.photos.read(), GRANTED_OK);

  assert.deepEqual(host.unmount(HEALTH_ID), { ok: true, value: undefined });
  const remounted = assertMounted(mountHealthMini(host));
  assert.notEqual(remounted.photos, health.photos);
  assert.deepEqual(remounted.photos.read(), SCOPE_DENIED);
  assert.deepEqual(remounted.photos.write(), SCOPE_DENIED);
  assert.deepEqual(host.call(HEALTH_ID, 'photos', 'read'), SCOPE_DENIED);
  assert.deepEqual(granted.photos.read(), GRANTED_OK);
  assert.deepEqual(remounted.identity.read(), GUEST_STUB);
});

test('test.billing remount stays scope_denied — leftover inject cannot grant photos', () => {
  const host = hostWithSnaps();
  const billing = assertMounted(mountTestBillingMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));

  injectPhotosSnapshot(billing.photos, HEALTH_OVERRIDE);
  assert.deepEqual(billing.photos.read(), SCOPE_DENIED);
  assert.deepEqual(billing.photos.write(), SCOPE_DENIED);
  assert.deepEqual(granted.photos.read(), GRANTED_OK);

  assert.deepEqual(host.unmount(BILLING_ID), { ok: true, value: undefined });
  const remounted = assertMounted(mountTestBillingMini(host));
  assert.notEqual(remounted.photos, billing.photos);
  assert.deepEqual(remounted.photos.read(), SCOPE_DENIED);
  assert.deepEqual(host.call(BILLING_ID, 'photos', 'read'), SCOPE_DENIED);
  assert.deepEqual(granted.photos.read(), GRANTED_OK);
  assert.deepEqual(remounted.billing.read(), MUTED_READ);
});

test('known-method envelopes stay .1079–.1106 after photos remount', () => {
  const host = hostWithSnaps();
  const granted = assertMounted(mountTestGrantedMini(host));
  const shot = assertMounted(mountClearShotMini(host));
  const health = assertMounted(mountHealthMini(host));
  const billing = assertMounted(mountTestBillingMini(host));

  injectPhotosSnapshot(granted.photos, GRANTED_OVERRIDE);
  assert.deepEqual(host.unmount(GRANTED_ID), { ok: true, value: undefined });
  const remounted = assertMounted(mountTestGrantedMini(host));
  assert.deepEqual(remounted.photos.read(), GRANTED_OK);

  assert.deepEqual(health.photos.read(), SCOPE_DENIED);
  assert.deepEqual(health.billing.read(), SCOPE_DENIED);
  assert.deepEqual(billing.photos.read(), SCOPE_DENIED);
  assert.deepEqual(remounted.photos.read(), GRANTED_OK);
  assert.deepEqual(shot.photos.read(), SHOT_OK);
  assert.deepEqual(shot.billing.read(), SCOPE_DENIED);
  assert.deepEqual(shot.storage.get(KEY), SCOPE_DENIED);
  assert.deepEqual(host.call(GRANTED_ID, 'photos', 'foo'), UNKNOWN_METHOD);
  assert.deepEqual(host.call(GRANTED_ID, 'camera', 'read'), UNKNOWN_CAPABILITY);
  assert.deepEqual(mountTestGrantedMini(host), ALREADY_MOUNTED);
  assert.deepEqual(host.mount('totally.unknown'), UNKNOWN);
  assert.deepEqual(host.unmount('utility.probe'), NOT_MOUNTED);
  assert.deepEqual(resolveMiniDeeplink('https://evil'), BAD_DEEPLINK);
  assert.deepEqual(resolveMiniDeeplink('mission://minis/totally-unknown'), UNKNOWN);
  assert.deepEqual(remounted.storage.set(KEY, SHOT_VALUE), SET_OK);
});

test('docs/harness/HOP.md stays the empty template', () => {
  const hop = readFileSync(path.join(repoRoot, 'docs', 'harness', 'HOP.md'), 'utf8');
  assert.match(hop, /^# Live hop\n/);
  assert.match(hop, /^ticket:\n/m);
  assert.match(hop, /^done_means:\n/m);
  assert.match(hop, /^accept:\n/m);
  assert.equal(hop.includes('1107'), false);
  assert.equal(hop.includes('photos remount'), false);
  assert.equal(hop.includes('injectPhotosSnapshot'), false);
  assert.equal(hop.includes('test.granted'), false);
});

test('remount rebinds photos from host options — leftover inject dies', () => {
  const src = sourceOf('host.ts');
  assert.equal(src.includes('photosSnapshotFor(opts, manifest.id)'), true);
  assert.equal(src.includes('opts.photoses'), true);
  assert.equal(src.includes('.1107'), true);
  assert.equal(/from\s+['"][^'"]*stripe/i.test(src), false);
  assert.equal(src.includes('createClient'), false);
  assert.equal(src.includes('premiumServer'), false);
  assert.equal(src.includes('getUserMedia'), false);
  assert.equal(/android\.provider\.MediaStore/i.test(src), false);
  assert.equal(src.includes('apps/android'), false);
  assert.equal(src.includes('AuthProvider'), false);
  assert.equal(src.includes('safeStorage'), false);
  assert.equal(src.includes('localStorage'), false);
  assert.equal(src.includes('ImagePicker'), false);
  assert.equal(src.includes('progressPhotos'), false);

  const fakeSrc = sourceOf('fakes.ts');
  assert.equal(fakeSrc.includes('export function injectPhotosSnapshot'), true);
  assert.equal(fakeSrc.includes('copyPhotos'), true);
  assert.equal(fakeSrc.includes('.1107'), true);
  assert.equal(fakeSrc.includes('getUserMedia'), false);
  assert.equal(/android\.provider\.MediaStore/i.test(fakeSrc), false);
  assert.equal(/expo-camera/i.test(fakeSrc), false);
  assert.equal(fakeSrc.includes('progressPhotos'), false);
});
