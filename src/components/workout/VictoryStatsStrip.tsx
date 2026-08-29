'use client';

/**
 * Duration · volume · sets grid on Victory (.447 / vs-last .713).
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
import { formatWorkoutVolumeDisplay } from '@/lib/workout/volumeDisplay';

type Props = {
  totalVolume: number;
  workingReps: number;
  setCount: number;
  durationSeconds: number;
  unitLabel: string;
  formatVolume: (n: number) => string;
  vsLast?: VictorySessionCompare | null;
};

function VsLastLine({ children }: { children: string | null }) {
  if (!children) return null;
  return (
    <p className="mt-1 house-lede house-victory-vs-last tabular-nums" data-testid="victory-vs-last">
      {children}
    </p>
  );
}

export function VictoryStatsStrip({
  totalVolume,
  workingReps,
  setCount,
  durationSeconds,
  unitLabel,
  formatVolume,
  vsLast = null,
}: Props) {
  const { t } = useTranslation();
  const vs = t('victoryVsLast', { defaultValue: 'vs last' });
  const volume = formatWorkoutVolumeDisplay(totalVolume, workingReps, unitLabel, formatVolume);

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
    <div className="mw-house house-victory grid grid-cols-3 gap-2 py-2">
      <div className="border-2 border-border bg-background p-3 text-center">
        <p className="house-lede house-victory-stat-label font-semibold">
          {t('victoryDuration', { defaultValue: 'Duration' })}
        </p>
        <p className="text-xl font-semibold tabular-nums text-foreground">
          {formatDuration(durationSeconds)}
        </p>
        <VsLastLine>{durationDelta}</VsLastLine>
      </div>
      <div className="border-2 border-border bg-background p-3 text-center">
        <p className="house-lede house-victory-stat-label font-semibold">
          {t('victoryVolume', { defaultValue: 'Volume' })}
        </p>
        <p className="text-xl font-semibold tabular-nums text-foreground">
          {volume.value}
          <span className="ms-1 text-xs font-semibold text-muted-foreground">{volume.unit}</span>
        </p>
        <VsLastLine>{volumeDelta}</VsLastLine>
      </div>
      <div className="border-2 border-border bg-background p-3 text-center">
        <p className="house-lede house-victory-stat-label font-semibold">
          {t('victorySets', { defaultValue: 'Sets' })}
        </p>
        <p className="text-xl font-semibold tabular-nums">{setCount}</p>
        <VsLastLine>{setsDelta}</VsLastLine>
      </div>
    </div>
  );
}
