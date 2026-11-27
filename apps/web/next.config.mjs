import { randomUUID } from 'node:crypto';
import withSerwistInit from '@serwist/next';

const revision = randomUUID();
const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  register: false,
  reloadOnOnline: false,
  disable: process.env.NODE_ENV === 'development',
  additionalPrecacheEntries: [
    '/', '/log', '/active', '/victory', '/coach', '/history', '/profile',
    '/manifest.webmanifest', '/favicon.svg', '/fonts/archivo-var.woff2', '/icon-192.png', '/icon-512.png',
  ]
    .map((url) => ({ url, revision })),
});

export default withSerwist({
  transpilePackages: ['@missionwinning/mw-core'],
  async headers() {
    return [{ source: '/sw.js', headers: [{ key: 'Cache-Control', value: 'no-cache' }] }];
  },
});
