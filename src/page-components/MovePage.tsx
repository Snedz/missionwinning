'use client';
/**
 * Page: /move — mobility pillar
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useTranslation } from 'react-i18next';
import { QuietMoveLogCard } from '@/components/move/QuietMoveLogCard';
import { PillarPageShell } from '@/components/layout/PillarPageShell';
import { Wind } from 'lucide-react';

export function MovePage() {
  const { t } = useTranslation();

  return (
    <PillarPageShell
      className="house-move"
      icon={Wind}
      eyebrow={t('moveEyebrow', { defaultValue: 'Move' })}
      title={t('moveTitle', { defaultValue: 'Move & Mobility' })}
      subtitle={t('moveQuietHint', {
        defaultValue: 'Rest is fine. Optional — minutes or distance if you have them.',
      })}
    >
      <QuietMoveLogCard />
    </PillarPageShell>
  );
}
