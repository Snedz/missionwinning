/**
 * Client navigation that respects the private gate cookie check in proxy.ts.
 *
 * Beta Field (live www `.618`, pre-fix): Welcome Skip called `router.push('/active')`
 * after `completeIDay()` — localStorage held `mw_journey_state`, no Set-Cookie, yet
 * `/active`/`/log`/`/coach` rendered client-side while `curl` still 307→`/private`.
 * Soft nav from gate-public `/welcome` never re-ran proxy.ts.
 */
import { isPrivateGatePublicPath } from '@/lib/publicRoutes';

/** Build-time mirror of `isPrivateModeEnabled()` — see next.config.js `env`. */
export function isClientPrivateGateEnabled(): boolean {
  return process.env.NEXT_PUBLIC_PRIVATE_GATE === 'true';
}

/** Pure decision — testable without a browser `window`. */
export function privateGateRequiresHardNavigation(destination: string): boolean {
  const path = destination.startsWith('/') ? destination : `/${destination}`;
  return isClientPrivateGateEnabled() && !isPrivateGatePublicPath(path);
}

/**
 * Navigate to a destination after leaving a gate-public flow (I-Day finish).
 *
 * Mission Control shape (option 2): I-Day localStorage (`completeIDay`) is fine;
 * we do **not** mint a gate cookie or require unlock before Skip. Hard-nav to
 * gated routes when PRIVATE_MODE is on so proxy.ts demands the real cookie —
 * no fake unlock, no soft `router.push` bypass.
 */
export function navigateAfterPrivateGateUnlock(
  destination: string,
  softNavigate?: (path: string) => void
): void {
  if (typeof window === 'undefined') return;

  const path = destination.startsWith('/') ? destination : `/${destination}`;

  if (privateGateRequiresHardNavigation(path)) {
    window.location.assign(path);
    return;
  }

  if (softNavigate) {
    softNavigate(path);
    return;
  }

  window.location.assign(path);
}
