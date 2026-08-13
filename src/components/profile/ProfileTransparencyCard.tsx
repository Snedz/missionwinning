'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/** Account entry to the Why-this report — day-one stack, not buried in More. */
export function ProfileTransparencyCard() {
  const { t } = useTranslation();

  return (
    <Card className="border-2 border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-4 w-4" aria-hidden="true" />
          {t('transparencyCardTitle', { defaultValue: 'Why this' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-muted-foreground leading-relaxed">
          {t('transparencyCardLead', {
            defaultValue:
              'See why the logger stays free, whether this deploy is gated, region policy, this week\'s Coach sessions, the earn table, and Super Bundle notify-until-Stripe. Download the full report.',
          })}
        </p>
        <Button asChild variant="outline" className="min-h-[44px] w-full tap-target">
          <Link href="/account/transparency">
            {t('transparencyCardOpen', { defaultValue: 'Open Why this' })}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
