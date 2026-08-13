'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TransparencyDownloads } from '@/components/transparency/TransparencyDownloads';
import { useTransparencyReport } from '@/hooks/useTransparencyReport';

/** Account entry — visibility + Under the Hood, with downloads on this card. */
export function ProfileTransparencyCard() {
  const { t } = useTranslation();
  const report = useTransparencyReport();
  const summary =
    report.limitsApply === 0
      ? t('transparencyNoLimits')
      : t('transparencyLimitsApply', { count: report.limitsApply });

  return (
    <Card className="border-2 border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-4 w-4" aria-hidden="true" />
          {t('transparencyCardTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="font-semibold text-foreground">{summary}</p>
        <p className="text-muted-foreground leading-relaxed">{t('transparencyCardLead')}</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild variant="outline" className="min-h-[44px] w-full tap-target">
            <Link href="/account/transparency">{t('transparencyCardOpen')}</Link>
          </Button>
          <Button asChild variant="outline" className="min-h-[44px] w-full tap-target">
            <Link href="/account/under-the-hood">{t('hoodCardOpen')}</Link>
          </Button>
        </div>
        <TransparencyDownloads report={report} />
      </CardContent>
    </Card>
  );
}
