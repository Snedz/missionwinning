/**
 * Health mini stub — L1 first mini, identity + storage only.
 *
 * Proves `MiniHost.mount` works without photos or billing. No product UI.
 * Not `utility.*` (ClearShot stays that family). Not `health.train`.
 * Never `health.write`. Stripe stays HOLD.
 */

import type { ModuleManifest } from '../../../packages/mw-core/src/module';
import type { CapResult, MiniHost, MountedMini } from './types';

/** Closed Health mini scopes. Photos, billing, and health.write are a new PR. */
export const HEALTH_MINI_SCOPES = [
  'identity.read',
  'storage.read',
  'storage.write',
] as const;

/**
 * Reserved L1 Health mini. Id ends in `.health` so the deep-link slug is
 * `health` (`mission://minis/health`). Not `/active`. Not `health.mini`
 * (that last-segment was the opaque `mini`). Host chrome later.
 * Isolation: coach / store / Today / Train stay blind.
 */
export const HEALTH_MINI_MANIFEST: ModuleManifest = {
  id: 'l1.health',
  name: 'Health',
  version: '0.1.0',
  scopes: HEALTH_MINI_SCOPES,
  surfaces: ['web'],
  freeCore: true,
  entry: 'mission://minis/health',
};

export function mountHealthMini(host: MiniHost): CapResult<MountedMini> {
  return host.mount(HEALTH_MINI_MANIFEST);
}
