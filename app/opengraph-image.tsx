import { ImageResponse } from 'next/og';

export const alt = 'Mission Winning — Train Anywhere. Win Daily.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 64,
          background: 'linear-gradient(145deg, #0a0d12 0%, #111820 45%, #0d1a14 100%)',
          color: '#f8fafc',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            MW
          </div>
          <span style={{ fontSize: 28, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase' }}>
            Mission Winning
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.1, maxWidth: 900 }}>
            Train Anywhere. Win Daily.
          </div>
          <div style={{ marginTop: 20, fontSize: 24, color: '#94a3b8', maxWidth: 800 }}>
            Free core forever · Offline PWA · Mission Coach weekly plans
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: '50%',
              border: '6px solid #34d399',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              fontWeight: 700,
              color: '#34d399',
            }}
          >
            87
          </div>
          <span style={{ fontSize: 18, color: '#64748b' }}>Win Score · Six pillars · One app</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
