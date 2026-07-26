'use client';

import { useEffect } from 'react';
import { RotateCcw } from 'lucide-react';

/**
 * Route-segment error boundary. The app is fully client-rendered, so without
 * this any render throw is a blank screen. Local-first data is safe in
 * localStorage — say so, because that's the user's first fear.
 * Sentry is dynamic-imported so the SDK is not on every page's critical path.
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
      void import('@sentry/nextjs').then((Sentry) => {
        Sentry.captureException(error, { extra: { digest: error.digest } });
      });
    }
  }, [error]);

  return (
    /*
     * Matched to `not-found.tsx`, which was already Modernist while this still
     * ran the pre-rebrand pattern: a centred `content-card`, `uppercase` on
     * display type (the caps were Barlow's — Archivo sets its own case), and a
     * `rounded-2xl` 1px secondary. Two error pages in two visual languages is
     * the kind of drift nobody sees until they hit both.
     */
    <div className="flex min-h-[70vh] items-center justify-center p-6">
      <div className="w-full max-w-md">
        <p className="eyebrow-live mb-4">Something broke</p>
        <h1 className="display-section mb-3">That wasn&apos;t supposed to happen.</h1>
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
          Your workouts and progress are safe on this device. Try again — if it keeps happening,
          email support@missionwinning.com.
        </p>
        {/* The digest is a reference someone reads out or pastes into an email,
            so it gets a labelled block instead of trailing a sentence. */}
        {error.digest ? (
          <div className="mb-6 border-2 border-border p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              Reference
            </p>
            <p className="font-mono text-sm tabular-nums">{error.digest}</p>
          </div>
        ) : null}
        <div className="flex flex-col gap-3 border-t-2 border-border pt-6 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="primary-action inline-flex items-center gap-2 sm:w-auto sm:px-8"
          >
            <RotateCcw className="h-5 w-5 shrink-0" aria-hidden />
            Try again
          </button>
          <a
            href="/log"
            className="tap-target inline-flex items-center justify-start border-2 border-foreground px-8 text-sm font-semibold hover:bg-foreground/[0.07]"
          >
            Go to Today
          </a>
        </div>
      </div>
    </div>
  );
}
