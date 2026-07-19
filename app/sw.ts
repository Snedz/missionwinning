/// <reference lib="webworker" />
/**
 * Serwist service worker source — compiled to public/sw.js on production build
 * when PRIVATE_MODE is not active. See next.config.js.
 */
import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist } from 'serwist';

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
  runtimeCaching: defaultCache,
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
  try {
    const data = event.data?.json() as {
      title?: string;
      body?: string;
      data?: { url?: string };
    } | null;
    if (data?.title) title = data.title;
    if (data?.body) body = data.body;
    if (data?.data?.url) url = data.data.url;
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
      tag: 'mw-nudge',
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
