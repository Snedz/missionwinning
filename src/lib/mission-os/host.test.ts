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
  createBillingFake,
  createBillingHold,
  createIdentityFake,
  createMiniHost,
  createPhotosFake,
  createStorageFake,
} from './host';
import {
  MISSION_OS_CAPABILITIES,
  type BillingCapability,
  type CapResult,
  type IdentityCapability,
  type MiniHost,
  type PhotosCapability,
  type StorageCapability,
} from './types';

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

/** Fully-scoped probe — not a product mini. ClearShot stays reserved without billing.read. */
const HAPPY_MANIFEST: ModuleManifest = {
  id: 'utility.probe',
  name: 'Probe',
  version: '0.1.0',
  scopes: HAPPY_SCOPES,
  surfaces: ['web'],
  freeCore: true,
  entry: 'mission://minis/probe',
};

test('MiniHost.mount happy path: all four in-memory fakes', () => {
  const host = createMiniHost({ identity: { missionId: 7, callSign: '07' } });
  const mounted = host.mount(HAPPY_MANIFEST);
  assert.equal(mounted.ok, true);
  if (!mounted.ok) return;

  assert.deepEqual(mounted.value.identity.read(), {
    ok: true,
    value: { missionId: 7, callSign: '07' },
  });
  assert.deepEqual(mounted.value.billing.read(), {
    ok: true,
    value: { bundle: 'none', muted: true },
  });
  assert.deepEqual(mounted.value.photos.read(), { ok: false, code: 'photos_stub' });
  assert.deepEqual(mounted.value.photos.write(), { ok: false, code: 'photos_stub' });
  assert.deepEqual(mounted.value.storage.set('note', 'ok'), { ok: true, value: undefined });
  assert.deepEqual(mounted.value.storage.get('note'), { ok: true, value: 'ok' });

  const identity = createIdentityFake(HAPPY_MANIFEST, { missionId: 7, callSign: '07' });
  const billing = createBillingFake(HAPPY_MANIFEST);
  const photos = createPhotosFake(HAPPY_MANIFEST);
  assert.deepEqual(mounted.value.identity.read(), identity.read());
  assert.deepEqual(mounted.value.billing.read(), billing.read());
  assert.deepEqual(mounted.value.photos.read(), photos.read());
  assert.deepEqual(createStorageFake(HAPPY_MANIFEST).get('note'), {
    ok: true,
    value: undefined,
  });

  const hostSrc = sourceOf('host.ts');
  assert.equal(hostSrc.includes('createIdentityFake(manifest'), true);
  assert.equal(hostSrc.includes('createBillingFake(manifest'), true);
  assert.equal(hostSrc.includes('createPhotosFake(manifest'), true);
  assert.equal(hostSrc.includes('createStorageFake(manifest'), true);
});

test('CapResult and the four doors are the host contract', () => {
  assert.deepEqual([...MISSION_OS_CAPABILITIES], [
    'identity',
    'billing',
    'photos',
    'storage',
  ]);
  const host: MiniHost = createMiniHost();
  const mounted = host.mount(UTILITY_CLEARSHOT_MANIFEST);
  assert.equal(mounted.ok, true);
  if (!mounted.ok) return;

  const identity: IdentityCapability = mounted.value.identity;
  const billing: BillingCapability = mounted.value.billing;
  const photos: PhotosCapability = mounted.value.photos;
  const storage: StorageCapability = mounted.value.storage;

  const guest: CapResult<{ missionId: number | null; callSign: string | null }> = identity.read();
  assert.deepEqual(guest, { ok: true, value: { missionId: null, callSign: null } });
  assert.deepEqual(billing.read(), { ok: false, code: 'scope_denied' });
  assert.deepEqual(photos.read(), { ok: false, code: 'photos_stub' });
  assert.deepEqual(photos.write(), { ok: false, code: 'photos_stub' });
  assert.deepEqual(storage.set('note', 'ok'), { ok: true, value: undefined });
  assert.deepEqual(storage.get('note'), { ok: false, code: 'scope_denied' });
});

test('injected identity never mints; guests stay null', () => {
  const host = createMiniHost({ identity: { missionId: 12, callSign: '12' } });
  const mounted = host.mount(UTILITY_CLEARSHOT_MANIFEST);
  assert.equal(mounted.ok, true);
  if (!mounted.ok) return;
  assert.deepEqual(mounted.value.identity.read(), {
    ok: true,
    value: { missionId: 12, callSign: '12' },
  });
});

test('invalid ClearShot entry cannot mount (mutant: /active)', () => {
  const host = createMiniHost();
  const bad = host.mount({
    ...UTILITY_CLEARSHOT_MANIFEST,
    entry: '/active',
  });
  assert.deepEqual(bad, { ok: false, code: 'stub' });
});

test('ClearShot cannot call health.write or billing through mount', () => {
  const host = createMiniHost();
  const mounted = host.mount(UTILITY_CLEARSHOT_MANIFEST);
  assert.equal(mounted.ok, true);
  if (!mounted.ok) return;
  assert.equal(mounted.value.manifest.scopes.includes('health.write'), false);
  assert.deepEqual(mounted.value.billing.read(), { ok: false, code: 'scope_denied' });
});

test('BillingCapability hold is muted and never Stripe', () => {
  const hold: BillingCapability = createBillingHold();
  assert.deepEqual(hold.read(), { ok: true, value: MUTED_BILLING });
  assert.deepEqual(hold.checkout(), { ok: true, value: { held: true } });
  assert.deepEqual(hold.portal(), { ok: true, value: { held: true } });

  const withScope = {
    ...HEALTH_TRAIN_MANIFEST,
    scopes: [...HEALTH_TRAIN_MANIFEST.scopes, 'billing.read' as const],
  };
  const host = createMiniHost();
  const mounted = host.mount(withScope);
  assert.equal(mounted.ok, true);
  if (!mounted.ok) return;
  assert.deepEqual(mounted.value.billing.read(), {
    ok: true,
    value: { bundle: 'none', muted: true },
  });

  for (const file of ['host.ts', 'types.ts', 'fakes.ts']) {
    const src = sourceOf(file);
    assert.equal(
      /from\s+['"][^'"]*stripe/i.test(src),
      false,
      `${file} must not import Stripe`
    );
    assert.equal(src.includes('premiumServer'), false, `${file} must not import premiumServer`);
  }
});

test('storage is namespaced per mini id and stays in memory', () => {
  const host = createMiniHost();
  const reader = {
    ...UTILITY_CLEARSHOT_MANIFEST,
    scopes: [...UTILITY_CLEARSHOT_MANIFEST.scopes, 'storage.read' as const],
  };
  const a = host.mount(reader);
  const b = host.mount({
    ...reader,
    id: 'utility.other',
    name: 'Other',
    entry: 'mission://minis/other',
  });
  assert.equal(a.ok, true);
  assert.equal(b.ok, true);
  if (!a.ok || !b.ok) return;
  assert.equal(a.value.storage.set('note', 'clear').ok, true);
  assert.equal(b.value.storage.set('note', 'other').ok, true);
  assert.deepEqual(a.value.storage.get('note'), { ok: true, value: 'clear' });
  assert.deepEqual(b.value.storage.get('note'), { ok: true, value: 'other' });
});
