/**
 * Last-segment mini deeplink routes.
 *
 * Health (.1074) made entry `mission://minis/health` (not opaque `mini`).
 * ClearShot joins the same grammar: last-segment `clearshot` →
 * `mission://minis/clearshot` → `utility.clearshot` mount.
 *
 * An unknown last-segment (not in this table) is `unknown_mini` —
 * same code as MiniHost.mount of an unknown id (.1087). Does not
 * throw. Does not mount. Test-fixture slugs stay out of this table.
 *
 * No product UI. No Photos / Billing / Android wiring.
 */

import {
  parseMissionMiniEntry,
  type ModuleManifest,
} from '../../../packages/mw-core/src/module';
import { CLEARSHOT_MINI_MANIFEST } from './clearshot';
import { HEALTH_MINI_MANIFEST } from './health';
import type { CapResult, MiniHost, MountedMini } from './types';

/** Closed last-segment table. A third slug is a new PR. */
export const MINI_LAST_SEGMENT_ROUTES = {
  health: HEALTH_MINI_MANIFEST,
  clearshot: CLEARSHOT_MINI_MANIFEST,
} as const;

export function resolveMiniByLastSegment(slug: string): CapResult<ModuleManifest> {
  if (!Object.hasOwn(MINI_LAST_SEGMENT_ROUTES, slug)) {
    return { ok: false, code: 'unknown_mini' };
  }
  return {
    ok: true,
    value: MINI_LAST_SEGMENT_ROUTES[slug as keyof typeof MINI_LAST_SEGMENT_ROUTES],
  };
}

export function resolveMiniDeeplink(entry: string): CapResult<ModuleManifest> {
  const slug = parseMissionMiniEntry(entry);
  if (!slug) return { ok: false, code: 'unknown_mini' };
  return resolveMiniByLastSegment(slug);
}

export function mountMiniByDeeplink(
  host: MiniHost,
  entry: string
): CapResult<MountedMini> {
  const resolved = resolveMiniDeeplink(entry);
  if (!resolved.ok) return resolved;
  return host.mount(resolved.value);
}
