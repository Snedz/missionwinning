/**
 * Capability bus — pure deny/allow. No I/O.
 *
 * Host adapters (web `src/lib/minis/`, later Android) inject snapshots.
 * Minis call these doors; they do not import product stores.
 */

import type { ModuleManifest, ModuleScope } from './types';

/**
 * Closed host-lifecycle CapResult denies (`.1098`). A ninth code is a
 * PLAN hop, not a silent extra string. Order is the freeze — do not
 * reshuffle without the hop.
 */
export const HOST_LIFECYCLE_DENY_CODES = [
  'scope_denied',
  'unknown_method',
  'unknown_capability',
  'not_mounted',
  'already_mounted',
  'unknown_mini',
  'bad_deeplink',
  'storage_cap',
] as const;

/** Scoped-stub envelopes. Not host-lifecycle. Not a license for a tenth code. */
export const SCOPED_STUB_DENY_CODES = ['stub', 'photos_stub'] as const;

/** Complete CapResult deny set. Type is derived — a new member must land here. */
export const CAPABILITY_DENY_CODES = [
  ...HOST_LIFECYCLE_DENY_CODES,
  ...SCOPED_STUB_DENY_CODES,
] as const;

export type CapabilityDenyCode = (typeof CAPABILITY_DENY_CODES)[number];

export type CapabilityOk<T> = { ok: true; value: T };
export type CapabilityDeny = { ok: false; code: CapabilityDenyCode };
export type CapabilityResult<T> = CapabilityOk<T> | CapabilityDeny;

export type IdentitySnapshot = {
  missionId: number | null;
  callSign: string | null;
};

export type BillingSnapshot = {
  bundle: 'none' | 'super';
  muted: boolean;
};

export type PhotosSnapshot = {
  album: string;
  stub: boolean;
};

export const GUEST_IDENTITY: IdentitySnapshot = { missionId: null, callSign: null };
export const MUTED_BILLING: BillingSnapshot = { bundle: 'none', muted: true };
export const STUB_PHOTOS: PhotosSnapshot = { album: 'none', stub: true };

/** Stub hold for checkout / portal. Never a Stripe session. */
export type BillingActionHold = { held: true };
export const BILLING_ACTION_HOLD: BillingActionHold = { held: true };

/** In-memory cap for mini key-value. One small bound, tested. */
export const STORAGE_MAX_KEYS = 32;
export const STORAGE_MAX_VALUE_BYTES = 4096;

export function assertCapability(
  manifest: ModuleManifest,
  scope: ModuleScope
): CapabilityResult<void> {
  if (!manifest.scopes.includes(scope)) {
    return { ok: false, code: 'scope_denied' };
  }
  return { ok: true, value: undefined };
}

export function resolveRegisteredMini(
  id: string,
  registry: ReadonlyMap<string, ModuleManifest>
): CapabilityResult<ModuleManifest> {
  const hit = registry.get(id);
  if (!hit) return { ok: false, code: 'unknown_mini' };
  return { ok: true, value: hit };
}

/** Mounted mini inventory row — id + declared scopes only. */
export type MiniInventoryEntry = {
  id: string;
  scopes: readonly ModuleScope[];
};

export function inventoryFromManifest(manifest: ModuleManifest): MiniInventoryEntry {
  return { id: manifest.id, scopes: [...manifest.scopes] };
}

export function listMountedInventory(
  table: ReadonlyMap<string, MiniInventoryEntry>
): CapabilityResult<readonly MiniInventoryEntry[]> {
  return {
    ok: true,
    value: [...table.values()].map((row) => ({
      id: row.id,
      scopes: [...row.scopes],
    })),
  };
}

export function peekMountedInventory(
  table: ReadonlyMap<string, MiniInventoryEntry>,
  id: string
): CapabilityResult<MiniInventoryEntry> {
  const hit = table.get(id);
  if (!hit) return { ok: false, code: 'unknown_mini' };
  return { ok: true, value: { id: hit.id, scopes: [...hit.scopes] } };
}

/**
 * Peek one declared scope on a mounted mini.
 * Never-mounted → `unknown_mini` (id first). Undeclared → `scope_denied`.
 */
