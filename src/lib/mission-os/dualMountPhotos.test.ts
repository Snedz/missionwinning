/**
 * Dual-mount CapResult photos isolation.
 *
 * Judge ≠ builder: snapshots and deny codes are hardcoded here — not
 * read back from STUB_PHOTOS / CLEARSHOT_MINI_SCOPES. A shared host-wide
 * object, or inject-A rewriting B.read, would mean the host grew one
 * photos snapshot for every mounted mini.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  createMiniHost,
  injectBillingSnapshot,
  injectIdentitySnapshot,
  injectPhotosSnapshot,
} from './host';
import { mountHealthMini } from './health';
import { mountClearShotMini } from './clearshot';
import { mountTestGrantedMini } from './allowProbe';
import { mountTestBillingMini } from './billingProbe';
import { resolveMiniDeeplink } from './deeplink';
import type { CapResult, MountedMini, PhotosSnapshot } from './types';

const here = import.meta.dirname;

function sourceOf(file: string): string {
  return readFileSync(path.join(here, file), 'utf8');
}

const SHOT_ID = 'utility.clearshot';
const GRANTED_ID = 'test.granted';
const HEALTH_ID = 'l1.health';
const BILLING_ID = 'test.billing';

const SHOT_SNAP: PhotosSnapshot = { album: 'shot', stub: true };
const GRANTED_SNAP: PhotosSnapshot = { album: 'granted', stub: true };
const SHOT_OVERRIDE: PhotosSnapshot = { album: 'shot-2', stub: false };
const HEALTH_SNAP = { missionId: 11, callSign: 'alpha' };
const GRANTED_ID_SNAP = { missionId: 22, callSign: 'bravo' };
const BILLING_SNAP = { bundle: 'none' as const, muted: true };
const GRANTED_BILLING = { bundle: 'super' as const, muted: true };

const SHOT_OK: CapResult<PhotosSnapshot> = {
  ok: true,
  value: { album: 'shot', stub: true },
};
const GRANTED_OK: CapResult<PhotosSnapshot> = {
  ok: true,
  value: { album: 'granted', stub: true },
};
const SHOT_OVERRIDE_OK: CapResult<PhotosSnapshot> = {
  ok: true,
  value: { album: 'shot-2', stub: true },
};

const SCOPE_DENIED: CapResult<never> = { ok: false, code: 'scope_denied' };
const PHOTOS_STUB: CapResult<never> = { ok: false, code: 'photos_stub' };
const ALREADY_MOUNTED: CapResult<never> = { ok: false, code: 'already_mounted' };
const NOT_MOUNTED: CapResult<never> = { ok: false, code: 'not_mounted' };
const UNKNOWN: CapResult<never> = { ok: false, code: 'unknown_mini' };
const BAD_DEEPLINK: CapResult<never> = { ok: false, code: 'bad_deeplink' };
const UNKNOWN_METHOD: CapResult<never> = { ok: false, code: 'unknown_method' };
const SET_OK: CapResult<void> = { ok: true, value: undefined };
const MISS: CapResult<string | undefined> = { ok: true, value: undefined };
const KEY = 'secret';
const HEALTH_VALUE = 'health-only';
const GRANTED_VALUE = 'granted-only';

function assertMounted(result: CapResult<MountedMini>): MountedMini {
  assert.equal(result.ok, true, 'mount must succeed');
  if (!result.ok) throw new Error('unreachable');
  return result.value;
}

test('ClearShot read is not test.granted read — hardcoded envelopes', () => {
  const host = createMiniHost({
    photoses: {
      [SHOT_ID]: SHOT_SNAP,
      [GRANTED_ID]: GRANTED_SNAP,
    },
  });
  const shot = assertMounted(mountClearShotMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));

  const a = shot.photos.read();
  const b = granted.photos.read();
  assert.deepEqual(a, SHOT_OK);
  assert.deepEqual(b, GRANTED_OK);
  assert.notDeepEqual(a, b);
  if (!a.ok || !b.ok) return;
  assert.notEqual(a.value.album, b.value.album);
  assert.equal(a.value.stub, true);
  assert.equal(b.value.stub, true);

  assert.deepEqual(shot.photos.write(), SHOT_OK);
  assert.deepEqual(granted.photos.write(), GRANTED_OK);
  assert.deepEqual(host.call(SHOT_ID, 'photos', 'read'), SHOT_OK);
  assert.deepEqual(host.call(GRANTED_ID, 'photos', 'read'), GRANTED_OK);
  assert.deepEqual(host.call(SHOT_ID, 'photos', 'write'), SHOT_OK);
  assert.deepEqual(host.call(GRANTED_ID, 'photos', 'write'), GRANTED_OK);
});

test('injecting ClearShot snapshot does not alter test.granted read', () => {
  const host = createMiniHost({
    photoses: {
      [SHOT_ID]: SHOT_SNAP,
      [GRANTED_ID]: GRANTED_SNAP,
    },
  });
  const shot = assertMounted(mountClearShotMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));

  injectPhotosSnapshot(shot.photos, { album: 'shot', stub: false });
  assert.deepEqual(shot.photos.read(), SHOT_OK);
  assert.deepEqual(granted.photos.read(), GRANTED_OK);

  injectPhotosSnapshot(shot.photos, SHOT_OVERRIDE);
  assert.deepEqual(shot.photos.read(), SHOT_OVERRIDE_OK);
  assert.deepEqual(shot.photos.write(), SHOT_OVERRIDE_OK);
  assert.deepEqual(granted.photos.read(), GRANTED_OK);
  assert.deepEqual(granted.photos.write(), GRANTED_OK);
  assert.deepEqual(host.call(GRANTED_ID, 'photos', 'read'), GRANTED_OK);

  injectPhotosSnapshot(granted.photos, { album: 'shot', stub: true });
  assert.deepEqual(granted.photos.read(), SHOT_OK);
  assert.deepEqual(shot.photos.read(), SHOT_OVERRIDE_OK);
  assert.deepEqual(host.call(SHOT_ID, 'photos', 'read'), SHOT_OVERRIDE_OK);
});

test('mutating the injected ClearShot object after mount does not change granted', () => {
  const shotSnap: PhotosSnapshot = { album: 'shot', stub: true };
  const grantedSnap: PhotosSnapshot = { album: 'granted', stub: true };
  const host = createMiniHost({
    photoses: {
      [SHOT_ID]: shotSnap,
      [GRANTED_ID]: grantedSnap,
    },
  });
  const shot = assertMounted(mountClearShotMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));

  shotSnap.album = 'granted';
  grantedSnap.album = 'shot';

  assert.deepEqual(shot.photos.read(), SHOT_OK);
  assert.deepEqual(granted.photos.read(), GRANTED_OK);
});

test('Health photos stay scope_denied even with an injected snapshot', () => {
  const host = createMiniHost({
    photoses: {
      [HEALTH_ID]: GRANTED_SNAP,
      [SHOT_ID]: SHOT_SNAP,
      [GRANTED_ID]: GRANTED_SNAP,
    },
  });
  const health = assertMounted(mountHealthMini(host));
  const shot = assertMounted(mountClearShotMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));

  assert.deepEqual(health.photos.read(), SCOPE_DENIED);
  assert.deepEqual(health.photos.write(), SCOPE_DENIED);
  assert.deepEqual(host.call(HEALTH_ID, 'photos', 'read'), SCOPE_DENIED);
  assert.deepEqual(host.call(HEALTH_ID, 'photos', 'write'), SCOPE_DENIED);
  assert.deepEqual(shot.photos.read(), SHOT_OK);
  assert.deepEqual(granted.photos.read(), GRANTED_OK);
});

test('ClearShot without a snapshot stays photos_stub — undeclared Health stays denied', () => {
  const host = createMiniHost({
    photoses: {
      [GRANTED_ID]: GRANTED_SNAP,
    },
  });
  const health = assertMounted(mountHealthMini(host));
  const shot = assertMounted(mountClearShotMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));

  assert.deepEqual(health.photos.read(), SCOPE_DENIED);
  assert.deepEqual(health.photos.write(), SCOPE_DENIED);
  assert.deepEqual(shot.photos.read(), PHOTOS_STUB);
  assert.deepEqual(shot.photos.write(), PHOTOS_STUB);
  assert.deepEqual(granted.photos.read(), GRANTED_OK);
});

test('identity isolation (.1093) stays while both photos mounts live', () => {
  const host = createMiniHost({
    identities: {
      [HEALTH_ID]: HEALTH_SNAP,
      [GRANTED_ID]: GRANTED_ID_SNAP,
    },
    photoses: {
      [SHOT_ID]: SHOT_SNAP,
      [GRANTED_ID]: GRANTED_SNAP,
    },
  });
  const health = assertMounted(mountHealthMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));
  const shot = assertMounted(mountClearShotMini(host));

  assert.deepEqual(health.identity.read(), {
    ok: true,
    value: { missionId: 11, callSign: 'alpha' },
  });
  assert.deepEqual(granted.identity.read(), {
    ok: true,
    value: { missionId: 22, callSign: 'bravo' },
  });
  injectIdentitySnapshot(health.identity, { missionId: 33, callSign: 'alpha-2' });
  assert.deepEqual(granted.identity.read(), {
    ok: true,
    value: { missionId: 22, callSign: 'bravo' },
  });
  assert.deepEqual(shot.photos.read(), SHOT_OK);
  assert.deepEqual(granted.photos.read(), GRANTED_OK);
});

test('billing isolation (.1094) stays while both photos mounts live', () => {
  const host = createMiniHost({
    billings: {
      [BILLING_ID]: BILLING_SNAP,
      [GRANTED_ID]: GRANTED_BILLING,
    },
    photoses: {
      [SHOT_ID]: SHOT_SNAP,
      [GRANTED_ID]: GRANTED_SNAP,
    },
  });
  const billing = assertMounted(mountTestBillingMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));
  const shot = assertMounted(mountClearShotMini(host));

  assert.deepEqual(billing.billing.read(), {
    ok: true,
    value: { bundle: 'none', muted: true },
  });
  assert.deepEqual(granted.billing.read(), {
    ok: true,
    value: { bundle: 'super', muted: true },
  });
  injectBillingSnapshot(billing.billing, { bundle: 'super', muted: false });
  assert.deepEqual(granted.billing.read(), {
    ok: true,
    value: { bundle: 'super', muted: true },
  });
  assert.deepEqual(shot.photos.read(), SHOT_OK);
  assert.deepEqual(granted.photos.read(), GRANTED_OK);
});

test('storage isolation (.1092) stays while both photos mounts live', () => {
  const host = createMiniHost({
    photoses: {
      [SHOT_ID]: SHOT_SNAP,
      [GRANTED_ID]: GRANTED_SNAP,
    },
  });
  const health = assertMounted(mountHealthMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));

  assert.deepEqual(health.storage.set(KEY, HEALTH_VALUE), SET_OK);
  assert.deepEqual(granted.storage.set(KEY, GRANTED_VALUE), SET_OK);
  assert.deepEqual(health.storage.get(KEY), { ok: true, value: HEALTH_VALUE });
  assert.deepEqual(granted.storage.get(KEY), { ok: true, value: GRANTED_VALUE });
  const cross = granted.storage.get(KEY);
  if (!cross.ok) return;
  assert.notEqual(cross.value, HEALTH_VALUE);
  assert.deepEqual(granted.photos.read(), GRANTED_OK);
});

test('known-method envelopes stay .1079–.1094 while both live', () => {
  const host = createMiniHost({
    identities: {
      [HEALTH_ID]: HEALTH_SNAP,
      [GRANTED_ID]: GRANTED_ID_SNAP,
    },
    billings: {
      [BILLING_ID]: BILLING_SNAP,
      [GRANTED_ID]: GRANTED_BILLING,
    },
    photoses: {
      [SHOT_ID]: SHOT_SNAP,
      [GRANTED_ID]: GRANTED_SNAP,
    },
  });
  const health = assertMounted(mountHealthMini(host));
  const shot = assertMounted(mountClearShotMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));
  const billing = assertMounted(mountTestBillingMini(host));

  assert.deepEqual(health.identity.read(), {
    ok: true,
    value: { missionId: 11, callSign: 'alpha' },
  });
  assert.deepEqual(health.billing.read(), SCOPE_DENIED);
  assert.deepEqual(health.photos.read(), SCOPE_DENIED);
  assert.deepEqual(shot.photos.read(), SHOT_OK);
  assert.deepEqual(shot.billing.read(), SCOPE_DENIED);
  assert.deepEqual(shot.storage.get(KEY), SCOPE_DENIED);
  assert.deepEqual(billing.billing.read(), {
    ok: true,
    value: { bundle: 'none', muted: true },
  });
  assert.deepEqual(granted.billing.read(), {
    ok: true,
    value: { bundle: 'super', muted: true },
  });
  assert.notDeepEqual(shot.photos.read(), granted.photos.read());
  assert.deepEqual(granted.photos.read(), GRANTED_OK);
  assert.deepEqual(host.call(HEALTH_ID, 'identity', 'foo'), UNKNOWN_METHOD);
  assert.deepEqual(host.call(HEALTH_ID, 'billing', 'read'), SCOPE_DENIED);
  assert.deepEqual(mountHealthMini(host), ALREADY_MOUNTED);
  assert.deepEqual(host.mount('totally.unknown'), UNKNOWN);
  assert.deepEqual(host.unmount('utility.probe'), NOT_MOUNTED);
  assert.deepEqual(resolveMiniDeeplink('https://evil'), BAD_DEEPLINK);
  assert.deepEqual(resolveMiniDeeplink('mission://minis/totally-unknown'), UNKNOWN);
  assert.deepEqual(granted.storage.get(KEY), MISS);
});

test('docs/harness/HOP.md stays the empty template', () => {
  const hop = readFileSync(path.join(here, '..', '..', '..', 'docs', 'harness', 'HOP.md'), 'utf8');
  assert.match(hop, /^# Live hop\n/);
  assert.match(hop, /^ticket:\n/m);
  assert.match(hop, /^done_means:\n/m);
  assert.match(hop, /^accept:\n/m);
  assert.equal(hop.includes('1095'), false);
  assert.equal(hop.includes('photos isolation'), false);
  assert.equal(hop.includes('utility.clearshot'), false);
});

test('host binds per-mini photos — inject hook is fake-only', () => {
  const src = sourceOf('host.ts');
  assert.equal(src.includes('photosSnapshotFor(opts, manifest.id)'), true);
  assert.equal(src.includes('opts.photoses'), true);
  assert.equal(src.includes('injectPhotosSnapshot'), true);
  assert.equal(/from\s+['"][^'"]*stripe/i.test(src), false);
  assert.equal(src.includes('premiumServer'), false);
  assert.equal(/from\s+['"][^'"]*supabase/i.test(src), false);
  assert.equal(src.includes('createClient'), false);
  assert.equal(src.includes('getUserMedia'), false);
  assert.equal(/android\.provider\.MediaStore/i.test(src), false);
  assert.equal(src.includes('apps/android'), false);
  assert.equal(src.includes('ImagePicker'), false);
  assert.equal(src.includes('progressPhotos'), false);

  const fakeSrc = sourceOf('fakes.ts');
  assert.equal(fakeSrc.includes('export function injectPhotosSnapshot'), true);
  assert.equal(fakeSrc.includes('copyPhotos'), true);
  assert.equal(fakeSrc.includes('getUserMedia'), false);
  assert.equal(/android\.provider\.MediaStore/i.test(fakeSrc), false);
  assert.equal(/expo-camera/i.test(fakeSrc), false);
});
