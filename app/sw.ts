/// <reference lib="webworker" />
/**
 * Serwist service worker source — compiled to public/sw.js on production build
 * when PRIVATE_MODE is not active. See next.config.js.
 */
import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { NetworkOnly, Serwist } from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  /*
   * `.211` — authenticated API responses must not sit in CacheStorage.
   *
   * `defaultCache`'s `/api/*` entry is `NetworkFirst` with
   * `cacheName: "apis"` and `maxAgeSeconds: 86400`. Passing it unmodified put
   * **24 hours of authenticated responses on the device**, surviving sign-out
   * and served to the next person to use a shared phone while it is offline.
   * That includes `/api/premium/status`, `/api/wearables/status` and —
   * on a product with a `/api/youth/consent-*` surface —
   * `/api/school/class/[code]/export`, which returns a CSV of student names and
   * scores.
   *
   * Serwist's own auth exemption matches `/api/auth/*`; this app's callback is
   * `app/auth/callback/route.ts` → **`/auth/callback`**, which fell through to
   * the catch-all `NetworkFirst` bucket instead.
   *
   * `NetworkOnly` costs nothing here: the offline story is localStorage plus
   * the outbox, and nothing offline reads an API response. These go **before**
   * the spread — serwist takes the first matching strategy.
   */
  runtimeCaching: [
    {
      matcher: ({ url }: { url: URL }) => url.pathname.startsWith('/auth/'),
      handler: new NetworkOnly(),
    },
    {
      matcher: ({ url }: { url: URL }) => url.pathname.startsWith('/api/'),
      handler: new NetworkOnly(),
    },
    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      {
        url: '/offline',
        matcher({ request }) {
          return request.destination === 'document';
        },
      },
    ],
  },
});

serwist.addEventListeners();

/** Web push (Wave 7) — payload from cron nudges; attribution via ?src=push on open. */
self.addEventListener('push', (event) => {
  let title = 'Mission Winning';
  let body = 'Time to train.';
  let url = '/log?src=push';
  // Per-kind, defaulting to the historical value. A shared tag means the newest
  // notification REPLACES any unopened one — an evening wind-down would quietly
  // swallow a comeback the athlete had not seen yet.
  let tag = 'mw-nudge';
  try {
    const data = event.data?.json() as {
      title?: string;
      body?: string;
      data?: { url?: string; tag?: string };
    } | null;
    if (data?.title) title = data.title;
    if (data?.body) body = data.body;
    if (data?.data?.url) url = data.data.url;
    if (data?.data?.tag) tag = data.data.tag;
  } catch {
    try {
      const text = event.data?.text();
      if (text) body = text;
    } catch {
      /* default */
    }
  }
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag,
      data: { url },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const raw = (event.notification.data as { url?: string } | undefined)?.url || '/log?src=push';
  const target = new URL(raw, self.location.origin).href;
  event.waitUntil(
    (async () => {
      const clientsList = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });
      for (const client of clientsList) {
        if ('focus' in client) {
          await client.focus();
          if ('navigate' in client) {
            await (client as WindowClient).navigate(target);
          }
          return;
        }
      }
      await self.clients.openWindow(target);
    })()
  );
});
