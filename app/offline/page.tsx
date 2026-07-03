import Link from 'next/link';

/**
 * Offline fallback document (next-pwa `fallbacks.document`). Served by the
 * service worker when a navigation misses both network and cache.
 */
export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
      <div className="content-card w-full max-w-md p-8 text-center">
        <p className="eyebrow mb-4">No connection</p>
        <h1 className="font-display mb-3 text-3xl font-semibold uppercase leading-none">
          Offline — but not off mission.
        </h1>
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
          This page isn&apos;t cached yet, but everything you&apos;ve already used keeps working —
          your workouts live on this device and sync when you&apos;re back online.
        </p>
        <Link href="/log" className="primary-action">
          Open Today
        </Link>
      </div>
    </div>
  );
}
