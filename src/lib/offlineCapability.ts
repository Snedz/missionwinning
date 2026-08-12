/**
 * Can *this build* actually work offline?
 *
 * The offline PWA is not optional decoration — `vision.md` calls the product an
 * "offline-first" installable PWA and frames year one around a "free offline
 * logger", and the UX problem register's P3 is "losing a workout is not an
 * option". It is fully built (Serwist, `app/sw.ts`, a precached `/offline`,
 * `cacheOnNavigation`) and deliberately **gated**, not abandoned:
 * `next.config.js` disables Serwist while the private gate is up so the
 * unreleased app is not offline-cached, and `PRODUCTION_STACK.md` L10 /
 * `LAUNCH_RUNBOOK.md` carry the flip step that turns it on.
 *
 * The defect this module exists to fix is narrower than "no offline": the UI
 * asserted the capability in the present tense on seven surfaces — including
 * the invite landing, the first screen a beta tester sees — while the build
 * shipped no service worker at all. `CONTEXT.md` documented the situation
 * honestly and none of that honesty reached a single string.
 *
 * **The flag already existed.** `next.config.js` sets `NEXT_PUBLIC_PWA_ENABLED`
 * from the very same `pwaDisabled` expression that decides whether Serwist
 * builds, and `app/i18n-pwa-provider.tsx` already reads it to register — or
 * unregister — the worker. So there is one source of truth and this is a
 * wrapper around it, not a second opinion: seven call sites should not each
 * reach into `process.env`, and a named predicate is greppable and testable
 * where a bare comparison is neither.
 *
 * Being `NEXT_PUBLIC_*`, the value is inlined at build time and identical on
 * the server and the client, so this is safe to call during render — no
 * hydration mismatch, and no async service-worker probe needed.
 *
 * Fails closed, in the shape of `isPushSupported` (`src/lib/pushClient.ts`):
 * when we cannot prove the capability, we do not claim it.
 */

/**
 * True when this build ships a service worker — i.e. the app is installable and
 * genuinely usable offline (cold open, refresh, navigation).
 *
 * **Not** the same question as "does logging survive a signal drop right now".
 * It does, service worker or not: the workout store persists to device storage
 * and every cloud write rides the durable outbox, so a session already open
 * keeps logging and syncs later. That is why `OnlineStatusBanner`'s "Offline —
 * logging still works" is true today and must not be gated behind this.
 */
export function isOfflineInstallable(): boolean {
  return process.env.NEXT_PUBLIC_PWA_ENABLED === 'true';
}

/** Root `<meta name="description">` and landing `publicPageMetadata` description. */
export function siteDescription(): string {
  return isOfflineInstallable()
    ? 'Free offline workout logger + adaptive Mission Coach from your logs — no wearable required. Free core forever. Works offline, anywhere.'
    : 'Free workout logger + adaptive Mission Coach from your logs — no wearable required. Free core forever.';
}

/** PWA manifest `description` — installability/offline only when a worker ships. */
export function manifestDescription(): string {
  return isOfflineInstallable()
    ? 'Free offline workout logger + adaptive Mission Coach from your logs — free core forever, works offline anywhere.'
    : 'Free workout logger + adaptive Mission Coach from your logs — free core forever, no account required.';
}

/** Default Open Graph description (root layout + inherited pages). */
export function openGraphDescription(): string {
  return isOfflineInstallable()
    ? 'Free workout tracking, nutrition, mobility, mind, and learning — one path forward. Works offline. Mission Coach plans your week.'
    : 'Free workout tracking, nutrition, mobility, mind, and learning — one path forward. Mission Coach plans your week.';
}

/** Default Twitter card description (root layout + inherited pages). */
export function twitterDescription(): string {
  return isOfflineInstallable()
    ? 'Free workout tracking, nutrition, mobility, mind, and learning — one path forward. Works offline.'
    : 'Free workout tracking, nutrition, mobility, mind, and learning — one path forward.';
}

/** `SoftwareApplication` JSON-LD on the landing graph. */
export function softwareApplicationDescription(): string {
  return isOfflineInstallable()
    ? 'Free offline workout logger PWA with adaptive Mission Coach from your logs — no wearable required.'
    : 'Free workout logger with adaptive Mission Coach from your logs — no wearable required.';
}

/** `/beta` route metadata — first screen many invited testers bookmark. */
export function betaRouteDescription(): string {
  return isOfflineInstallable()
    ? 'Beta start guide — log from Today offline, open Mission Coach after your first session.'
    : 'Beta start guide — log from Today with no account; Mission Coach adapts your week after your first session.';
}
