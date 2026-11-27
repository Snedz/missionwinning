import { randomUUID } from 'node:crypto';
import withSerwistInit from '@serwist/next';

const publicKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (publicKey) {
  const parts = publicKey.split('.');
  let anonJwt = false;
  if (parts.length === 3) {
    try {
      anonJwt = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')).role === 'anon';
    } catch {}
  }
  if ((!anonJwt && !/^sb_publishable_[a-z0-9_-]+$/i.test(publicKey)) ||
      publicKey === process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY must be a publishable or anon key, never a server credential.');
  }
}

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
