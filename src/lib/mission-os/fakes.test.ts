import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  HEALTH_TRAIN_MANIFEST,
  MUTED_BILLING,
  UTILITY_CLEARSHOT_MANIFEST,
  type ModuleManifest,
  type ModuleScope,
} from '../../../packages/mw-core/src/module';
import {
  MISSION_OS_FAKES,
  createBillingFake,
  createBillingHold,
  injectBillingSnapshot,
  createIdentityFake,
  injectIdentitySnapshot,
  createPhotosFake,
  injectPhotosSnapshot,
  createStorageFake,
} from './fakes';

const here = import.meta.dirname;

function sourceOf(file: string): string {
  return readFileSync(path.join(here, file), 'utf8');
}

const HAPPY_SCOPES: readonly ModuleScope[] = [
  'identity.read',
  'billing.read',
  'photos.read',
  'photos.write',
  'storage.read',
  'storage.write',
];

const HAPPY_MANIFEST: ModuleManifest = {
  id: 'utility.probe',
  name: 'Probe',
  version: '0.1.0',
  scopes: HAPPY_SCOPES,
  surfaces: ['web'],
  freeCore: true,
  entry: 'mission://minis/probe',
};

test('four named fakes exist — a missing door is a fail', () => {
  assert.deepEqual([...MISSION_OS_FAKES], [
    'createIdentityFake',
    'createBillingFake',
    'createPhotosFake',
    'createStorageFake',
  ]);
  const src = sourceOf('fakes.ts');
  for (const name of MISSION_OS_FAKES) {
    assert.equal(src.includes(`export function ${name}`), true, `${name} must be exported`);
  }
});

test('identity fake: guest is null; injected snapshot is not minted', () => {
  const guest = createIdentityFake(UTILITY_CLEARSHOT_MANIFEST);
  assert.deepEqual(guest.read(), { ok: true, value: { missionId: null, callSign: null } });

  const injected = createIdentityFake(UTILITY_CLEARSHOT_MANIFEST, {
    missionId: 7,
    callSign: '07',
  });
  assert.deepEqual(injected.read(), { ok: true, value: { missionId: 7, callSign: '07' } });

  const train = createIdentityFake(HEALTH_TRAIN_MANIFEST);
  assert.deepEqual(train.read(), { ok: true, value: { missionId: null, callSign: null } });

  const noIdentity: ModuleManifest = {
    ...HAPPY_MANIFEST,
    scopes: HAPPY_SCOPES.filter((s) => s !== 'identity.read'),
  };
  assert.deepEqual(createIdentityFake(noIdentity).read(), { ok: false, code: 'scope_denied' });
});

test('injectIdentitySnapshot changes only that fake', () => {
  const a = createIdentityFake(UTILITY_CLEARSHOT_MANIFEST, { missionId: 11, callSign: 'alpha' });
  const b = createIdentityFake(UTILITY_CLEARSHOT_MANIFEST, { missionId: 22, callSign: 'bravo' });
  injectIdentitySnapshot(a, { missionId: 33, callSign: 'alpha-2' });
  assert.deepEqual(a.read(), { ok: true, value: { missionId: 33, callSign: 'alpha-2' } });
  assert.deepEqual(b.read(), { ok: true, value: { missionId: 22, callSign: 'bravo' } });
});

test('injectBillingSnapshot changes only that fake', () => {
  const a = createBillingFake(HAPPY_MANIFEST, { bundle: 'none', muted: true });
  const b = createBillingFake(HAPPY_MANIFEST, { bundle: 'super', muted: true });
  injectBillingSnapshot(a, { bundle: 'none', muted: false });
  assert.deepEqual(a.read(), { ok: true, value: { bundle: 'none', muted: true } });
  assert.deepEqual(b.read(), { ok: true, value: { bundle: 'super', muted: true } });
  injectBillingSnapshot(a, { bundle: 'super', muted: false });
  assert.deepEqual(a.read(), { ok: true, value: { bundle: 'super', muted: true } });
  assert.deepEqual(b.read(), { ok: true, value: { bundle: 'super', muted: true } });
  injectBillingSnapshot(b, { bundle: 'none', muted: true });
  assert.deepEqual(b.read(), { ok: true, value: { bundle: 'none', muted: true } });
  assert.deepEqual(a.read(), { ok: true, value: { bundle: 'super', muted: true } });
  assert.deepEqual(a.checkout(), { ok: true, value: { held: true } });
  assert.deepEqual(b.portal(), { ok: true, value: { held: true } });
});

