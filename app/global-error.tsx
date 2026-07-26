'use client';

import { useEffect } from 'react';

/**
 * Last-resort boundary — replaces the entire document when the root layout
 * itself throws, so it must render its own <html>/<body> and use no app CSS
 * (the stylesheet may be part of what crashed). Inline styles only.
 * Sentry is dynamic-imported so the SDK is not on the critical path.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      void import('@sentry/nextjs').then((Sentry) => {
        Sentry.captureException(error, { extra: { digest: error.digest } });
      });
    }
  }, [error]);

  const copyDetails = () => {
    const details = `Mission Winning error\n${new Date().toISOString()}\n${error.digest ?? ''}\n${error.message}\n${error.stack ?? ''}`;
    try {
      void navigator.clipboard.writeText(details);
    } catch {
      // Clipboard unavailable — nothing else to do in a crashed document.
    }
  };

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f3f2f2',
          color: '#201e1d',
          fontFamily: "-apple-system, 'Segoe UI', Roboto, sans-serif",
          padding: '24px',
        }}
      >
        <div style={{ maxWidth: 420, textAlign: 'center' }}>
          <p
            style={{
              fontSize: 11,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#ae1800',
              marginBottom: 16,
            }}
          >
            Mission Winning
          </p>
          <h1 style={{ fontSize: 28, lineHeight: 1.1, margin: '0 0 12px', textTransform: 'uppercase' }}>
            The app hit a wall.
          </h1>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: '#5f5e5d', marginBottom: 24 }}>
            Your data is safe on this device. Reload to recover — if this keeps happening, copy the
            error details and email support@missionwinning.com.
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={reset}
              style={{
                background: '#dd2b0f',
                color: '#fff',
                border: 0,
                borderRadius: 0,
                padding: '13px 28px',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Reload the app
            </button>
            <button
              type="button"
              onClick={copyDetails}
              style={{
                background: 'transparent',
                color: '#201e1d',
                border: '2px solid #201e1d',
                borderRadius: 0,
                padding: '13px 20px',
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              Copy error details
            </button>
          </div>
          {error.digest && (
            <p style={{ fontSize: 11, color: '#5f5e5d', marginTop: 16 }}>Code: {error.digest}</p>
          )}
        </div>
      </body>
    </html>
  );
}
