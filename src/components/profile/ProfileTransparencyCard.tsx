'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TransparencyDownloads } from '@/components/transparency/TransparencyDownloads';
import { useTransparencyReport } from '@/hooks/useTransparencyReport';

/** Account entry — visibility + Under the Hood, with downloads on this card. */
export function ProfileTransparencyCard() {
  const { t } = useTranslation();
  const report = useTransparencyReport();
  const summary =
    report.limitsApply === 0
      ? t('transparencyNoLimits', { defaultValue: 'No limits apply' })
      : t('transparencyLimitsApply', {
          count: report.limitsApply,
          defaultValue: '{{count}} limits apply',
        });

  return (
    <div className="house-card space-y-3" data-testid="account-visibility-card">
      <h3 className="flex items-center gap-2 text-2xl font-semibold leading-none tracking-tight">
        <FileText className="h-4 w-4" aria-hidden="true" />
        {t('transparencyCardTitle', { defaultValue: 'Visibility' })}
      </h3>
      <p className="font-semibold text-foreground text-sm">{summary}</p>
      <p className="text-muted-foreground leading-relaxed text-sm">
        {t('transparencyCardLead', {
          defaultValue:
            'See if anything is limited and why. Under the Hood publishes Mission Points boosts and visibility filters. Download includes both, plus labels on this athlete.',
        })}
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button asChild variant="outline" className="min-h-[44px] w-full tap-target">
          <Link href="/account/transparency">
            {t('transparencyCardOpen', { defaultValue: 'Open Visibility' })}
          </Link>
        </Button>
        <Button asChild variant="outline" className="min-h-[44px] w-full tap-target">
          <Link href="/account/under-the-hood">
            {t('hoodCardOpen', { defaultValue: 'Under the Hood' })}
          </Link>
        </Button>
      </div>
      <TransparencyDownloads report={report} />
    </div>
  );
}
