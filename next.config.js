const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  // Cache documents on client-side navigation too, so pages a user has
  // visited keep working offline (the core "train anywhere" promise).
  cacheOnFrontEndNav: true,
  // Cold-miss navigations while offline land on a branded page instead of
  // the browser error screen. NOTE: not `/_offline` — App Router treats
  // underscore-prefixed folders as private (404), which would abort the
  // whole service-worker install when workbox precaches the fallback.
  fallbacks: {
    document: '/offline',
  },
  // Disable PWA precache while private gate is active (prevents offline leak of full app).
  disable:
    process.env.NODE_ENV === 'development' ||
    process.env.PRIVATE_MODE === 'true' ||
    (process.env.NODE_ENV === 'production' && process.env.PRIVATE_MODE !== 'false'),
});

/** @see PROTECTION.md — enforce in production unless CSP_ENFORCE=false */
const CSP_POLICY =
  "default-src 'self'; " +
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
  "style-src 'self' 'unsafe-inline'; " +
  "img-src 'self' data: blob: https:; " +
  "font-src 'self' data:; " +
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://eu.i.posthog.com https://us.i.posthog.com https://app.posthog.com; " +
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
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [{ key: cspHeaderKey(), value: CSP_POLICY }],
      },
    ];
  },
};

module.exports = withPWA(nextConfig);
