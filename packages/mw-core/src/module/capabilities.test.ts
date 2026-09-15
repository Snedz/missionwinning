import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  HEALTH_TRAIN_MANIFEST,
  UTILITY_CLEARSHOT_MANIFEST,
  assertModuleManifest,
} from './types';
import {
  MUTED_BILLING,
  STORAGE_MAX_KEYS,
  STORAGE_MAX_VALUE_BYTES,
  assertCapability,
  checkoutBilling,
  inventoryFromManifest,
  listMountedInventory,
  peekMountedInventory,
  peekMountedScope,
  portalBilling,
  readBilling,
  readIdentity,
  readPhotos,
  readStorage,
  resolveRegisteredMini,
  writePhotos,
  writeStorage,
} from './capabilities';

test('assertCapability allows a listed scope and denies an undeclared one', () => {
  const ok = assertCapability(UTILITY_CLEARSHOT_MANIFEST, 'identity.read');
  assert.deepEqual(ok, { ok: true, value: undefined });

  const denied = assertCapability(UTILITY_CLEARSHOT_MANIFEST, 'health.write');
  assert.deepEqual(denied, { ok: false, code: 'scope_denied' });
});

test('ClearShot reserved row cannot call health.write (mutant: extra scope)', () => {
  assert.equal(UTILITY_CLEARSHOT_MANIFEST.scopes.includes('health.write'), false);
  assert.equal(UTILITY_CLEARSHOT_MANIFEST.scopes.includes('billing.read'), false);
  const hit = assertCapability(UTILITY_CLEARSHOT_MANIFEST, 'health.write');
  assert.equal(hit.ok, false);
  if (!hit.ok) assert.equal(hit.code, 'scope_denied');
});

test('unknown mini id is a typed deny', () => {
  const registry = new Map([[UTILITY_CLEARSHOT_MANIFEST.id, UTILITY_CLEARSHOT_MANIFEST]]);
  const miss = resolveRegisteredMini('utility.unknown', registry);
  assert.deepEqual(miss, { ok: false, code: 'unknown_mini' });
  const hit = resolveRegisteredMini('utility.clearshot', registry);
  assert.equal(hit.ok, true);
});

test('listMounted inventory: declared scopes only; undeclared peek is scope_denied', () => {
  const table = new Map([
    [UTILITY_CLEARSHOT_MANIFEST.id, inventoryFromManifest(UTILITY_CLEARSHOT_MANIFEST)],
  ]);
  const listed = listMountedInventory(table);
  assert.equal(listed.ok, true);
  if (!listed.ok) return;
  assert.equal(listed.value.length, 1);
  assert.equal(listed.value[0]?.id, 'utility.clearshot');
  assert.equal(listed.value[0]?.scopes.includes('billing.read'), false);
  assert.equal(listed.value[0]?.scopes.includes('storage.read'), false);

  assert.deepEqual(listMountedInventory(new Map()), { ok: true, value: [] });
  assert.deepEqual(peekMountedInventory(table, 'utility.probe'), {
    ok: false,
    code: 'unknown_mini',
  });
  assert.deepEqual(peekMountedScope(table, 'utility.probe', 'identity.read'), {
    ok: false,
    code: 'unknown_mini',
  });
  assert.deepEqual(peekMountedScope(table, 'utility.clearshot', 'billing.read'), {
    ok: false,
    code: 'scope_denied',
  });
  assert.deepEqual(peekMountedScope(table, 'utility.clearshot', 'identity.read'), {
    ok: true,
    value: undefined,
  });
});

test('identity stub: guest snapshot is null / null; write is denied', () => {
  const guest = readIdentity(UTILITY_CLEARSHOT_MANIFEST);
  assert.deepEqual(guest, { ok: true, value: { missionId: null, callSign: null } });

  const signed = readIdentity(UTILITY_CLEARSHOT_MANIFEST, {
    missionId: 7,
    callSign: '07',
  });
  assert.deepEqual(signed, { ok: true, value: { missionId: 7, callSign: '07' } });

  const write = assertCapability(UTILITY_CLEARSHOT_MANIFEST, 'identity.write');
  assert.deepEqual(write, { ok: false, code: 'scope_denied' });
});

test('identity: unscoped is the same scope_denied as billing / photos', () => {
  const noIdentity = {
    ...UTILITY_CLEARSHOT_MANIFEST,
    scopes: UTILITY_CLEARSHOT_MANIFEST.scopes.filter((s) => s !== 'identity.read'),
  };
  assert.equal(noIdentity.scopes.includes('identity.read'), false);
  assert.deepEqual(readIdentity(noIdentity), { ok: false, code: 'scope_denied' });
  assert.deepEqual(readIdentity(noIdentity, { missionId: 7, callSign: '07' }), {
    ok: false,
    code: 'scope_denied',
  });
});

