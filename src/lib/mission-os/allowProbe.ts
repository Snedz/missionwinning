/**
 * Test-only allow-path probe. Not a product mount.
 *
 * Declares identity + billing + photos + storage so every granted
 * CapResult envelope can be asserted on one mount. Not in the
 * deeplink table. Not in `MINI_REGISTRY`. No Stripe. No camera.
 * No product UI.
 */

import type { ModuleManifest } from '../../../packages/mw-core/src/module';
import type { CapResult, MiniHost, MountedMini } from './types';

/** Closed test-only grant. A second product scope is a new PR. */
export const TEST_GRANTED_SCOPES = [
  'identity.read',
  'billing.read',
  'photos.read',
  'photos.write',
  'storage.read',
  'storage.write',
] as const;

/**
 * Test-only grant probe. Id last-segment is `granted`
 * (`mission://minis/granted`) so `assertModuleManifest` accepts — that
 * slug is deliberately absent from `MINI_LAST_SEGMENT_ROUTES`.
 */
export const TEST_GRANTED_MANIFEST: ModuleManifest = {
  id: 'test.granted',
  name: 'Allow-path probe',
  version: '0.1.0',
  scopes: TEST_GRANTED_SCOPES,
  surfaces: ['web'],
  freeCore: true,
  entry: 'mission://minis/granted',
};

export function mountTestGrantedMini(host: MiniHost): CapResult<MountedMini> {
  return host.mount(TEST_GRANTED_MANIFEST);
}
