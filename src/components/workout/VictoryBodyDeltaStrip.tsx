'use client';

/**
 * Post-session body-delta chips on Victory — readiness · strain · recovery (.444).
 */

import { useTranslation } from 'react-i18next';
import { formatVictorySignedDelta } from '@/lib/workout/workoutVictory';

type BodyDelta = {
  readiness: number;
  strain: number;
  recovery: number;
};

type Props = {
  bodyDelta: BodyDelta;
};

export function VictoryBodyDeltaStrip({ bodyDelta }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 border-2 border-border bg-background px-3 py-2 text-xs tabular-nums">
      <span className="text-muted-foreground me-1">
        {t('victoryBodyDeltaLabel', { defaultValue: 'What changed' })}
      </span>
      <span className="text-status-warn">
        {t('victoryReadinessDelta', {
          delta: formatVictorySignedDelta(bodyDelta.readiness),
          defaultValue: `Readiness ${formatVictorySignedDelta(bodyDelta.readiness)}`,
        })}
      </span>
      <span className="text-muted-foreground">·</span>
      <span className="text-status-danger">
        {t('victoryStrainDelta', {
          delta: formatVictorySignedDelta(bodyDelta.strain),
          defaultValue: `Strain ${formatVictorySignedDelta(bodyDelta.strain)}`,
        })}
      </span>
      <span className="text-muted-foreground">·</span>
      <span className="text-primary">
        {t('victoryRecoveryDelta', {
          delta: formatVictorySignedDelta(bodyDelta.recovery),
          defaultValue: `Recovery ${formatVictorySignedDelta(bodyDelta.recovery)}`,
        })}
      </span>
    </div>
  );
}