test('billing stub: ClearShot has no billing.read; train never needs it to log', () => {
  const clearshot = readBilling(UTILITY_CLEARSHOT_MANIFEST);
  assert.deepEqual(clearshot, { ok: false, code: 'scope_denied' });

  const withScope = {
    ...HEALTH_TRAIN_MANIFEST,
    scopes: [...HEALTH_TRAIN_MANIFEST.scopes, 'billing.read' as const],
  };
  assertModuleManifest(withScope);
  const muted = readBilling(withScope, { bundle: 'super', muted: false });
  assert.deepEqual(muted, { ok: true, value: { bundle: 'super', muted: true } });
  assert.equal(MUTED_BILLING.bundle, 'none');

  assert.deepEqual(checkoutBilling(UTILITY_CLEARSHOT_MANIFEST), {
    ok: false,
    code: 'scope_denied',
  });
  assert.deepEqual(portalBilling(UTILITY_CLEARSHOT_MANIFEST), {
    ok: false,
    code: 'scope_denied',
  });
  assert.deepEqual(checkoutBilling(withScope), { ok: true, value: { held: true } });
  assert.deepEqual(portalBilling(withScope), { ok: true, value: { held: true } });
});

test('photos: scoped stays photos_stub; unscoped is the same scope_denied', () => {
  assert.deepEqual(readPhotos(UTILITY_CLEARSHOT_MANIFEST), {
    ok: false,
    code: 'photos_stub',
  });
  assert.deepEqual(writePhotos(UTILITY_CLEARSHOT_MANIFEST), {
    ok: false,
    code: 'photos_stub',
  });
  assert.deepEqual(readPhotos(HEALTH_TRAIN_MANIFEST), {
    ok: false,
    code: 'scope_denied',
  });
  assert.deepEqual(writePhotos(HEALTH_TRAIN_MANIFEST), {
    ok: false,
    code: 'scope_denied',
  });
});

test('unscoped storage is scope_denied on every method and does not write', () => {
  const store = new Map<string, string>();
  assert.deepEqual(readStorage(HEALTH_TRAIN_MANIFEST, store, 'k'), {
    ok: false,
    code: 'scope_denied',
  });
  assert.deepEqual(writeStorage(HEALTH_TRAIN_MANIFEST, store, 'k', 'v'), {
    ok: false,
    code: 'scope_denied',
  });
  assert.equal(store.has('k'), false);
});

test('allow-path: declared scopes return the existing stub envelopes', () => {
  const granted = {
    ...UTILITY_CLEARSHOT_MANIFEST,
    id: 'utility.probe',
    name: 'Probe',
    entry: 'mission://minis/probe',
    scopes: [
      'identity.read',
      'billing.read',
      'photos.read',
      'photos.write',
      'storage.read',
      'storage.write',
    ] as const,
  };
  assertModuleManifest(granted);

  assert.deepEqual(readIdentity(granted), {
    ok: true,
    value: { missionId: null, callSign: null },
  });
  assert.deepEqual(readBilling(granted), { ok: true, value: { bundle: 'none', muted: true } });
  assert.deepEqual(checkoutBilling(granted), { ok: true, value: { held: true } });
  assert.deepEqual(portalBilling(granted), { ok: true, value: { held: true } });
  assert.deepEqual(readPhotos(granted), { ok: false, code: 'photos_stub' });
  assert.deepEqual(writePhotos(granted), { ok: false, code: 'photos_stub' });

  const store = new Map<string, string>();
  assert.deepEqual(writeStorage(granted, store, 'note', 'ok'), { ok: true, value: undefined });
  assert.deepEqual(readStorage(granted, store, 'note'), { ok: true, value: 'ok' });
});

test('storage write is capped; ClearShot cannot read without storage.read', () => {
  const store = new Map<string, string>();
  const wrote = writeStorage(UTILITY_CLEARSHOT_MANIFEST, store, 'k', 'v');
  assert.deepEqual(wrote, { ok: true, value: undefined });
  assert.equal(store.get('k'), 'v');

  const readDenied = readStorage(UTILITY_CLEARSHOT_MANIFEST, store, 'k');
  assert.deepEqual(readDenied, { ok: false, code: 'scope_denied' });

  const tooBig = writeStorage(
    UTILITY_CLEARSHOT_MANIFEST,
    store,
    'big',
    'x'.repeat(STORAGE_MAX_VALUE_BYTES + 1)
  );
  assert.deepEqual(tooBig, { ok: false, code: 'storage_cap' });

  const reader = {
    ...UTILITY_CLEARSHOT_MANIFEST,
    scopes: [...UTILITY_CLEARSHOT_MANIFEST.scopes, 'storage.read' as const],
  };
  const filled = new Map<string, string>();
  for (let i = 0; i < STORAGE_MAX_KEYS; i++) {
    assert.equal(writeStorage(reader, filled, `k${i}`, 'v').ok, true);
  }
  const overflow = writeStorage(reader, filled, 'overflow', 'v');
  assert.deepEqual(overflow, { ok: false, code: 'storage_cap' });
  const overwrite = writeStorage(reader, filled, 'k0', 'replaced');
  assert.deepEqual(overwrite, { ok: true, value: undefined });
});
