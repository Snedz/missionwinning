/**
 * Test-only billing-granted probe. Not a product mount.
 *
 * Exists so the granted CapResult path can be asserted without giving
 * ClearShot or Health `billing.read`. Not in the deeplink table.
 * Not in `MINI_REGISTRY`. No Stripe. No product UI.
 */

import type { ModuleManifest } from '../../../packages/mw-core/src/module';
import type { CapResult, MiniHost, MountedMini } from './types';

/** Closed test-only scopes. A second product scope is a new PR. */
export const TEST_BILLING_SCOPES = ['billing.read'] as const;

/**
 * Test-only billing probe. Id last-segment is `billing`
 * (`mission://minis/billing`) so `assertModuleManifest` accepts — that
 * slug is deliberately absent from `MINI_LAST_SEGMENT_ROUTES`.
 */
export const TEST_BILLING_MANIFEST: ModuleManifest = {
  id: 'test.billing',
  name: 'Billing probe',
  version: '0.1.0',
  scopes: TEST_BILLING_SCOPES,
  surfaces: ['web'],
  freeCore: true,
  entry: 'mission://minis/billing',
};

export function mountTestBillingMini(host: MiniHost): CapResult<MountedMini> {
  return host.mount(TEST_BILLING_MANIFEST);
}
