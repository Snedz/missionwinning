'use client';

/**
 * Duration · volume · sets grid on Victory (.447 / vs-last .700).
 * Deltas are muted ink in both directions — colouring them would spend the
 * one red on scolding (ScoreNumeral).
 */

import { useTranslation } from 'react-i18next';
import { formatDuration } from '@/lib/utils';
import type { VictorySessionCompare } from '@/lib/workout/victoryReceipt';
import {
  formatReceiptDurationDelta,
  formatReceiptSigned,
} from '@/lib/workout/victoryReceipt';

type Props = {
  totalVolume: number;
  setCount: number;
  durationSeconds: number;
  unitLabel: string;
  formatVolume: (n: number) => string;
  vsLast?: VictorySessionCompare | null;
};

function VsLastLine({ children }: { children: string | null }) {
  if (!children) return null;
  return (
    <p className="mt-1 text-[11px] tabular-nums text-muted-foreground" data-testid="victory-vs-last">
      {children}
    </p>
  );
}

export function VictoryStatsStrip({
  totalVolume,
  setCount,
  durationSeconds,
  unitLabel,
  formatVolume,
  vsLast = null,
}: Props) {
  const { t } = useTranslation();
  const vs = t('victoryVsLast', { defaultValue: 'vs last' });

  const durationDelta =
    vsLast && vsLast.durationDelta !== 0
      ? `${formatReceiptDurationDelta(vsLast.durationDelta)} ${vs}`
      : null;
  const volumeDelta =
    vsLast && vsLast.volumeDelta !== 0
      ? `${formatReceiptSigned(vsLast.volumeDelta)} ${unitLabel} ${vs}`
      : null;
  const setsDelta =
    vsLast && vsLast.setCountDelta !== 0
      ? `${formatReceiptSigned(vsLast.setCountDelta)} ${vs}`
      : null;

  return (
    <div className="grid grid-cols-3 gap-2 py-2">
      <div className="border-2 border-border bg-background p-3 text-center">
        <p className="text-xs font-semibold text-muted-foreground">
          {t('victoryDuration', { defaultValue: 'Duration' })}
        </p>
        <p className="text-xl font-semibold tabular-nums text-foreground">
          {formatDuration(durationSeconds)}
        </p>
        <VsLastLine>{durationDelta}</VsLastLine>
      </div>
      <div className="border-2 border-border bg-background p-3 text-center">
        <p className="text-xs font-semibold text-muted-foreground">
          {t('victoryVolume', { defaultValue: 'Volume' })}
        </p>
        <p className="text-xl font-semibold tabular-nums text-foreground">
          {formatVolume(totalVolume)}
        </p>
        <p className="text-xs text-muted-foreground">{unitLabel}</p>
        <VsLastLine>{volumeDelta}</VsLastLine>
      </div>
      <div className="border-2 border-border bg-background p-3 text-center">
        <p className="text-xs font-semibold text-muted-foreground">
          {t('victorySets', { defaultValue: 'Sets' })}
        </p>
        <p className="text-xl font-semibold tabular-nums">{setCount}</p>
        <VsLastLine>{setsDelta}</VsLastLine>
      </div>
    </div>
  );
}
