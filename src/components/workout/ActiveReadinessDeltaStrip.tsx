'use client';

/**
 * Post-check-in readiness delta + optional volume-trim offer on Active (.432).
 */

import { useTranslation } from 'react-i18next';
import {
  shouldShowReadinessDelta,
  shouldShowVolumeTrimOffer,
} from '@/lib/workout/activeWorkoutHelpers';
import {
  volumeTrimToastCopy,
  volumeTrimToastKind,
} from '@/lib/workout/activeSessionCheckIn';

type Props = {
  readinessBefore: number | null;
  readinessAfter: number | null;
  offerVolumeTrim: boolean;
  hasPlan: boolean;
  /** Returns truthy when today's plan volume was reduced. */
  onReduceVolume: () => unknown;
  onDismissOffer: () => void;
  toast: (opts: { title: string; description: string }) => void;
};

export function ActiveReadinessDeltaStrip({
  readinessBefore,
  readinessAfter,
  offerVolumeTrim,
  hasPlan,
  onReduceVolume,
  onDismissOffer,
  toast,
}: Props) {
  const { t } = useTranslation();

  if (!shouldShowReadinessDelta(readinessBefore, readinessAfter)) return null;

  return (
    <div
      className="house-readiness flex flex-wrap items-center gap-2"
      data-testid="active-readiness-delta"
    >
      <span className="house-kicker">
        {t('sessionReadinessDelta', {
          defaultValue: 'Readiness {{from}} → {{to}}',
          from: readinessBefore,
          to: readinessAfter,
        })}
      </span>
      {shouldShowVolumeTrimOffer(offerVolumeTrim, hasPlan) ? (
        <button
          type="button"
          className="house-btn house-btn-ghost min-h-[44px] tap-target"
          onClick={() => {
            const next = onReduceVolume();
            const copy = volumeTrimToastCopy(volumeTrimToastKind(!!next));
            toast({
              title: t(copy.titleKey, { defaultValue: copy.titleDefault }),
              description: t(copy.descKey, { defaultValue: copy.descDefault }),
            });
            onDismissOffer();
          }}
        >
          {t('sessionReduceVolume', { defaultValue: "Reduce today's volume" })}
        </button>
      ) : null}
    </div>
  );
}
