'use client';
/**
 * Page: /account/flags — founder staged-rollout console.
 * First paint is house leftover (title + subtitle). Fetch follows.
 */

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Flag } from 'lucide-react';
import { PillarPageShell } from '@/components/layout/PillarPageShell';
import { AppLegalFooter } from '@/components/layout/AppLegalFooter';
import { FlagsConsole } from '@/components/flags/FlagsConsole';
import { APP_BUILD_LABEL } from '@/lib/buildInfo';

export function FlagsConsolePage() {
  const { t } = useTranslation();

  return (
    <PillarPageShell
      className="house-account"
      icon={Flag}
      eyebrow={t('flagsConsoleEyebrow', { defaultValue: 'Owner tools' })}
      title={t('flagsConsoleTitle', { defaultValue: 'Feature flags' })}
      subtitle={t('flagsConsoleSubtitle', {
        defaultValue:
          'Stage optional surfaces without a redeploy. Never gates Train. Raising percent only adds people; lowering can drop them.',
      })}
      footer={<AppLegalFooter showBuild buildLabel={APP_BUILD_LABEL} />}
    >
      <p>
        <Link href="/account" className="text-sm text-primary underline underline-offset-2">
          {t('flagsConsoleBack', { defaultValue: 'Back to Account' })}
        </Link>
      </p>
      <FlagsConsole />
    </PillarPageShell>
  );
}
