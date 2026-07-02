'use client';

import { useTranslation } from 'react-i18next';
import { MarketingScreenshotFrame } from '@/components/marketing/MarketingScreenshotFrame';

const SHOTS = [
  {
    variant: 'today' as const,
    titleKey: 'landingScreenTodayTitle',
    descKey: 'landingScreenTodayDesc',
    assetPath: '/marketing/screenshot-today.svg',
  },
  {
    variant: 'train' as const,
    titleKey: 'landingScreenTrainTitle',
    descKey: 'landingScreenTrainDesc',
    assetPath: '/marketing/screenshot-train.svg',
  },
  {
    variant: 'fuel' as const,
    titleKey: 'landingScreenFuelTitle',
    descKey: 'landingScreenFuelDesc',
    assetPath: '/marketing/screenshot-fuel.svg',
  },
];

/** App-store style screenshot row for landing marketing. */
export function MarketingScreensGallery() {
  const { t } = useTranslation();

  return (
    <section id="screenshots" className="py-12 sm:py-16 border-y border-border/60 bg-muted/10 scroll-mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <div className="text-emerald-400 uppercase tracking-[0.2em] text-xs mb-2">
            {t('landingScreensKicker')}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{t('landingScreensTitle')}</h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">{t('landingScreensSubtitle')}</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-8 sm:gap-6">
          {SHOTS.map((shot) => (
            <MarketingScreenshotFrame key={shot.variant} {...shot} />
          ))}
        </div>
      </div>
    </section>
  );
}
