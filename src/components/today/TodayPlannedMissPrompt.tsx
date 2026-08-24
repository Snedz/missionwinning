'use client';

import { useTranslation } from 'react-i18next';
import type { PlannedMissOffer } from '@/lib/coach/plannedMiss';

/**
 * Quiet planned-day miss offer on Today's Start field.
 * One red Start stays on the dock. These are text actions — no shame card.
 */
export function TodayPlannedMissPrompt({
  offer,
  onDoNow,
  onSkip,
  onSlide,
}: {
  offer: PlannedMissOffer;
  onDoNow: () => void;
  onSkip: () => void;
  onSlide: () => void;
}) {
  const { t } = useTranslation();
  if (!offer.show) return null;

  return (
    <div className="mb-2.5 space-y-2" data-testid="planned-miss-reentry" role="status">
      <p className="poster-sub text-sm leading-relaxed">
        {t('plannedMissLine', { defaultValue: 'A planned session is still here.' })}
      </p>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <button
          type="button"
          onClick={onDoNow}
          className="min-h-[44px] text-sm font-medium text-primary underline-offset-2 hover:underline"
        >
          {t('plannedMissDoNow', { defaultValue: 'Do it now' })}
        </button>
        <button
          type="button"
          data-testid="planned-miss-skip"
          onClick={onSkip}
          className="min-h-[44px] text-sm text-muted-foreground hover:text-foreground"
        >
          {t('plannedMissSkip', { defaultValue: 'Skip' })}
        </button>
        {offer.canSlide ? (
          <button
            type="button"
            onClick={onSlide}
            className="min-h-[44px] text-sm text-muted-foreground hover:text-foreground"
          >
            {t('plannedMissSlide', { defaultValue: 'Slide' })}
          </button>
        ) : null}
      </div>
    </div>
  );
}
