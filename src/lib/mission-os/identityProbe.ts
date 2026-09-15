/**
 * Test-only identity-denied probe. Not a product mount.
 *
 * Product minis (`l1.health`, `utility.clearshot`) both declare
 * `identity.read`. This row exists so the unscoped CapResult path can
 * be asserted without stealing identity from those mounts.
 * Not in the deeplink table. Not in `MINI_REGISTRY`. No auth UI.
 * No Supabase.
 */

import type { ModuleManifest } from '../../../packages/mw-core/src/module';
import type { CapResult, MiniHost, MountedMini } from './types';

/** Closed test-only scopes. Identity is deliberately absent. */
export const TEST_NO_IDENTITY_SCOPES = ['storage.write'] as const;

/**
 * Test-only identity deny probe. Id last-segment is `noidentity`
 * (`mission://minis/noidentity`) so `assertModuleManifest` accepts — that
 * slug is deliberately absent from `MINI_LAST_SEGMENT_ROUTES`.
 */
export const TEST_NO_IDENTITY_MANIFEST: ModuleManifest = {
  id: 'test.noidentity',
  name: 'Identity deny probe',
  version: '0.1.0',
  scopes: TEST_NO_IDENTITY_SCOPES,
  surfaces: ['web'],
  freeCore: true,
  entry: 'mission://minis/noidentity',
};

export function mountTestNoIdentityMini(host: MiniHost): CapResult<MountedMini> {
  return host.mount(TEST_NO_IDENTITY_MANIFEST);
}
