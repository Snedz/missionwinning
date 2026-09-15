/**
 * In-memory Mission OS host — mounts a manifest and binds scoped doors.
 * `unmount(id)` tears down that mini's fake keyspace so a remount cannot
 * read leftovers. No ClearShot UI. No Today / Train door. No Stripe.
 */

import {
  GUEST_IDENTITY,
  assertModuleManifest,
  type IdentitySnapshot,
  type ModuleManifest,
} from '../../../packages/mw-core/src/module';
import {
  createBillingFake,
  createIdentityFake,
  createPhotosFake,
  createStorageFake,
} from './fakes';
import type { CapResult, MiniHost, MountedMini } from './types';

export type MiniHostOptions = {
  identity?: IdentitySnapshot;
};

export {
  createBillingFake,
  createBillingHold,
  createIdentityFake,
  createPhotosFake,
  createStorageFake,
} from './fakes';

function storeFor(stores: Map<string, Map<string, string>>, id: string): Map<string, string> {
  let store = stores.get(id);
  if (!store) {
    store = new Map();
    stores.set(id, store);
  }
  return store;
}

function bindDoors(
  manifest: ModuleManifest,
  identity: IdentitySnapshot,
  stores: Map<string, Map<string, string>>
): MountedMini {
  return {
    manifest,
    identity: createIdentityFake(manifest, identity),
    billing: createBillingFake(manifest),
    photos: createPhotosFake(manifest),
    storage: createStorageFake(manifest, storeFor(stores, manifest.id)),
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
    unmount(id: string): CapResult<void> {
      const store = stores.get(id);
      if (!store) return { ok: false, code: 'unknown_mini' };
      store.clear();
      stores.delete(id);
      return { ok: true, value: undefined };
    },
  };
}