test('billing fake is Stripe HOLD — muted even when the snapshot looks live', () => {
  const hold = createBillingHold();
  assert.deepEqual(hold.read(), { ok: true, value: MUTED_BILLING });

  const scoped = createBillingFake(HAPPY_MANIFEST, { bundle: 'super', muted: false });
  const shot = scoped.read();
  assert.deepEqual(shot, { ok: true, value: { bundle: 'super', muted: true } });
  if (shot.ok) assert.equal(shot.value.muted, true);

  const defaulted = createBillingFake(HAPPY_MANIFEST);
  assert.deepEqual(defaulted.read(), { ok: true, value: { bundle: 'none', muted: true } });

  assert.deepEqual(createBillingFake(UTILITY_CLEARSHOT_MANIFEST).read(), {
    ok: false,
    code: 'scope_denied',
  });
  assert.deepEqual(createBillingFake(UTILITY_CLEARSHOT_MANIFEST).checkout(), {
    ok: false,
    code: 'scope_denied',
  });
  assert.deepEqual(createBillingFake(UTILITY_CLEARSHOT_MANIFEST).portal(), {
    ok: false,
    code: 'scope_denied',
  });

  const granted = createBillingFake(HAPPY_MANIFEST);
  assert.deepEqual(granted.checkout(), { ok: true, value: { held: true } });
  assert.deepEqual(granted.portal(), { ok: true, value: { held: true } });
});

test('photos fake is always photos_stub when scoped', () => {
  const photos = createPhotosFake(UTILITY_CLEARSHOT_MANIFEST);
  assert.deepEqual(photos.read(), { ok: false, code: 'photos_stub' });
  assert.deepEqual(photos.write(), { ok: false, code: 'photos_stub' });
  assert.deepEqual(createPhotosFake(HEALTH_TRAIN_MANIFEST).read(), {
    ok: false,
    code: 'scope_denied',
  });
  assert.deepEqual(createPhotosFake(HEALTH_TRAIN_MANIFEST).write(), {
    ok: false,
    code: 'scope_denied',
  });
});

test('injectPhotosSnapshot changes only that fake', () => {
  const a = createPhotosFake(UTILITY_CLEARSHOT_MANIFEST, { album: 'shot', stub: true });
  const b = createPhotosFake(HAPPY_MANIFEST, { album: 'granted', stub: true });
  injectPhotosSnapshot(a, { album: 'shot', stub: false });
  assert.deepEqual(a.read(), { ok: true, value: { album: 'shot', stub: true } });
  assert.deepEqual(b.read(), { ok: true, value: { album: 'granted', stub: true } });
  injectPhotosSnapshot(a, { album: 'shot-2', stub: false });
  assert.deepEqual(a.read(), { ok: true, value: { album: 'shot-2', stub: true } });
  assert.deepEqual(a.write(), { ok: true, value: { album: 'shot-2', stub: true } });
  assert.deepEqual(b.read(), { ok: true, value: { album: 'granted', stub: true } });
  injectPhotosSnapshot(b, { album: 'shot', stub: true });
  assert.deepEqual(b.read(), { ok: true, value: { album: 'shot', stub: true } });
  assert.deepEqual(a.read(), { ok: true, value: { album: 'shot-2', stub: true } });
});

test('storage fake is in-memory and namespaced by the map the caller owns', () => {
  const store = new Map<string, string>();
  const storage = createStorageFake(HAPPY_MANIFEST, store);
  assert.deepEqual(storage.set('note', 'ok'), { ok: true, value: undefined });
  assert.deepEqual(storage.get('note'), { ok: true, value: 'ok' });
  assert.equal(store.get('note'), 'ok');
  assert.deepEqual(storage.remove('note'), { ok: true, value: undefined });
  assert.deepEqual(storage.get('note'), { ok: true, value: undefined });
  assert.equal(store.has('note'), false);

  const other = createStorageFake(HAPPY_MANIFEST);
  assert.deepEqual(other.get('note'), { ok: true, value: undefined });

  assert.deepEqual(createStorageFake(UTILITY_CLEARSHOT_MANIFEST).get('note'), {
    ok: false,
    code: 'scope_denied',
  });
});

test('fakes never import Stripe, checkout, or premiumServer', () => {
  const src = sourceOf('fakes.ts');
  assert.equal(/from\s+['"][^'"]*stripe/i.test(src), false, 'fakes.ts must not import Stripe');
  assert.equal(src.includes('premiumServer'), false);
  assert.equal(/checkout\.sessions/i.test(src), false);
  assert.equal(src.includes('stripe.com'), false);
});
