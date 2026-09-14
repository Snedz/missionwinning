/**
 * Thin web adapter for the Mission OS capability bus.
 *
 * Snapshots are injected. This module does not import leaderboard names,
 * `premiumServer`, or `safeStorage`. Photos stay stubbed. Storage is
 * process-local, namespaced by mini id.
 */

import {
  GUEST_IDENTITY,
  MUTED_BILLING,
  readBilling,
  readIdentity,
  readPhotos,
  readStorage,
  writePhotos,
  writeStorage,
  type BillingSnapshot,
  type CapabilityResult,
  type IdentitySnapshot,
} from '../../../packages/mw-core/src/module';
import { lookupMini } from './registry';

export type MiniBusOptions = {
  identity?: IdentitySnapshot;
  billing?: BillingSnapshot;
};

function storeFor(stores: Map<string, Map<string, string>>, id: string): Map<string, string> {
  let store = stores.get(id);
  if (!store) {
    store = new Map();
    stores.set(id, store);
  }
  return store;
}

export function createMiniBus(opts: MiniBusOptions = {}) {
  const identity = opts.identity ?? GUEST_IDENTITY;
  const billing = opts.billing ?? MUTED_BILLING;
  const stores = new Map<string, Map<string, string>>();

  return {
    identity(id: string): CapabilityResult<IdentitySnapshot> {
      const mini = lookupMini(id);
      if (!mini.ok) return mini;
      return readIdentity(mini.value, identity);
    },
    billing(id: string): CapabilityResult<BillingSnapshot> {
      const mini = lookupMini(id);
      if (!mini.ok) return mini;
      return readBilling(mini.value, billing);
    },
    photos(id: string, mode: 'read' | 'write'): CapabilityResult<never> {
      const mini = lookupMini(id);
      if (!mini.ok) return mini;
      return mode === 'write' ? writePhotos(mini.value) : readPhotos(mini.value);
    },
    storageGet(id: string, key: string): CapabilityResult<string | undefined> {
      const mini = lookupMini(id);
      if (!mini.ok) return mini;
      return readStorage(mini.value, storeFor(stores, id), key);
    },
    storageSet(id: string, key: string, value: string): CapabilityResult<void> {
      const mini = lookupMini(id);
      if (!mini.ok) return mini;
      return writeStorage(mini.value, storeFor(stores, id), key, value);
    },
  };
}
