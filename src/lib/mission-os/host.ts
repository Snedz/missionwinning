/**
 * In-memory Mission OS host — mounts a manifest and binds scoped doors.
 *
 * No ClearShot UI. No Today / Train door. No Stripe. Storage is process-local.
 */

import {
  GUEST_IDENTITY,
  MUTED_BILLING,
  assertModuleManifest,
  readBilling,
  readIdentity,
  readPhotos,
  readStorage,
  writePhotos,
  writeStorage,
  type IdentitySnapshot,
  type ModuleManifest,
} from '../../../packages/mw-core/src/module';
import type {
  BillingCapability,
  CapResult,
  IdentityCapability,
  MiniHost,
  MountedMini,
  PhotosCapability,
  StorageCapability,
} from './types';

export type MiniHostOptions = {
  identity?: IdentitySnapshot;
};

function storeFor(stores: Map<string, Map<string, string>>, id: string): Map<string, string> {
  let store = stores.get(id);
  if (!store) {
    store = new Map();
    stores.set(id, store);
  }
  return store;
}

/** Stripe HOLD double — muted recognition only. Never imports Stripe. */
export function createBillingHold(): BillingCapability {
  return {
    read() {
      return { ok: true, value: MUTED_BILLING };
    },
  };
}

function bindDoors(
  manifest: ModuleManifest,
  identity: IdentitySnapshot,
  stores: Map<string, Map<string, string>>
): MountedMini {
  const identityDoor: IdentityCapability = {
    read: () => readIdentity(manifest, identity),
  };
  const billingDoor: BillingCapability = {
    read: () => readBilling(manifest, MUTED_BILLING),
  };
  const photosDoor: PhotosCapability = {
    read: () => readPhotos(manifest),
    write: () => writePhotos(manifest),
  };
  const storageDoor: StorageCapability = {
    get: (key) => readStorage(manifest, storeFor(stores, manifest.id), key),
    set: (key, value) => writeStorage(manifest, storeFor(stores, manifest.id), key, value),
  };
  return {
    manifest,
    identity: identityDoor,
    billing: billingDoor,
    photos: photosDoor,
    storage: storageDoor,
  };
}

export function createMiniHost(opts: MiniHostOptions = {}): MiniHost {
  const identity = opts.identity ?? GUEST_IDENTITY;
  const stores = new Map<string, Map<string, string>>();

  return {
    mount(manifest: ModuleManifest): CapResult<MountedMini> {
      try {
        assertModuleManifest(manifest);
      } catch {
        return { ok: false, code: 'stub' };
      }
      return { ok: true, value: bindDoors(manifest, identity, stores) };
    },
  };
}
