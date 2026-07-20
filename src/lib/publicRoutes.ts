/** Routes reachable before I-Day completes (JourneyGuard bypass). */
export const JOURNEY_BYPASS_PATHS = [
  '/welcome',
  '/private',
  '/vision',
  '/about',
  '/terms',
  '/privacy',
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
  '/privacy',
  '/terms',
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
