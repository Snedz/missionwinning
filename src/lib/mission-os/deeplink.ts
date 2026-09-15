/**
 * Last-segment mini deeplink routes.
 *
 * Health (.1074) made entry `mission://minis/health` (not opaque `mini`).
 * ClearShot joins the same grammar: last-segment `clearshot` →
 * `mission://minis/clearshot` → `utility.clearshot` mount.
 *
 * A URI that is not `mission://minis/<segment>` is `bad_deeplink`
 * (.1091) — empty, wrong scheme, wrong path, or no last-segment.
 * A well-formed last-segment that is not in this table is
 * `unknown_mini` (.1090) — same code as MiniHost.mount of an
 * unknown id (.1087). Does not throw. Does not mount.
 * Test-fixture slugs stay out of this table.
 *
 * No product UI. No Photos / Billing / Android wiring.
 */

import {
  MISSION_MINI_PREFIX,
  type ModuleManifest,
} from '../../../packages/mw-core/src/module';
import { CLEARSHOT_MINI_MANIFEST } from './clearshot';
import { HEALTH_MINI_MANIFEST } from './health';
import type { CapResult, MiniHost, MountedMini } from './types';

const BAD_DEEPLINK: CapResult<never> = { ok: false, code: 'bad_deeplink' };

/** Closed last-segment table. A third slug is a new PR. */
export const MINI_LAST_SEGMENT_ROUTES = {
  health: HEALTH_MINI_MANIFEST,
  clearshot: CLEARSHOT_MINI_MANIFEST,
} as const;

/**
 * Well-formed mini deeplink: `mission://minis/<last-segment>`.
 * Extra `/` or a missing segment is not that grammar.
 * Charset is not `parseMissionMiniEntry` — hyphenated segments
 * stay well-formed so `.1090` `totally-unknown` stays unknown_mini.
 */
function lastSegmentOfMiniDeeplink(entry: string): string | null {
  if (typeof entry !== 'string') return null;
  if (!entry.startsWith(MISSION_MINI_PREFIX)) return null;
  const segment = entry.slice(MISSION_MINI_PREFIX.length);
  if (segment.length === 0 || segment.includes('/')) return null;
  return segment;
}

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
  const segment = lastSegmentOfMiniDeeplink(entry);
  if (segment === null) return BAD_DEEPLINK;
  return resolveMiniByLastSegment(segment);
}

export function mountMiniByDeeplink(
  host: MiniHost,
  entry: string
): CapResult<MountedMini> {
  const resolved = resolveMiniDeeplink(entry);
  if (!resolved.ok) return resolved;
  return host.mount(resolved.value);
}
