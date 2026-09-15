/**
 * Dual-mount CapResult identity isolation.
 *
 * Judge ≠ builder: snapshots and deny codes are hardcoded here — not
 * read back from GUEST_IDENTITY / HEALTH_MINI_SCOPES. A shared host-wide
 * object, or inject-A rewriting B.read, would mean the host grew one
 * identity for every mounted mini.
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

function sourceOf(file: string): string {
  return readFileSync(path.join(here, file), 'utf8');
}

const HEALTH_ID = 'l1.health';
const GRANTED_ID = 'test.granted';
const NOIDENTITY_ID = 'test.noidentity';

const HEALTH_SNAP = { missionId: 11, callSign: 'alpha' };
const GRANTED_SNAP = { missionId: 22, callSign: 'bravo' };
const SHOT_SNAP = { missionId: 44, callSign: 'shot' };
const HEALTH_OVERRIDE = { missionId: 33, callSign: 'alpha-2' };

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

test('Health read is not test.granted read — hardcoded envelopes', () => {
  const host = createMiniHost({
    identities: {
      [HEALTH_ID]: HEALTH_SNAP,
      [GRANTED_ID]: GRANTED_SNAP,
    },
  });
  const health = assertMounted(mountHealthMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));

  const a = health.identity.read();
  const b = granted.identity.read();
  assert.deepEqual(a, HEALTH_OK);
  assert.deepEqual(b, GRANTED_OK);
  assert.notDeepEqual(a, b);
  if (!a.ok || !b.ok) return;
  assert.notEqual(a.value.missionId, b.value.missionId);
  assert.notEqual(a.value.callSign, b.value.callSign);

  assert.deepEqual(host.call(HEALTH_ID, 'identity', 'read'), HEALTH_OK);
  assert.deepEqual(host.call(GRANTED_ID, 'identity', 'read'), GRANTED_OK);
});

test('ClearShot read is not Health read when both live', () => {
  const host = createMiniHost({
    identities: {
      [HEALTH_ID]: HEALTH_SNAP,
      'utility.clearshot': SHOT_SNAP,
    },
  });
  const health = assertMounted(mountHealthMini(host));
  const shot = assertMounted(mountClearShotMini(host));

  assert.deepEqual(health.identity.read(), HEALTH_OK);
  assert.deepEqual(shot.identity.read(), SHOT_OK);
  assert.notDeepEqual(health.identity.read(), shot.identity.read());
});

test('injecting Health snapshot does not alter test.granted read', () => {
  const host = createMiniHost({
    identities: {
      [HEALTH_ID]: HEALTH_SNAP,
      [GRANTED_ID]: GRANTED_SNAP,
    },
  });
  const health = assertMounted(mountHealthMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));

  injectIdentitySnapshot(health.identity, HEALTH_OVERRIDE);

  assert.deepEqual(health.identity.read(), HEALTH_OVERRIDE_OK);
  assert.deepEqual(granted.identity.read(), GRANTED_OK);
  assert.deepEqual(host.call(GRANTED_ID, 'identity', 'read'), GRANTED_OK);
  const b = granted.identity.read();
  if (!b.ok) return;
  assert.notEqual(b.value.missionId, HEALTH_OVERRIDE.missionId);
  assert.notEqual(b.value.callSign, HEALTH_OVERRIDE.callSign);
});

test('mutating the injected Health object after mount does not change granted', () => {
  const healthSnap = { missionId: 11, callSign: 'alpha' };
  const grantedSnap = { missionId: 22, callSign: 'bravo' };
  const host = createMiniHost({
    identities: {
      [HEALTH_ID]: healthSnap,
      [GRANTED_ID]: grantedSnap,
    },
  });
  const health = assertMounted(mountHealthMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));

  healthSnap.missionId = 99;
  healthSnap.callSign = 'mutated';

  assert.deepEqual(health.identity.read(), HEALTH_OK);
  assert.deepEqual(granted.identity.read(), GRANTED_OK);
});

test('test.noidentity read stays scope_denied even with an injected snapshot', () => {
  const host = createMiniHost({
    identities: {
      [NOIDENTITY_ID]: HEALTH_SNAP,
      [HEALTH_ID]: HEALTH_SNAP,
    },
  });
  const denied = assertMounted(mountTestNoIdentityMini(host));
  const health = assertMounted(mountHealthMini(host));

  assert.deepEqual(denied.identity.read(), SCOPE_DENIED);
  assert.deepEqual(host.call(NOIDENTITY_ID, 'identity', 'read'), SCOPE_DENIED);
  assert.deepEqual(health.identity.read(), HEALTH_OK);
});

test('storage isolation (.1092) stays while both identity mounts live', () => {
  const host = createMiniHost({
    identities: {
      [HEALTH_ID]: HEALTH_SNAP,
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
  assert.deepEqual(health.identity.read(), HEALTH_OK);
  assert.deepEqual(granted.identity.read(), GRANTED_OK);
});

test('known-method envelopes stay .1079–.1092 while both live', () => {
  const host = createMiniHost({
    identities: {
      [HEALTH_ID]: HEALTH_SNAP,
      [GRANTED_ID]: GRANTED_SNAP,
    },
  });
  const health = assertMounted(mountHealthMini(host));
  const shot = assertMounted(mountClearShotMini(host));
  const granted = assertMounted(mountTestGrantedMini(host));

  assert.deepEqual(health.identity.read(), HEALTH_OK);
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
  assert.deepEqual(granted.storage.get(KEY), MISS);
});

test('docs/harness/HOP.md stays the empty template', () => {
  const hop = readFileSync(path.join(here, '..', '..', '..', 'docs', 'harness', 'HOP.md'), 'utf8');
  assert.match(hop, /^# Live hop\n/);
  assert.match(hop, /^ticket:\n/m);
  assert.match(hop, /^done_means:\n/m);
  assert.match(hop, /^accept:\n/m);
  assert.equal(hop.includes('1093'), false);
  assert.equal(hop.includes('identity isolation'), false);
  assert.equal(hop.includes('l1.health'), false);
});

test('host binds per-mini identity — inject hook is fake-only', () => {
  const src = sourceOf('host.ts');
  assert.equal(src.includes('snapshotFor(opts, manifest.id)'), true);
  assert.equal(src.includes('opts.identities'), true);
  assert.equal(src.includes('injectIdentitySnapshot'), true);
  assert.equal(/from\s+['"][^'"]*supabase/i.test(src), false);
  assert.equal(src.includes('createClient'), false);
  assert.equal(src.includes('premiumServer'), false);
  assert.equal(/from\s+['"][^'"]*stripe/i.test(src), false);
  assert.equal(src.includes('getUserMedia'), false);
  assert.equal(/android\.provider\.MediaStore/i.test(src), false);
  assert.equal(src.includes('apps/android'), false);
  assert.equal(src.includes('AuthProvider'), false);

  const fakeSrc = sourceOf('fakes.ts');
  assert.equal(fakeSrc.includes('export function injectIdentitySnapshot'), true);
  assert.equal(fakeSrc.includes('copyIdentity'), true);
  assert.equal(/from\s+['"][^'"]*supabase/i.test(fakeSrc), false);
  assert.equal(fakeSrc.includes('createClient'), false);
  assert.equal(/signInWith/i.test(fakeSrc), false);
});
