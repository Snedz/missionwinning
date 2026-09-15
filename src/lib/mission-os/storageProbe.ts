/**
 * Test-only unscoped-storage probe. Not a product mount.
 *
 * Exists so every storage method can be asserted `scope_denied` without
 * changing Health or ClearShot (they declare storage). Not in the
 * deeplink table. Not in `MINI_REGISTRY`. No durable browser write. No product UI.
 */

import type { ModuleManifest } from '../../../packages/mw-core/src/module';
import type { CapResult, MiniHost, MountedMini } from './types';

/** Closed test-only scopes. Storage is deliberately absent. */
export const TEST_NO_STORAGE_SCOPES = ['identity.read'] as const;

/**
 * Test-only no-storage probe. Id last-segment is `nostorage`
 * (`mission://minis/nostorage`) so `assertModuleManifest` accepts — that
 * slug is deliberately absent from `MINI_LAST_SEGMENT_ROUTES`.
 */
export const TEST_NO_STORAGE_MANIFEST: ModuleManifest = {
  id: 'test.nostorage',
  name: 'No-storage probe',
  version: '0.1.0',
  scopes: TEST_NO_STORAGE_SCOPES,
  surfaces: ['web'],
  freeCore: true,
  entry: 'mission://minis/nostorage',
};

export function mountTestNoStorageMini(host: MiniHost): CapResult<MountedMini> {
  return host.mount(TEST_NO_STORAGE_MANIFEST);
}
