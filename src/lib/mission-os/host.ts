/**
 * In-memory Mission OS host — mounts a manifest and binds scoped doors.
 * `unmount(id)` tears down that mini's fake keyspace so a remount cannot
 * read leftovers. `listMounted` is the CapResult inventory (ids + declared
 * scopes only). No ClearShot UI. No Today / Train door. No Stripe.
 */

import {
  GUEST_IDENTITY,
  assertModuleManifest,
  inventoryFromManifest,
  listMountedInventory,
  peekMountedInventory,
  peekMountedScope,
  type IdentitySnapshot,
  type MiniInventoryEntry,
  type ModuleManifest,
  type ModuleScope,
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
  const mounted = new Map<string, MiniInventoryEntry>();

  function listMounted(): CapResult<readonly MiniInventoryEntry[]>;
  function listMounted(id: string): CapResult<MiniInventoryEntry>;
  function listMounted(id: string, scope: ModuleScope): CapResult<void>;
  function listMounted(
    id?: string,
    scope?: ModuleScope
  ): CapResult<readonly MiniInventoryEntry[] | MiniInventoryEntry | void> {
    if (id === undefined) return listMountedInventory(mounted);
    if (scope === undefined) return peekMountedInventory(mounted, id);
    return peekMountedScope(mounted, id, scope);
  }

  return {
    mount(manifest: ModuleManifest): CapResult<MountedMini> {
      try {
        assertModuleManifest(manifest);
      } catch {
        return { ok: false, code: 'stub' };
      }
      mounted.set(manifest.id, inventoryFromManifest(manifest));
      return { ok: true, value: bindDoors(manifest, identity, stores) };
    },
    unmount(id: string): CapResult<void> {
      if (!mounted.has(id)) return { ok: false, code: 'unknown_mini' };
      const store = stores.get(id);
      if (store) {
        store.clear();
        stores.delete(id);
      }
      mounted.delete(id);
      return { ok: true, value: undefined };
    },
    listMounted,
  };
}
