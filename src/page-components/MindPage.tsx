'use client';
/**
 * Page: /mind — mind pillar
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useTranslation } from 'react-i18next';
import { DailyCheckIn } from '@/components/pillars/DailyCheckIn';
import { PillarPageShell } from '@/components/layout/PillarPageShell';
import { Brain } from 'lucide-react';

export function MindPage() {
  const { t } = useTranslation();

  return (
    <PillarPageShell
      className="house-mind"
      icon={Brain}
      eyebrow={t('mindEyebrow', { defaultValue: 'Mind' })}
      title={t('mindTitle', { defaultValue: 'Mind & Recovery' })}
      subtitle={t('mindSubtitleBrief', {
        defaultValue: 'Check in.',
      })}
    >
      <DailyCheckIn />
    </PillarPageShell>
  );
}
