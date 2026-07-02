import type { MetadataRoute } from 'next';

// Installable PWA manifest (vision.md: "Full PWA experience: installable,
// offline-first, low-data, works on any device/browser anywhere").
// Theme colors match the --background token in src/index.css.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Mission Winning — Train Anywhere. Win Daily.',
    short_name: 'Mission Winning',
    description:
      'The free health everything app: workout tracking, nutrition, mobility, mind, activity, and learning — free core forever, works offline anywhere.',
    id: '/log',
    start_url: '/log',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0a0d12',
    theme_color: '#0a0d12',
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
        src: '/pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
