/**
 * Named Mission OS capability doors.
 *
 * One shape: `CapResult` is `CapabilityResult` from mw-core (`.1068` / #935).
 * This folder is the interface host (`MiniHost.mount` / `MiniHost.unmount`).
 * The function bus stays in `src/lib/minis/`. Stripe stays HOLD — no checkout here.
 */

import type {
  BillingSnapshot,
  CapabilityResult,
  IdentitySnapshot,
  ModuleManifest,
} from '../../../packages/mw-core/src/module';

export type CapResult<T> = CapabilityResult<T>;

export type { BillingSnapshot, IdentitySnapshot, ModuleManifest };

/** Closed door set. A fifth name is a new PR, not a silent extra method. */
export const MISSION_OS_CAPABILITIES = ['identity', 'billing', 'photos', 'storage'] as const;

export interface IdentityCapability {
  read(): CapResult<IdentitySnapshot>;
}

/**
 * Stripe HOLD — interface only. No checkout, no Stripe I/O, no new SKU.
 * A hold double may report muted Super Bundle recognition. Never gates `logSet`.
 */
export interface BillingCapability {
  read(): CapResult<BillingSnapshot>;
}

export interface PhotosCapability {
  read(): CapResult<never>;
  write(): CapResult<never>;
}

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
}
