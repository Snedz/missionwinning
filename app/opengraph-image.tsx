import { ImageResponse } from 'next/og';

export const alt = 'Mission Winning — Train Anywhere. Win Daily.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Modernist OG card: flat paper, ink, one red field — no gradients, no glow.
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
          background: '#f3f2f2',
          color: '#201e1d',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              background: '#201e1d',
              color: '#f3f2f2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: '-0.04em',
            }}
          >
            MW
          </div>
          <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.01em' }}>
            Mission Winning
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              width: 760,
              height: 2,
              background: 'rgba(32,30,29,0.4)',
              marginBottom: 28,
            }}
          />
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              lineHeight: 1.06,
              letterSpacing: '-0.02em',
              maxWidth: 900,
            }}
          >
            Train anywhere. Win daily.
          </div>
          <div style={{ marginTop: 20, fontSize: 24, color: '#5f5e5d', maxWidth: 800 }}>
            Free core forever · Offline PWA · Mission Coach weekly plans
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ec3013',
            color: '#f3f2f2',
            padding: '20px 28px',
          }}
        >
          <span style={{ fontSize: 24, fontWeight: 800 }}>Log a set. Your week rewrites itself.</span>
          <span style={{ fontSize: 20, fontWeight: 800 }}>missionwinning.com</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
