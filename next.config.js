const { withSentryConfig } = require('@sentry/nextjs');
const withSerwistInit = require('@serwist/next').default;

/** Disable SW while private gate is on (prevents offline leak of full app).
 *  Wave B / public flip: set PRIVATE_MODE=false so Serwist builds (docs/PRODUCTION_STACK.md L10). */
const pwaDisabled =
  process.env.NODE_ENV === 'development' ||
  process.env.PRIVATE_MODE === 'true' ||
  (process.env.NODE_ENV === 'production' && process.env.PRIVATE_MODE !== 'false');

/** Mirror of `isPrivateModeEnabled()` — client cannot read the httpOnly gate cookie. */
const privateGateActive =
  process.env.PRIVATE_MODE === 'true' ||
  process.env.PRIVATE_MODE === '1' ||
  (process.env.PRIVATE_MODE !== 'false' &&
    process.env.PRIVATE_MODE !== '0' &&
    process.env.NODE_ENV === 'production');

const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  disable: pwaDisabled,
  // Cache documents on client-side navigation (train-anywhere offline promise).
  cacheOnNavigation: true,
  reloadOnOnline: true,
  additionalPrecacheEntries: pwaDisabled
    ? []
    : [
        { url: '/offline', revision: `${Date.now()}` },
        { url: '/manifest.webmanifest', revision: '1' },
      ],
});

/** @see PROTECTION.md — enforce in production unless CSP_ENFORCE=false */
const CSP_POLICY =
  "default-src 'self'; " +
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
  "style-src 'self' 'unsafe-inline'; " +
  "img-src 'self' data: blob: https:; " +
  "font-src 'self' data:; " +
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://eu.i.posthog.com https://us.i.posthog.com https://app.posthog.com https://*.ingest.sentry.io https://*.sentry.io; " +
  "frame-ancestors 'self'; " +
  "base-uri 'self'; " +
  "form-action 'self'; " +
  "object-src 'none'; " +
  "worker-src 'self' blob:";

function cspHeaderKey() {
  if (process.env.CSP_ENFORCE === 'true') return 'Content-Security-Policy';
  if (process.env.CSP_ENFORCE === 'false') return 'Content-Security-Policy-Report-Only';
  return process.env.NODE_ENV === 'production'
    ? 'Content-Security-Policy'
    : 'Content-Security-Policy-Report-Only';
}

const nextConfig = {
  reactStrictMode: true,
  turbopack: {},
  outputFileTracingRoot: __dirname,
  // Client needs to know whether to register SW (private gate must not keep a stale worker).
  env: {
    NEXT_PUBLIC_PWA_ENABLED: pwaDisabled ? 'false' : 'true',
    NEXT_PUBLIC_PRIVATE_GATE: privateGateActive ? 'true' : 'false',
  },
  /**
   * Competitor comparison hub removed (.668) — permanent redirect to Start free.
   * Keeps old SEO/external links from soft-404ing.
   *
   * Dead route aliases (.673) — Mission Control audit: /today, /train, /dashboard,
   * /app, /login, /pricing soft-404'd with no redirects. Canonical: Today = /log,
   * Train = /active. /pricing and /login → Start free (no pay surface).
   */
  async redirects() {
    return [
      { source: '/compare', destination: '/welcome', permanent: true },
      { source: '/compare/:path*', destination: '/welcome', permanent: true },
      { source: '/today', destination: '/log', permanent: true },
      { source: '/train', destination: '/active', permanent: true },
      { source: '/dashboard', destination: '/log', permanent: true },
      { source: '/app', destination: '/log', permanent: true },
      { source: '/login', destination: '/welcome', permanent: true },
      { source: '/pricing', destination: '/welcome', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [{ key: cspHeaderKey(), value: CSP_POLICY }],
      },
      // Cache Ladder v1 — public static form guides (CDN-safe). Never apply to /api/premium/*.
      {
        source: '/form-guides/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/learn/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/social/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

const pwaConfig = withSerwist(nextConfig);

const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim();
const sentryBuildOptions = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
};

let exported = sentryDsn
  ? withSentryConfig(pwaConfig, sentryBuildOptions)
  : pwaConfig;

// ANALYZE=1 npm run build — webpack bundle report (Wave 9)
if (process.env.ANALYZE === '1') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const withBundleAnalyzer = require('@next/bundle-analyzer')({ enabled: true });
  exported = withBundleAnalyzer(exported);
}

module.exports = exported;