export function peekMountedScope(
  table: ReadonlyMap<string, MiniInventoryEntry>,
  id: string,
  scope: ModuleScope
): CapabilityResult<void> {
  const hit = table.get(id);
  if (!hit) return { ok: false, code: 'unknown_mini' };
  if (!hit.scopes.includes(scope)) return { ok: false, code: 'scope_denied' };
  return { ok: true, value: undefined };
}

export function readIdentity(
  manifest: ModuleManifest,
  snapshot: IdentitySnapshot = GUEST_IDENTITY
): CapabilityResult<IdentitySnapshot> {
  const gate = assertCapability(manifest, 'identity.read');
  if (!gate.ok) return gate;
  return {
    ok: true,
    value: { missionId: snapshot.missionId, callSign: snapshot.callSign },
  };
}

export function readBilling(
  manifest: ModuleManifest,
  snapshot: BillingSnapshot = MUTED_BILLING
): CapabilityResult<BillingSnapshot> {
  const gate = assertCapability(manifest, 'billing.read');
  if (!gate.ok) return gate;
  return {
    ok: true,
    value: { bundle: snapshot.bundle, muted: true },
  };
}

/**
 * Stripe HOLD checkout. Scoped minis get a stub hold — never a session.
 * Unscoped minis get the same deny as `readBilling`.
 */
export function checkoutBilling(
  manifest: ModuleManifest
): CapabilityResult<BillingActionHold> {
  const gate = assertCapability(manifest, 'billing.read');
  if (!gate.ok) return gate;
  return { ok: true, value: BILLING_ACTION_HOLD };
}

/**
 * Stripe HOLD portal. Scoped minis get a stub hold — never a portal URL.
 * Unscoped minis get the same deny as `readBilling`.
 */
export function portalBilling(
  manifest: ModuleManifest
): CapabilityResult<BillingActionHold> {
  const gate = assertCapability(manifest, 'billing.read');
  if (!gate.ok) return gate;
  return { ok: true, value: BILLING_ACTION_HOLD };
}

function photosEnvelope(
  manifest: ModuleManifest,
  scope: 'photos.read' | 'photos.write',
  snapshot?: PhotosSnapshot
): CapabilityResult<PhotosSnapshot> {
  const gate = assertCapability(manifest, scope);
  if (!gate.ok) return gate;
  if (!snapshot) return { ok: false, code: 'photos_stub' };
  return { ok: true, value: { album: snapshot.album, stub: true } };
}

/**
 * Photos read. No snapshot → scoped minis stay `photos_stub` — never a camera.
 * Injected snapshot → isolated stub envelope (`stub` forced true).
 * Unscoped minis get the same CapResult deny as `readBilling`.
 */
export function readPhotos(
  manifest: ModuleManifest,
  snapshot?: PhotosSnapshot
): CapabilityResult<PhotosSnapshot> {
  return photosEnvelope(manifest, 'photos.read', snapshot);
}

/**
 * Photos write. No snapshot → scoped minis stay `photos_stub` — never MediaStore.
 * Injected snapshot → isolated stub envelope (`stub` forced true).
 * Unscoped minis get the same CapResult deny as `readPhotos`.
 */
export function writePhotos(
  manifest: ModuleManifest,
  snapshot?: PhotosSnapshot
): CapabilityResult<PhotosSnapshot> {
  return photosEnvelope(manifest, 'photos.write', snapshot);
}

function utf8Bytes(value: string): number {
  return new TextEncoder().encode(value).length;
}

export function readStorage(
  manifest: ModuleManifest,
  store: Map<string, string>,
  key: string
): CapabilityResult<string | undefined> {
  const gate = assertCapability(manifest, 'storage.read');
  if (!gate.ok) return gate;
  return { ok: true, value: store.get(key) };
}

export function writeStorage(
  manifest: ModuleManifest,
  store: Map<string, string>,
  key: string,
  value: string
): CapabilityResult<void> {
  const gate = assertCapability(manifest, 'storage.write');
  if (!gate.ok) return gate;
  if (utf8Bytes(value) > STORAGE_MAX_VALUE_BYTES) {
    return { ok: false, code: 'storage_cap' };
  }
  if (!store.has(key) && store.size >= STORAGE_MAX_KEYS) {
    return { ok: false, code: 'storage_cap' };
  }
  store.set(key, value);
  return { ok: true, value: undefined };
}
