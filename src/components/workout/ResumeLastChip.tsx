'use client';

/**
 * Train chip — prefill the last finished session (`.1114`).
 * Weights stay editable on the set row. The tone line is the habit, not a scolding.
 */

import { useTranslation } from 'react-i18next';
import {
  RESUME_LAST_CHIP_LABEL,
  RESUME_LAST_TONE,
  type ResumeLastOffer,
} from '@/lib/workout/resumeLastOffer';

type Props = {
  offer: Extract<ResumeLastOffer, { show: true }>;
  onResume: () => void;
};

export function ResumeLastChip({ offer, onResume }: Props) {
  const { t } = useTranslation();
  const label = t('resumeLastChip', { defaultValue: RESUME_LAST_CHIP_LABEL });
  const tone = t('resumeLastTone', { defaultValue: RESUME_LAST_TONE });

  return (
    <div data-testid="resume-last">
      <p className="house-lede">{tone}</p>
      <button
        type="button"
        className="house-btn house-btn-ghost min-h-[44px] tap-target"
        data-testid="resume-last-chip"
        onClick={onResume}
        aria-label={`${label}. ${tone}. ${offer.sameLabel}`}
      >
        {label}
      </button>
    </div>
  );
}
