'use client';

/**
 * Last-resort boundary — replaces the entire document when the root layout
 * itself throws, so it must render its own <html>/<body> and use no app CSS
 * (the stylesheet may be part of what crashed). Inline styles only.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
          background: '#0a0d12',
          color: '#f5f7f4',
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
              color: '#8a94a3',
              marginBottom: 16,
            }}
          >
            Mission Winning
          </p>
          <h1 style={{ fontSize: 28, lineHeight: 1.1, margin: '0 0 12px', textTransform: 'uppercase' }}>
            The app hit a wall.
          </h1>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: '#a8b0bc', marginBottom: 24 }}>
            Your data is safe on this device. Reload to recover — if this keeps happening, copy the
            error details and email support@missionwinning.com.
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={reset}
              style={{
                background: '#26a97c',
                color: '#fff',
                border: 0,
                borderRadius: 14,
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
                color: '#a8b0bc',
                border: '1px solid #2a3140',
                borderRadius: 14,
                padding: '13px 20px',
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              Copy error details
            </button>
          </div>
          {error.digest && (
            <p style={{ fontSize: 11, color: '#5c6675', marginTop: 16 }}>Code: {error.digest}</p>
          )}
        </div>
      </body>
    </html>
  );
}
