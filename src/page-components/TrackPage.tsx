'use client';
/**
 * Page: /track — track pillar
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useTranslation } from 'react-i18next';
import { BodyMetricsCard } from '@/components/track/BodyMetricsCard';
import { PillarPageShell } from '@/components/layout/PillarPageShell';
import { Scale } from 'lucide-react';

export function TrackPage() {
  const { t } = useTranslation();

  return (
    <PillarPageShell
      className="house-track"
      icon={Scale}
      eyebrow={t('trackEyebrow', { defaultValue: 'Track' })}
      title={t('trackTitle', { defaultValue: 'Track' })}
      subtitle={t('trackSubtitleBrief', {
        defaultValue: 'A number you already have. Scale or tape. Never required to train.',
      })}
    >
      <BodyMetricsCard />
    </PillarPageShell>
  );
}
