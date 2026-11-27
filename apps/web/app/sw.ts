import { NavigationRoute, Serwist, type PrecacheEntry, type SerwistGlobalConfig } from 'serwist';

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
});

const precache = serwist.routes.get('GET')?.[0];
if (precache) serwist.unregisterRoute(precache);
serwist.registerRoute(new NavigationRoute(async ({ request, url }) => {
  try {
    return await fetch(request, { cache: 'no-cache' });
  } catch (error) {
    if (url.origin === self.location.origin && !url.search) {
      const offline = await serwist.matchPrecache(request);
      if (offline) return offline;
    }
    throw error;
  }
}));
if (precache) serwist.registerRoute(precache);
serwist.addEventListeners();
