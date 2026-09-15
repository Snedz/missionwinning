/**
 * In-memory Mission OS capability fakes.
 *
 * Stripe HOLD: billing never imports Stripe, never opens checkout, always
 * reports muted. Photos stay `photos_stub` when scoped; unscoped is
 * `scope_denied` (same CapResult deny as billing). Storage is process-local.
 * Identity is an injected snapshot — guests stay null; nothing is minted.
 * Each fake copies its snapshot so injecting A cannot change B.read.
 * Remount after inject binds a new fake from host options — leftover
 * inject dies (`.1102`).
 * Unscoped identity is `scope_denied` (same CapResult deny as billing).
 * Billing is an injected muted snapshot — each fake copies so injecting
 * A cannot change B.read. Unscoped billing stays `scope_denied`.
 * Photos is an injected stub snapshot — each fake copies so injecting
 * A cannot change B.read. No snapshot stays `photos_stub`. Unscoped
 * photos stays `scope_denied`.
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
  removeStorage,
  type BillingSnapshot,
  type IdentitySnapshot,
  type ModuleManifest,
  type PhotosSnapshot,
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

function copyIdentity(snapshot: IdentitySnapshot): IdentitySnapshot {
  return { missionId: snapshot.missionId, callSign: snapshot.callSign };
}

function copyBilling(snapshot: BillingSnapshot): BillingSnapshot {
  return { bundle: snapshot.bundle, muted: true };
}

function copyPhotos(snapshot: PhotosSnapshot): PhotosSnapshot {
  return { album: snapshot.album, stub: true };
}

/**
 * Fake-only per-capability inject. Not production auth. Not on MiniHost.
 * Replacing A's snapshot must not change B.read — each fake copies.
 * Remount creates a new fake; leftover inject dies (`.1102`).
 */
const identityInjectors = new WeakMap<IdentityCapability, (next: IdentitySnapshot) => void>();

export function injectIdentitySnapshot(
  identity: IdentityCapability,
  snapshot: IdentitySnapshot
): void {
  const inject = identityInjectors.get(identity);
  if (!inject) return;
  inject(copyIdentity(snapshot));
}

export function createIdentityFake(
  manifest: ModuleManifest,
  snapshot: IdentitySnapshot = GUEST_IDENTITY
): IdentityCapability {
  let current = copyIdentity(snapshot);
  const cap: IdentityCapability = {
    read: () => readIdentity(manifest, current),
  };
  identityInjectors.set(cap, (next) => {
    current = next;
  });
  return cap;
}

/**
 * Fake-only per-capability inject. Not Stripe. Not on MiniHost.
 * Replacing A's snapshot must not change B.read — each fake copies
 * and forces muted.
 */
const billingInjectors = new WeakMap<BillingCapability, (next: BillingSnapshot) => void>();

export function injectBillingSnapshot(
  billing: BillingCapability,
  snapshot: BillingSnapshot
): void {
  const inject = billingInjectors.get(billing);
  if (!inject) return;
  inject(copyBilling(snapshot));
}

/**
 * Stripe HOLD fake. Scoped `billing.read` may report recognition, but
 * `muted` is forced true here (and again in mw-core). No Stripe I/O.
 * Each fake copies its snapshot so injecting A cannot change B.read.
 */
export function createBillingFake(
  manifest: ModuleManifest,
  snapshot: BillingSnapshot = MUTED_BILLING
): BillingCapability {
  let current = copyBilling(snapshot);
  const cap: BillingCapability = {
    read: () => readBilling(manifest, current),
    checkout: () => checkoutBilling(manifest),
    portal: () => portalBilling(manifest),
  };
  billingInjectors.set(cap, (next) => {
    current = next;
  });
  return cap;
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

/**
 * Fake-only per-capability inject. Not camera. Not on MiniHost.
 * Replacing A's snapshot must not change B.read — each fake copies
 * and forces stub.
 */
const photosInjectors = new WeakMap<PhotosCapability, (next: PhotosSnapshot) => void>();

export function injectPhotosSnapshot(
  photos: PhotosCapability,
  snapshot: PhotosSnapshot
): void {
  const inject = photosInjectors.get(photos);
  if (!inject) return;
  inject(copyPhotos(snapshot));
}

/**
 * Photos stub fake. No snapshot → scoped stays `photos_stub`.
 * Injected snapshot → isolated stub envelope. Never camera.
 * Each fake copies its snapshot so injecting A cannot change B.read.
 */
export function createPhotosFake(
  manifest: ModuleManifest,
  snapshot?: PhotosSnapshot
): PhotosCapability {
  let current = snapshot ? copyPhotos(snapshot) : undefined;
  const cap: PhotosCapability = {
    read: () => readPhotos(manifest, current),
    write: () => writePhotos(manifest, current),
  };
  photosInjectors.set(cap, (next) => {
    current = next;
  });
  return cap;
}

/** In-memory map. Overflow (32 keys / 4KB) is `storage_cap` (`.1097`). Remount after cap starts empty (`.1099`). `remove` is a closed write (`.1100`). */
export function createStorageFake(
  manifest: ModuleManifest,
  store: Map<string, string> = new Map()
): StorageCapability {
  return {
    get: (key) => readStorage(manifest, store, key),
    set: (key, value) => writeStorage(manifest, store, key, value),
    remove: (key) => removeStorage(manifest, store, key),
  };
}
