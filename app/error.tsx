'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

/**
 * Route-segment error boundary. The app is fully client-rendered, so without
 * this any render throw is a blank screen. Local-first data is safe in
 * localStorage — say so, because that's the user's first fear.
 */
export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Route error:', error);
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.captureException(error, { extra: { digest: error.digest } });
    }
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-6">
      <div className="content-card w-full max-w-md p-8 text-center">
        <p className="eyebrow mb-4">Something broke</p>
        <h1 className="font-display mb-3 text-3xl font-semibold uppercase leading-none">
          That wasn&apos;t supposed to happen.
        </h1>
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
          Your workouts and progress are safe on this device. Try again — if it keeps happening,
          email support@missionwinning.com{error.digest ? ` with code ${error.digest}` : ''}.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button type="button" onClick={reset} className="primary-action sm:w-auto sm:px-8">
            Try again
          </button>
          <a
            href="/log"
            className="tap-target inline-flex items-center justify-center rounded-2xl border border-border px-8 text-sm font-medium hover:bg-secondary"
          >
            Go to Today
          </a>
        </div>
      </div>
    </div>
  );
}
