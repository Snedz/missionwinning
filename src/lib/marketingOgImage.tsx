/** JSX trees for Next.js `ImageResponse` (app/opengraph-image.tsx). */

type OgVariant = 'landing' | 'bundle';

const BG = '#0a0d12';
const EMERALD = '#10b981';
const TEAL = '#2dd4bf';
const MUTED = '#94a3b8';

export function marketingOgElement(variant: OgVariant) {
  const isBundle = variant === 'bundle';
  const headline = isBundle ? 'Super Bundle' : 'One app. Six pillars.';
  const subline = isBundle
    ? 'AI Coach · Premium depth · All six pillars'
    : 'Free core forever · Global PWA · Works offline';
  const badge = isBundle ? '6 pillars · 1 subscription' : 'Train · Fuel · Move · Mind · Track · Learn';

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '64px 72px',
        background: `linear-gradient(135deg, ${BG} 0%, #0f172a 45%, #052e2b 100%)`,
        color: '#f8fafc',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 16,
            background: EMERALD,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            fontWeight: 800,
            color: '#052e2b',
          }}
        >
          MW
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '0.04em' }}>MISSION WINNING</div>
          <div style={{ fontSize: 18, color: MUTED }}>Global health super-app</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 900 }}>
        <div
          style={{
            alignSelf: 'flex-start',
            padding: '8px 18px',
            borderRadius: 999,
            border: `1px solid ${EMERALD}55`,
            color: TEAL,
            fontSize: 20,
          }}
        >
          {badge}
        </div>
        <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.03em' }}>{headline}</div>
        <div style={{ fontSize: 32, color: MUTED, lineHeight: 1.35 }}>{subline}</div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 22, color: TEAL, fontWeight: 600 }}>
          {isBundle ? 'View pricing at missionwinning.com/bundle' : 'Start free at missionwinning.com'}
        </div>
        <div
          style={{
            width: 180,
            height: 8,
            borderRadius: 999,
            background: `linear-gradient(90deg, ${EMERALD}, ${TEAL})`,
          }}
        />
      </div>
    </div>
  );
}
