/**
 * ClearShot mini stub — utility lane, photos + storage.write.
 *
 * Mounts the reserved `utility.clearshot` row on MiniHost. Identity is
 * optional (declared so guests stay null). Photos stay `photos_stub`.
 * Billing and undeclared extras fail closed (`scope_denied`).
 * No product UI. No Stripe. No ClearShot Android code in MW.
 */

import { UTILITY_CLEARSHOT_MANIFEST } from '../../../packages/mw-core/src/module';
import type { CapResult, MiniHost, MountedMini } from './types';

/** Closed ClearShot scopes. Billing, health.write, and storage.read are a new PR. */
export const CLEARSHOT_MINI_SCOPES = [
  'identity.read',
  'photos.read',
  'photos.write',
  'storage.write',
] as const;

/**
 * Reserved utility ClearShot mini. Id last-segment is `clearshot`
 * (`mission://minis/clearshot`). Not `l1.health`. Not `health.train`.
 * Isolation: coach / store / Today / Train stay blind.
 */
export const CLEARSHOT_MINI_MANIFEST = UTILITY_CLEARSHOT_MANIFEST;

export function mountClearShotMini(host: MiniHost): CapResult<MountedMini> {
  return host.mount(CLEARSHOT_MINI_MANIFEST);
}
