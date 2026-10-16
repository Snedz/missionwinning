'use client';

/**
 * Top lifts vs the previous session of the same name (`.1114`).
 * Up is green. Even or down is amber. First time has no status color.
 * Session headline (`.1145`): "N of M up vs last time", or an honest first-time
 * line. The win stays on the session — no feed, no likes, no paywalled chart.
 */

import { useTranslation } from 'react-i18next';
import {
  formatLiftDelta,
  liftDeltaClass,
  vsLastHeadline,
  type TopLiftDelta,
} from '@/lib/workout/victoryVsLastLifts';

type Props = {
  lifts: readonly TopLiftDelta[];
};

export function VictoryVsLastLifts({ lifts }: Props) {
  const { t } = useTranslation();
  if (lifts.length === 0) return null;
  const headline = vsLastHeadline(lifts);

  return (
    <section
      className="space-y-2 border-t-2 border-border pt-3"
      data-testid="victory-vs-last-lifts"
      aria-label={t('victoryVsLastLiftsLabel', { defaultValue: 'Vs last' })}
    >
      <p className="house-lede font-semibold">
        {t('victoryVsLastLiftsLabel', { defaultValue: 'Vs last' })}
      </p>
      {headline ? (
        <p className="text-sm text-foreground" data-testid="victory-vs-last-headline">
          {headline.kind === 'first'
            ? t('victoryVsLastHeadlineFirst', {
                defaultValue: 'First time on this session. Next time compares here.',
              })
            : t('victoryVsLastHeadline', {
                up: headline.up,
                compared: headline.compared,
                defaultValue: '{{up}} of {{compared}} up vs last time',
              })}
        </p>
      ) : null}
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
