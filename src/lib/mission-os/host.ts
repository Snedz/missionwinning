/**
 * In-memory Mission OS host — mounts a known manifest and binds scoped doors.
 * An id outside the closed allowlist is `unknown_mini` (no partial mount).
 * A second mount of the same id while mounted is `already_mounted`.
 * `unmount(id)` tears down that mini's fake keyspace so a remount cannot
 * read leftovers. After a `storage_cap` refuse, remount still starts
 * empty — no leftover overflow occupancy (`.1099`). Two live mounts
 * keep isolated maps — set on A is invisible to get on B; unmount A
 * does not wipe B (`.1092`).
 * Two live mounts with identity scope keep isolated snapshots —
 * A's `identity.read` is not B's; injecting A does not change B (`.1093`).
 * Remount after inject rebinds the host snapshot — leftover inject
 * dies; B.read stays (`.1102`).
 * Two live mounts with billing scope keep isolated muted snapshots —
 * A's `billing.read` is not B's; injecting A does not change B (`.1094`).
 * Remount after billing inject rebinds the host muted snapshot —
 * leftover inject dies; B.read stays (`.1103`).
 * Two live mounts with photos scope keep isolated stub snapshots —
 * A's `photos.read` is not B's; injecting A does not change B (`.1095`).
 * Remount after photos inject rebinds the host stub snapshot —
 * leftover inject dies; B.read stays (`.1107`).
 * Remount leftover old-fake storage writes die — set/remove on the
 * unmounted fake does not write remounted; B untouched (`.1108`).
 * Bind copies + freezes scopes. Leftover extras on a Health-shaped
 * manifest cannot grant billing — live or remount (`.1109`).
 * An id that is not currently mounted is `not_mounted`
 * (not `unknown_mini`) — same code for `call(id, door, method)`.
 * A door name outside the closed set is `unknown_capability` (`.1096`).
 * A scoped storage write over 32 keys / 4KB is `storage_cap` (`.1097`).
 * Remount after that refuse starts empty (`.1099`).
 * Host-lifecycle deny codes are frozen (`.1098`) — no silent ninth code.
 * `listMounted` is the CapResult inventory (ids + declared scopes only).
 * No ClearShot UI. No Today / Train door. No Stripe.
 */

import {
  GUEST_IDENTITY,
  MUTED_BILLING,
  assertModuleManifest,
  inventoryFromManifest,
  listMountedInventory,
  peekMountedInventory,
  peekMountedScope,
  type BillingSnapshot,
  type IdentitySnapshot,
  type MiniInventoryEntry,
  type ModuleManifest,
  type ModuleScope,
  type PhotosSnapshot,
} from '../../../packages/mw-core/src/module';
import {
  createBillingFake,
  createIdentityFake,
  createPhotosFake,
  createStorageFake,
} from './fakes';
import { callMountedDoor } from './call';
import type { CallDoorArgs, CapResult, MiniHost, MountedMini } from './types';

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
  /** Host-wide default snapshot when no per-mini row is set. */
  identity?: IdentitySnapshot;
  /**
   * Fake-only per-mini snapshots keyed by mount id.
   * Not production auth. Not a second user system.
   */
  identities?: Readonly<Partial<Record<string, IdentitySnapshot>>>;
  /** Host-wide default muted billing snapshot when no per-mini row is set. */
  billing?: BillingSnapshot;
  /**
   * Fake-only per-mini billing snapshots keyed by mount id.
   * Not Stripe. Not a live checkout.
   */
  billings?: Readonly<Partial<Record<string, BillingSnapshot>>>;
  /** Host-wide default photos snapshot when no per-mini row is set. */
  photos?: PhotosSnapshot;
  /**
   * Fake-only per-mini photos snapshots keyed by mount id.
   * Not camera. Not MediaStore.
   */
  photoses?: Readonly<Partial<Record<string, PhotosSnapshot>>>;
};

