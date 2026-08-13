'use client';

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { APP_BUILD_LABEL } from '@/lib/buildInfo';
import { formatTransparencyJson, formatTransparencyText } from '@/lib/transparency/download';
import type { TransparencyReport } from '@/lib/transparency/types';
import { triggerTextDownload } from '@/components/transparency/triggerDownload';

type Props = {
  report: TransparencyReport;
  className?: string;
};

export function TransparencyDownloads({ report, className }: Props) {
  const { t } = useTranslation();

  return (
    <div className={className ?? 'flex flex-col gap-2 sm:flex-row'}>
      <Button
        type="button"
        variant="outline"
        className="min-h-[44px] tap-target"
        onClick={() =>
          triggerTextDownload(
            `mission-winning-visibility-${APP_BUILD_LABEL}.json`,
            formatTransparencyJson(report),
            'application/json'
          )
        }
      >
        {t('transparencyDownloadJson')}
      </Button>
      <Button
        type="button"
        variant="outline"
        className="min-h-[44px] tap-target"
        onClick={() =>
          triggerTextDownload(
            `mission-winning-visibility-${APP_BUILD_LABEL}.txt`,
            formatTransparencyText(report),
            'text/plain'
          )
        }
      >
        {t('transparencyDownloadText')}
      </Button>
    </div>
  );
}
