/**
 * Named Mission OS capability doors.
 *
 * One shape: `CapResult` is `CapabilityResult` from mw-core (`.1068` / #935).
 * This folder is the interface host (`MiniHost.mount` / `MiniHost.unmount` /
 * `MiniHost.listMounted` / `MiniHost.call`).
 * Host-lifecycle deny codes are frozen (`.1098`).
 * The function bus stays in `src/lib/minis/`. Stripe stays HOLD — no checkout here.
 */

import type {
  BillingActionHold,
  BillingSnapshot,
  CapabilityResult,
  IdentitySnapshot,
  MiniInventoryEntry,
  ModuleManifest,
  ModuleScope,
  PhotosSnapshot,
} from '../../../packages/mw-core/src/module';

export type CapResult<T> = CapabilityResult<T>;

export type {
  BillingActionHold,
  BillingSnapshot,
  IdentitySnapshot,
  MiniInventoryEntry,
  ModuleManifest,
  PhotosSnapshot,
};

/** Closed billing methods. A fourth name is `unknown_method`, not a silent extra door. */
export const BILLING_METHODS = ['read', 'checkout', 'portal'] as const;
export type BillingMethod = (typeof BILLING_METHODS)[number];

/** Closed photos methods. A third name is `unknown_method`, not a silent extra door. */
export const PHOTOS_METHODS = ['read', 'write'] as const;
export type PhotosMethod = (typeof PHOTOS_METHODS)[number];

/** Closed identity methods. A second name is `unknown_method`, not a silent extra door. */
export const IDENTITY_METHODS = ['read'] as const;
export type IdentityMethod = (typeof IDENTITY_METHODS)[number];

/** Closed storage methods. A fourth name is `unknown_method`, not a silent extra door. */
export const STORAGE_METHODS = ['get', 'set', 'remove'] as const;
export type StorageMethod = (typeof STORAGE_METHODS)[number];

/** Closed door set. A fifth name is `unknown_capability`, not a silent extra door. */
export const MISSION_OS_CAPABILITIES = ['identity', 'billing', 'photos', 'storage'] as const;
export type MissionOsDoor = (typeof MISSION_OS_CAPABILITIES)[number];

/** Optional args for host-level `call` / `callDoor` (storage get/set). */
export type CallDoorArgs = {
  key?: string;
  value?: string;
};

/**
 * Identity stub — interface only. Scoped minis get the injected snapshot
 * for that mount (host-wide default, or fake-only per-mini override).
 * Unscoped minis get the same CapResult deny as billing (`scope_denied`).
 * Remount after inject rebinds the host snapshot (`.1102`).
 * Never mint. Never auth UI. Never Supabase.
 */
export interface IdentityCapability {
  read(): CapResult<IdentitySnapshot>;
}

/**
 * Stripe HOLD — interface only. No checkout, no Stripe I/O, no new SKU.
 * A hold double may report muted Super Bundle recognition for that mount
 * (host-wide default, or fake-only per-mini override). Never gates `logSet`.
 */
export interface BillingCapability {
  read(): CapResult<BillingSnapshot>;
  /** Stripe HOLD — stub success when scoped. Never a checkout session. */
  checkout(): CapResult<BillingActionHold>;
  /** Stripe HOLD — stub success when scoped. Never a portal URL. */
  portal(): CapResult<BillingActionHold>;
}

/**
 * Photos stub — interface only. No snapshot → scoped stays `photos_stub`.
 * Injected snapshot → isolated stub envelope for that mount (host-wide
 * default, or fake-only per-mini override). Unscoped minis get the same
 * CapResult deny as billing (`scope_denied`). Never camera. Never a
 * gallery write. Never Android wiring.
 */
export interface PhotosCapability {
  read(): CapResult<PhotosSnapshot>;
  write(): CapResult<PhotosSnapshot>;
}

/**
 * Closed to `STORAGE_METHODS`. A fourth method is a new PR.
 * Unscoped minis get the same CapResult deny as billing (`scope_denied`).
 * Scoped minis use the in-memory map. Overflow is `storage_cap` (`.1097`).
 * Remount after that refuse starts empty (`.1099`).
 * `remove` deletes one key when `storage.write` is declared (`.1100`).
 * Never a durable browser write.
 */
export interface StorageCapability {
  get(key: string): CapResult<string | undefined>;
  set(key: string, value: string): CapResult<void>;
  remove(key: string): CapResult<void>;
}

export interface MountedMini {
  manifest: ModuleManifest;
  identity: IdentityCapability;
  billing: BillingCapability;
  photos: PhotosCapability;
  storage: StorageCapability;
}

export interface MiniHost {
  /**
   * Id-only refuse. Unknown id → `unknown_mini`. Does not throw.
   * Does not create a partial mount. Known ids still take a manifest.
   */
  mount(id: string): CapResult<MountedMini>;
  /**
   * Bind a known valid manifest. Unknown id → `unknown_mini`.
   * A second mount of the same id while mounted is `already_mounted`
   * — does not replace the live instance.
   */
  mount(manifest: ModuleManifest): CapResult<MountedMini>;
  /**
   * In-memory teardown. Not currently mounted → `not_mounted`.
   * Does not throw. Clears that mini's fake keyspace — including after
   * a `storage_cap` refuse, so remount is not still capped (`.1099`).
   */
  unmount(id: string): CapResult<void>;
  /** Inventory of currently mounted minis — id + declared scopes only. */
  listMounted(): CapResult<readonly MiniInventoryEntry[]>;
  /** Peek one mounted mini. Never-mounted → unknown_mini. */
  listMounted(id: string): CapResult<MiniInventoryEntry>;
  /**
   * Peek a declared scope. Never-mounted → unknown_mini.
   * Undeclared → scope_denied.
   */
  listMounted(id: string, scope: ModuleScope): CapResult<void>;
  /**
   * Dispatch a closed-door method by mini id.
   * Not currently mounted → `not_mounted`. Does not throw.
   * Does not auto-mount. A door name outside the closed set is
   * `unknown_capability`. Mounted ids keep `.1079`–`.1095` envelopes
   * on known doors.
   */
  call(
    id: string,
    door: string,
    method: string,
    args?: CallDoorArgs
  ): CapResult<unknown>;
}
