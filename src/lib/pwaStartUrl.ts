/**
 * PWA cold-start URL — same predicate as the service worker, not a third copy.
 *
 * `next.config.js` disables Serwist while the private gate is on. The web
 * manifest must switch with it: a hardcoded `/private` start_url survives the
 * `PRIVATE_MODE=false` rebuild and installed icons keep opening the teaser.
 *
 * `id` stays `/log` (install identity). Do not change it here.
 */
import {
  isPrivateModeEnabledFromEnv,
  type PrivateModeEnv,
} from './privateModeFlag';

export const PWA_ID = '/log' as const;
export const PWA_START_GATED = '/private' as const;
export const PWA_START_PUBLIC = '/log' as const;

export type PwaStartUrl = typeof PWA_START_GATED | typeof PWA_START_PUBLIC;

export function pwaStartUrl(env: PrivateModeEnv = process.env): PwaStartUrl {
  return isPrivateModeEnabledFromEnv(env) ? PWA_START_GATED : PWA_START_PUBLIC;
}
