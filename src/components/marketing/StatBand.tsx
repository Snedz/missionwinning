'use client';

import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

const STAT_KEYS = [
  { key: 'landingStatExercises', defaultValue: '217 exercises' },
  { key: 'landingStatOffline', defaultValue: 'Offline PWA' },
  { key: 'landingStatLangs', defaultValue: '14 languages' },
  { key: 'landingStatCore', defaultValue: '$0 core' },
  { key: 'landingStatAccount', defaultValue: 'No account required' },
] as const;

type StatBandProps = {
  className?: string;
};

/**
 * Full-bleed mono telemetry strip.
 * Static wrap on mobile; infinite ticker on md+ (paused under reduced-motion).
 */
export function StatBand({ className }: StatBandProps) {
  const { t } = useTranslation();
  const items = STAT_KEYS.map((s) => t(s.key, { defaultValue: s.defaultValue }));

  return (
    <div
      className={cn(
        'section-seam overflow-hidden border-y border-border/30 bg-surface-raised/80',
        className
      )}
      role="presentation"
    >
      {/* Mobile: static wrap */}
      <div className="relative z-[1] mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-5 gap-y-2 px-5 py-3 md:hidden">
        {items.map((label) => (
          <span
            key={label}
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground tabular-nums"
          >
            {label}
          </span>
        ))}
      </div>

      {/* md+: marquee (duplicated track for seamless loop) */}
      <div className="relative z-[1] hidden py-3 md:block">
        <div className="ticker-track gap-10 px-5">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center gap-10">
              {items.map((label) => (
                <span
                  key={`${copy}-${label}`}
                  className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground tabular-nums"
                >
                  {label}
                  <span className="ml-10 text-border" aria-hidden>
                    ·
                  </span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
