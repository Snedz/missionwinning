'use client';
/**
 * Page: /account/under-the-hood — BOOSTS / PENALTIES weights.
 * See: docs/TRANSPARENCY_PLAN.md, src/lib/transparency/INDEX.md
 */

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { SlidersHorizontal } from 'lucide-react';
import { PillarPageShell } from '@/components/layout/PillarPageShell';
import { AppLegalFooter } from '@/components/layout/AppLegalFooter';
import { WeightsPanel } from '@/components/transparency/WeightsPanel';
import { TransparencyDownloads } from '@/components/transparency/TransparencyDownloads';
import { APP_BUILD_LABEL } from '@/lib/buildInfo';
import { useTransparencyReport } from '@/hooks/useTransparencyReport';

export function UnderTheHoodPage() {
  const { t } = useTranslation();
  const report = useTransparencyReport();

  return (
    <PillarPageShell
      icon={SlidersHorizontal}
      eyebrow={t('hoodEyebrow', { defaultValue: 'Account' })}
      title={t('hoodPageTitle', { defaultValue: 'Under the Hood' })}
      subtitle={t('hoodSubtitle', {
        defaultValue:
          'Published Mission Points (what this device awards) and visibility filters. Filters never debit points.',
      })}
      footer={<AppLegalFooter showBuild buildLabel={APP_BUILD_LABEL} />}
    >
      <p>
        <Link href="/account" className="text-sm text-primary underline underline-offset-2">
          {t('transparencyBackAccount', { defaultValue: 'Back to Account' })}
        </Link>
        {' · '}
        <Link
          href="/account/transparency"
          className="text-sm text-primary underline underline-offset-2"
        >
          {t('transparencyTitle', { defaultValue: 'Visibility' })}
        </Link>
      </p>

      <TransparencyDownloads report={report} />

      <WeightsPanel
        boosts={report.boosts}
        clubPlannedBoosts={report.clubPlannedBoosts}
        penalties={report.penalties}
        liveSource={report.sources.live}
        clubSource={report.sources.club}
      />

      <p className="text-sm text-muted-foreground">
        {t('hoodPenaltyNote', {
          defaultValue:
            'Report, mute, block, and hide are visibility filters. They do not debit Mission Points.',
        })}
      </p>
      <p className="text-sm text-muted-foreground">
        {t('hoodServerHelp', {
          defaultValue:
            'How to post well in Mission Server: replies from people you trained with beat likes. Likes are weak.',
        })}
      </p>
    </PillarPageShell>
  );
}
