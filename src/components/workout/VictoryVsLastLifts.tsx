'use client';

/**
 * Top lifts vs the previous session of the same name (`.1114`).
 * Up is green. Even or down is amber. First time has no status color.
 */

import { useTranslation } from 'react-i18next';
import {
  formatLiftDelta,
  liftDeltaClass,
  type TopLiftDelta,
} from '@/lib/workout/victoryVsLastLifts';

type Props = {
  lifts: readonly TopLiftDelta[];
};

export function VictoryVsLastLifts({ lifts }: Props) {
  const { t } = useTranslation();
  if (lifts.length === 0) return null;

  return (
    <section
      className="space-y-2 border-t-2 border-border pt-3"
      data-testid="victory-vs-last-lifts"
      aria-label={t('victoryVsLastLiftsLabel', { defaultValue: 'Vs last' })}
    >
      <p className="house-lede font-semibold">
        {t('victoryVsLastLiftsLabel', { defaultValue: 'Vs last' })}
      </p>
      <ul className="space-y-1">
        {lifts.map((lift) => (
          <li key={lift.exerciseId} className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate font-semibold text-foreground">{lift.name}</span>
            {lift.tone === 'first' || lift.delta == null ? (
              <span className="house-lede shrink-0">
                {t('victoryVsLastFirst', { defaultValue: 'First time' })}
              </span>
            ) : (
              <span className={`shrink-0 tabular-nums font-semibold ${liftDeltaClass(lift.tone)}`}>
                {formatLiftDelta(lift.delta)}
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
