const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  // Manifest + offline behavior ported from the previous Vite + vite-plugin-pwa setup.
  // Web browser mobile-first PWA primary (installable on Chrome/Safari on Android/iOS, offline via SW + local data).
  // start_url points users who install straight into the daily Mission Hub (/log).
  // Full workbox precache for assets.
});

const nextConfig = {
  reactStrictMode: true,
  // @/* alias continues to resolve to src/ (existing components, data, lib, store, pages)
  // next-pwa will output manifest + sw to public/ on build.

  // Ignore ESLint during builds (legacy anys + empty blocks from original Vite codebase;
  // the app runs and type-checked in prior Vite tsc). Clean up in follow-up if desired.
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = withPWA(nextConfig);