export {
  createBillingFake,
  createBillingHold,
  injectBillingSnapshot,
  createIdentityFake,
  injectIdentitySnapshot,
  createPhotosFake,
  injectPhotosSnapshot,
  createStorageFake,
} from './fakes';

function snapshotFor(opts: MiniHostOptions, id: string): IdentitySnapshot {
  const perMini = opts.identities?.[id];
  if (perMini) return perMini;
  return opts.identity ?? GUEST_IDENTITY;
}

function billingSnapshotFor(opts: MiniHostOptions, id: string): BillingSnapshot {
  const perMini = opts.billings?.[id];
  if (perMini) return perMini;
  return opts.billing ?? MUTED_BILLING;
}

function photosSnapshotFor(opts: MiniHostOptions, id: string): PhotosSnapshot | undefined {
  const perMini = opts.photoses?.[id];
  if (perMini) return perMini;
  return opts.photos;
}

/** Per-mount keyspace. Dual-mount isolation is this map keyed by id. */
function storeFor(stores: Map<string, Map<string, string>>, id: string): Map<string, string> {
  let store = stores.get(id);
  if (!store) {
    store = new Map();
    stores.set(id, store);
  }
  return store;
}

/**
 * Reserved Health scopes. Leftover extras on a Health-shaped
 * document cannot grant billing (`.1109`). Judge ≠ builder: tests
 * hardcode this list; they do not import it as truth.
 */
const HEALTH_BOUND_SCOPES: readonly ModuleScope[] = [
  'identity.read',
  'storage.read',
  'storage.write',
];

/** Copy + freeze scopes. Health pins reserved scopes — extras die. */
function bindManifest(manifest: ModuleManifest): ModuleManifest {
  const scopes = manifest.id === 'l1.health' ? HEALTH_BOUND_SCOPES : manifest.scopes;
  return Object.freeze({
    ...manifest,
    scopes: Object.freeze([...scopes]),
    surfaces: Object.freeze([...manifest.surfaces]),
  });
}

function bindDoors(
  manifest: ModuleManifest,
  identity: IdentitySnapshot,
  billing: BillingSnapshot,
  photos: PhotosSnapshot | undefined,
  stores: Map<string, Map<string, string>>
): MountedMini {
  const bound = bindManifest(manifest);
  return {
    manifest: bound,
    identity: createIdentityFake(bound, identity),
    billing: createBillingFake(bound, billing),
    photos: createPhotosFake(bound, photos),
    storage: createStorageFake(bound, storeFor(stores, bound.id)),
  };
}

export function createMiniHost(opts: MiniHostOptions = {}): MiniHost {
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
      // Remount rebinds identity from host options — leftover inject dies (.1102).
      // Remount rebinds billing from host options — leftover inject dies (.1103).
      // Remount rebinds photos from host options — leftover inject dies (.1107).
      // Remount binds a new store — leftover set/remove on the old fake dies (.1108).
      // Bind copies + freezes scopes. Health leftover extras cannot grant billing (.1109).
      const mini = bindDoors(
        manifest,
        snapshotFor(opts, manifest.id),
        billingSnapshotFor(opts, manifest.id),
        photosSnapshotFor(opts, manifest.id),
        stores
      );
      mounted.set(manifest.id, inventoryFromManifest(mini.manifest));
      instances.set(manifest.id, mini);
      return { ok: true, value: mini };
    },
    unmount(id: string): CapResult<void> {
      if (!mounted.has(id)) return { ok: false, code: 'not_mounted' };
      // Drop occupancy even after a storage_cap refuse so remount is not still capped (.1099).
      // Detach the map so leftover set/remove on the old fake cannot write remounted (.1108).
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
      door: string,
      method: string,
      args: CallDoorArgs = {}
    ): CapResult<unknown> {
      return callMountedDoor(instances, id, door, method, args);
    },
  };
}
