'use client';
/**
 * Page: /profile — You leftover
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { User } from 'lucide-react';
import { PillarPageShell } from '@/components/layout/PillarPageShell';
import { AppLegalFooter } from '@/components/layout/AppLegalFooter';
import { APP_BUILD_LABEL } from '@/lib/buildInfo';
import { loadOperatorName } from '@/lib/leaderboard/computeLocalStats';

export function ProfilePage() {
  const { t } = useTranslation();
  const [callSign, setCallSign] = useState('');
  useEffect(() => {
    setCallSign(loadOperatorName());
  }, []);
  const title = callSign.trim() || t('athletePageTitle', { defaultValue: 'You' });

  return (
    <PillarPageShell
      className="house-profile"
      icon={User}
      eyebrow={t('profileEyebrow', { defaultValue: 'You' })}
      title={title}
      subtitle={t('athletePageSubtitle', {
        defaultValue: 'Authored here. Counted honestly. Yours on this device.',
      })}
      footer={<AppLegalFooter showBuild buildLabel={APP_BUILD_LABEL} />}
    >
      <p className="pt-2">
        <Link href="/account" className="house-btn house-btn-ghost">
          {t('athletePageSettingsLink', { defaultValue: 'Account & settings' })}
        </Link>
      </p>
    </PillarPageShell>
  );
}
