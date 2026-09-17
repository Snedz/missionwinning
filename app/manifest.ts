import type { MetadataRoute } from 'next';
import { isOfflineInstallable } from '@/lib/offlineCapability';
import { pwaStartUrl } from '@/lib/pwaStartUrl';

/**
 * Capability claim in the installable manifest description.
 * Same flag as Serwist / NEXT_PUBLIC_PWA_ENABLED — never assert offline
 * installability while PRIVATE_MODE disables the service worker.
 */
function manifestDescription(): string {
  if (isOfflineInstallable()) {
    return 'Free offline workout logger + adaptive Mission Coach from your logs — free core forever, works offline anywhere.';
  }
  return 'Free workout logger + adaptive Mission Coach from your logs — free core forever.';
}

// Installable PWA manifest (vision.md: "Full PWA experience: installable,
// offline-first, low-data, works on any device/browser anywhere").
// Theme colors match the --background token in src/index.css.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Mission Winning — Log a set. Offline.',
    short_name: 'Mission Winning',
    description: manifestDescription(),
    // id pins install identity — do not change without product sign-off.
    id: '/log',
    // Same predicate as Serwist disable in next.config.js. Gated → /private
    // (invite cold install). Ungated / Preview / gate-build → /log (Today).
    start_url: pwaStartUrl(),
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f3f2f2',
    theme_color: '#f3f2f2',
    categories: ['fitness', 'health', 'lifestyle', 'sports'],
    icons: [
      {
        src: '/pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
