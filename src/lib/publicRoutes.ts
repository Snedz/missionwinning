/** Routes reachable before I-Day completes (JourneyGuard bypass). */
export const JOURNEY_BYPASS_PATHS = [
  '/welcome',
  '/private',
  '/vision',
  '/about',
  '/terms',
  '/privacy',
  '/cookies',
  '/accessibility',
  '/dmca',
  '/refunds',
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
  '/compare',
  '/learn',
  '/paths',
  '/press',
  '/join/class',
] as const;

/** Page routes reachable without the private access cookie while gated. */
export const PRIVATE_GATE_PUBLIC_PATHS = [
  '/private',
  '/welcome',
  '/privacy',
  '/terms',
  /** A cookie policy unreachable pre-consent / pre-gate is a defect. */
  '/cookies',
  '/accessibility',
  '/dmca',
  '/refunds',
  '/about',
  '/america',
  '/vision',
  '/beta',
  '/feedback',
  '/youth/consent/confirm',
  '/auth/callback',
  '/manifest.webmanifest',
  '/guide',
  '/exercises',
  '/compare',
  '/bundle',
  '/learn',
  '/paths',
  '/press',
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
