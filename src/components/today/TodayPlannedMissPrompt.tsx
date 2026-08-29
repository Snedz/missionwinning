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
    <div className="house-reentry space-y-2" data-testid="planned-miss-reentry" role="status">
      <p className="house-lede">
        {t('plannedMissLine', { defaultValue: 'A planned session is still here.' })}
      </p>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <button
          type="button"
          onClick={onDoNow}
          className="house-btn house-btn-ghost min-h-[44px] tap-target"
        >
          {t('plannedMissDoNow', { defaultValue: 'Do it now' })}
        </button>
        <button
          type="button"
          data-testid="planned-miss-skip"
          onClick={onSkip}
          className="house-btn house-btn-ghost min-h-[44px] tap-target"
        >
          {t('plannedMissSkip', { defaultValue: 'Skip' })}
        </button>
        {offer.canSlide ? (
          <button
            type="button"
            onClick={onSlide}
            className="house-btn house-btn-ghost min-h-[44px] tap-target"
          >
            {t('plannedMissSlide', { defaultValue: 'Slide' })}
          </button>
        ) : null}
      </div>
    </div>
  );
}
