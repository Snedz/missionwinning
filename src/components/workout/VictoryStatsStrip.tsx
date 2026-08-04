'use client';

/**
 * Volume · sets · duration grid on Victory (.447).
 */

import { useTranslation } from 'react-i18next';
import { formatDuration } from '@/lib/utils';

type Props = {
  totalVolume: number;
  setCount: number;
  durationSeconds: number;
  unitLabel: string;
  formatVolume: (n: number) => string;
};

export function VictoryStatsStrip({
  totalVolume,
  setCount,
  durationSeconds,
  unitLabel,
  formatVolume,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 gap-3 py-2">
      <div className="border-2 border-border bg-background p-3 text-center">
        <p className="text-xs font-medium text-muted-foreground">
          {t('victoryVolume', { defaultValue: 'Volume' })}
        </p>
        <p className="text-xl font-semibold tabular-nums text-foreground">
          {formatVolume(totalVolume)}
        </p>
        <p className="text-xs text-muted-foreground">{unitLabel}</p>
      </div>
      <div className="border-2 border-border bg-background p-3 text-center">
        <p className="text-xs font-medium text-muted-foreground">
          {t('victorySets', { defaultValue: 'Sets' })}
        </p>
        <p className="text-xl font-semibold tabular-nums">{setCount}</p>
        <p className="text-xs text-muted-foreground">{formatDuration(durationSeconds)}</p>
      </div>
    </div>
  );
}
