/**
 * Shared brand card for Next.js opengraph-image routes.
 * Matches app/opengraph-image.tsx language: Modernist flat paper, ink, one red rule.
 */
export function OgBrandCard({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
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
        <span
          style={{
            fontSize: 26,
            fontWeight: 800,
            letterSpacing: '-0.01em',
          }}
        >
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
            fontSize: title.length > 48 ? 40 : 52,
            fontWeight: 800,
            lineHeight: 1.06,
            letterSpacing: '-0.02em',
            maxWidth: 980,
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div style={{ marginTop: 20, fontSize: 22, color: '#5f5e5d', maxWidth: 900 }}>
            {subtitle}
          </div>
        ) : null}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#ec3013',
          color: '#f3f2f2',
          padding: '16px 24px',
          fontSize: 18,
          fontWeight: 800,
        }}
      >
        <span>Free core forever · Offline PWA · Train anywhere</span>
        <span>missionwinning.com</span>
      </div>
    </div>
  );
}
