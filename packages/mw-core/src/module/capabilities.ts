/**
 * Capability bus — pure deny/allow. No I/O.
 *
 * Host adapters (web `src/lib/minis/`, later Android) inject snapshots.
 * Minis call these doors; they do not import product stores.
 */

import type { ModuleManifest, ModuleScope } from './types';

export type CapabilityDenyCode =
  | 'scope_denied'
  | 'stub'
  | 'photos_stub'
  | 'unknown_mini'
  | 'storage_cap';

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

export const GUEST_IDENTITY: IdentitySnapshot = { missionId: null, callSign: null };
export const MUTED_BILLING: BillingSnapshot = { bundle: 'none', muted: true };

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

export function readPhotos(manifest: ModuleManifest): CapabilityResult<never> {
  const gate = assertCapability(manifest, 'photos.read');
  if (!gate.ok) return gate;
  return { ok: false, code: 'photos_stub' };
}

export function writePhotos(manifest: ModuleManifest): CapabilityResult<never> {
  const gate = assertCapability(manifest, 'photos.write');
  if (!gate.ok) return gate;
  return { ok: false, code: 'photos_stub' };
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
