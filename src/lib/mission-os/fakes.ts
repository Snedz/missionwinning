/**
 * In-memory Mission OS capability fakes.
 *
 * Stripe HOLD: billing never imports Stripe, never opens checkout, always
 * reports muted. Photos stay `photos_stub`. Storage is process-local.
 * Identity is an injected snapshot — guests stay null; nothing is minted.
 */

import {
  BILLING_ACTION_HOLD,
  GUEST_IDENTITY,
  MUTED_BILLING,
  checkoutBilling,
  portalBilling,
  readBilling,
  readIdentity,
  readPhotos,
  readStorage,
  writePhotos,
  writeStorage,
  type BillingSnapshot,
  type IdentitySnapshot,
  type ModuleManifest,
} from '../../../packages/mw-core/src/module';
import type {
  BillingCapability,
  IdentityCapability,
  PhotosCapability,
  StorageCapability,
} from './types';

/** Closed factory set. A fifth fake is a new PR, not a silent extra export. */
export const MISSION_OS_FAKES = [
  'createIdentityFake',
  'createBillingFake',
  'createPhotosFake',
  'createStorageFake',
] as const;

export function createIdentityFake(
  manifest: ModuleManifest,
  snapshot: IdentitySnapshot = GUEST_IDENTITY
): IdentityCapability {
  return {
    read: () => readIdentity(manifest, snapshot),
  };
}

/**
 * Stripe HOLD fake. Scoped `billing.read` may report recognition, but
 * `muted` is forced true here (and again in mw-core). No Stripe I/O.
 */
export function createBillingFake(
  manifest: ModuleManifest,
  snapshot: BillingSnapshot = MUTED_BILLING
): BillingCapability {
  const hold: BillingSnapshot = { bundle: snapshot.bundle, muted: true };
  return {
    read: () => readBilling(manifest, hold),
    checkout: () => checkoutBilling(manifest),
    portal: () => portalBilling(manifest),
  };
}

/** Unscoped HOLD double — muted recognition + stub actions. Never needs a manifest. */
export function createBillingHold(): BillingCapability {
  return {
    read() {
      return { ok: true, value: MUTED_BILLING };
    },
    checkout() {
      return { ok: true, value: BILLING_ACTION_HOLD };
    },
    portal() {
      return { ok: true, value: BILLING_ACTION_HOLD };
    },
  };
}

export function createPhotosFake(manifest: ModuleManifest): PhotosCapability {
  return {
    read: () => readPhotos(manifest),
    write: () => writePhotos(manifest),
  };
}

export function createStorageFake(
  manifest: ModuleManifest,
  store: Map<string, string> = new Map()
): StorageCapability {
  return {
    get: (key) => readStorage(manifest, store, key),
    set: (key, value) => writeStorage(manifest, store, key, value),
  };
}
