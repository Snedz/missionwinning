/**
 * Named Mission OS capability doors.
 *
 * One shape: `CapResult` is `CapabilityResult` from mw-core (`.1068` / #935).
 * This folder is the interface host (`MiniHost.mount` / `MiniHost.unmount` /
 * `MiniHost.listMounted`).
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
} from '../../../packages/mw-core/src/module';

export type CapResult<T> = CapabilityResult<T>;

export type { BillingActionHold, BillingSnapshot, IdentitySnapshot, MiniInventoryEntry, ModuleManifest };

/** Closed billing methods. A fourth name is `unknown_method`, not a silent extra door. */
export const BILLING_METHODS = ['read', 'checkout', 'portal'] as const;
export type BillingMethod = (typeof BILLING_METHODS)[number];

/** Closed photos methods. A third name is `unknown_method`, not a silent extra door. */
export const PHOTOS_METHODS = ['read', 'write'] as const;
export type PhotosMethod = (typeof PHOTOS_METHODS)[number];

/** Closed identity methods. A second name is `unknown_method`, not a silent extra door. */
export const IDENTITY_METHODS = ['read'] as const;
export type IdentityMethod = (typeof IDENTITY_METHODS)[number];

/** Closed storage methods. A third name is `unknown_method`, not a silent extra door. */
export const STORAGE_METHODS = ['get', 'set'] as const;
export type StorageMethod = (typeof STORAGE_METHODS)[number];

/** Closed door set. A fifth name is a new PR, not a silent extra method. */
export const MISSION_OS_CAPABILITIES = ['identity', 'billing', 'photos', 'storage'] as const;

/**
 * Identity stub — interface only. Scoped minis get the injected snapshot.
 * Unscoped minis get the same CapResult deny as billing (`scope_denied`).
 * Never mint. Never auth UI. Never Supabase.
 */
export interface IdentityCapability {
  read(): CapResult<IdentitySnapshot>;
}

/**
 * Stripe HOLD — interface only. No checkout, no Stripe I/O, no new SKU.
 * A hold double may report muted Super Bundle recognition. Never gates `logSet`.
 */
export interface BillingCapability {
  read(): CapResult<BillingSnapshot>;
  /** Stripe HOLD — stub success when scoped. Never a checkout session. */
  checkout(): CapResult<BillingActionHold>;
  /** Stripe HOLD — stub success when scoped. Never a portal URL. */
  portal(): CapResult<BillingActionHold>;
}

/**
 * Photos stub — interface only. Scoped minis stay `photos_stub`.
 * Unscoped minis get the same CapResult deny as billing (`scope_denied`).
 * Never camera. Never a gallery write. Never Android wiring.
 */
export interface PhotosCapability {
  read(): CapResult<never>;
  write(): CapResult<never>;
}

/**
 * Closed to `STORAGE_METHODS`. A third method is a new PR.
 * Unscoped minis get the same CapResult deny as billing (`scope_denied`).
 * Scoped minis use the in-memory map. Never a durable browser write.
 */
export interface StorageCapability {
  get(key: string): CapResult<string | undefined>;
  set(key: string, value: string): CapResult<void>;
}

export interface MountedMini {
  manifest: ModuleManifest;
  identity: IdentityCapability;
  billing: BillingCapability;
  photos: PhotosCapability;
  storage: StorageCapability;
}

export interface MiniHost {
  mount(manifest: ModuleManifest): CapResult<MountedMini>;
  /** In-memory teardown. Clears that mini's fake keyspace. Not product chrome. */
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
}
