/**
 * Routes reachable before I-Day completes (JourneyGuard bypass).
 * `.1075` — Today, Train, Coach, and History are the tracker. I-Day is a Skip,
 * not a wall.
 */
export const JOURNEY_BYPASS_PATHS = [
  '/welcome',
  '/log',
  '/active',
  '/coach',
  '/history',
  '/private',
  '/vision',
  '/about',
  '/changelog',
  '/terms',
  '/privacy',
  '/cookies',
  '/accessibility',
  '/dmca',
  '/refunds',
  '/usage',
  '/regions',
  '/service-terms',
  '/beta',
  '/america',
  '/feedback',
  '/programs',
  '/coaching',
  '/calculators',
  '/fitness-test',
  '/bundle',
  '/guide',
  '/exercises',
  '/learn',
  '/paths',
  '/press',
  '/join/class',
  '/notify',
] as const;

/** Page routes reachable without the private access cookie while gated. */
export const PRIVATE_GATE_PUBLIC_PATHS = [
  '/private',
  '/welcome',
  /**
   * `.768` — the free logger while the gate is up. Same mechanism as `/welcome`.
   * GNT-1 / F-004 — Today (`/log`) is the I-Day landing. Coach / Fuel stay cookie-gated.
   */
  '/active',
  '/log',
  '/privacy',
  '/terms',
  /** A cookie policy unreachable pre-consent / pre-gate is a defect. */
  '/cookies',
  '/accessibility',
  '/dmca',
  '/refunds',
  '/usage',
  '/regions',
  '/service-terms',
  '/about',
  '/changelog',
  '/america',
  '/vision',
  '/beta',
  '/feedback',
  '/youth/consent/confirm',
  '/auth/callback',
  '/manifest.webmanifest',
  '/guide',
  '/exercises',
  '/bundle',
  '/learn',
  '/paths',
  '/press',
  /**
   * F-047 — Super Bundle “Get notified until Stripe”. `/private` redirects when
   * the gate is off, so this is the public capture page. Door pack stays on
   * `/private`; landing still does not remount the form.
   */
  '/notify',
  /** Public no-auth calculators (prefix also covers /calculators/1rm etc.) */
  '/calculators',
  /** Beyond the Basics magazine PDF + assets under public/magazine/ */
  '/magazine',
  /** Optional HTTP i18n overlay (LocaleHttpSync) — not /api */
  '/locales',
] as const;

export function isJourneyBypassPath(pathname: string): boolean {
  return JOURNEY_BYPASS_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function isPrivateGatePublicPath(pathname: string): boolean {
  if (pathname.startsWith('/_next')) return true;
  if (pathname.startsWith('/private')) return true;
  return PRIVATE_GATE_PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}
