/**
 * In-memory Mission OS host — mounts a known manifest and binds scoped doors.
 * An id outside the closed allowlist is `unknown_mini` (no partial mount).
 * A second mount of the same id while mounted is `already_mounted`.
 * `unmount(id)` tears down that mini's fake keyspace so a remount cannot
 * read leftovers. An id that is not currently mounted is `not_mounted`
 * (not `unknown_mini`) — same code for `call(id, door, method)`.
 * `listMounted` is the CapResult inventory (ids + declared scopes only).
 * No ClearShot UI. No Today / Train door. No Stripe.
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
import { callMountedDoor } from './call';
import type { CallDoorArgs, CapResult, MiniHost, MissionOsDoor, MountedMini } from './types';

/**
 * Closed host allowlist. Product stubs + existing test fixtures only.
 * A new id is a new PR — not a silent mount. Not `MINI_REGISTRY`.
 */
export const HOST_MOUNT_ALLOWLIST: ReadonlySet<string> = new Set([
  'l1.health',
  'utility.clearshot',
  'health.train',
  'test.billing',
  'test.noidentity',
  'test.nostorage',
  'test.granted',
  'utility.probe',
  'utility.other',
]);

export function isKnownMountId(id: string): boolean {
  return HOST_MOUNT_ALLOWLIST.has(id);
}

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
  const instances = new Map<string, MountedMini>();

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
    mount(target: string | ModuleManifest): CapResult<MountedMini> {
      if (typeof target === 'string') {
        if (mounted.has(target)) return { ok: false, code: 'already_mounted' };
        return { ok: false, code: 'unknown_mini' };
      }
      const manifest = target;
      try {
        assertModuleManifest(manifest);
      } catch {
        return { ok: false, code: 'stub' };
      }
      if (!isKnownMountId(manifest.id)) {
        return { ok: false, code: 'unknown_mini' };
      }
      if (mounted.has(manifest.id)) {
        return { ok: false, code: 'already_mounted' };
      }
      const mini = bindDoors(manifest, identity, stores);
      mounted.set(manifest.id, inventoryFromManifest(manifest));
      instances.set(manifest.id, mini);
      return { ok: true, value: mini };
    },
    unmount(id: string): CapResult<void> {
      if (!mounted.has(id)) return { ok: false, code: 'not_mounted' };
      const store = stores.get(id);
      if (store) {
        store.clear();
        stores.delete(id);
      }
      mounted.delete(id);
      instances.delete(id);
      return { ok: true, value: undefined };
    },
    listMounted,
    call(
      id: string,
      door: MissionOsDoor,
      method: string,
      args: CallDoorArgs = {}
    ): CapResult<unknown> {
      return callMountedDoor(instances, id, door, method, args);
    },
  };
}
