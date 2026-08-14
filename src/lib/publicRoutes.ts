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
] as const;

/** Page routes reachable without the private access cookie while gated. */
export const PRIVATE_GATE_PUBLIC_PATHS = [
  '/private',
  '/welcome',
  /**
   * The free logger — hard rule 2, executable.
   *
   * `.769` — shard 1 (US/LatAm, ops #16) found that its **two biggest themes,
   * ~27% of rows, are the invite/account gate before any value** and a geo-block
   * that reads as a broken page. The first one was literally true: with the gate
   * up, `/welcome` was public and `/active` was not, so a visitor could complete
   * I-Day and land on `/private`. Every road led back to an email form.
   *
   * "The free logger is never gated. Ever." is hard rule 2, and `#523` shipped
   * the first set without an account. Adding `/active` here is what makes those
   * two facts reachable by a stranger; it is not a `PRIVATE_MODE` flip and it
   * does not open Today, Coach, Fuel, history or any account surface — those
   * still demand the cookie, and the nav to them still explains itself at the
   * gate. Precedent: `/welcome` was added the same way, so SEO could reach I-Day.
   *
   * The logger needs no API: sets are written to this device
   * (`localFirstCopy.ts`), and sync is what an account buys.
   */
  '/active',
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
