'use client';
/**
 * Page: /server — Garage leftover
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PillarPageHeader } from '@/components/layout/PillarPageHeader';

export function ServerPage() {
  const { t } = useTranslation();

  return (
    <div className="house-garage p-6">
      <PillarPageHeader
        icon={MessageSquare}
        eyebrow={t('serverEyebrow', { defaultValue: 'Mission Server' })}
        title={t('serverTitle', { defaultValue: 'Garage' })}
        subtitle={t('serverLocalNote', {
          defaultValue:
            'Guests: this device only. Signed in: shared Garage rooms. Coach never reads the chat.',
        })}
      />
    </div>
  );
}
