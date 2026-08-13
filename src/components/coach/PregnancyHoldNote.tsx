'use client';

/**
 * One-line Coach / hard-session disclaimer when a pregnancy safety hold is on.
 * Not a logger gate. Counsel reviews copy before production.
 */

import { useTranslation } from 'react-i18next';
import { CLINICIAN_HOLD_LINE } from '@/lib/pregnancySafety';

export function PregnancyHoldNote() {
  const { t } = useTranslation();
  return (
    <p className="text-sm text-muted-foreground leading-relaxed" data-testid="pregnancy-hold-note">
      {t('coachPregnancyHoldNote', { defaultValue: CLINICIAN_HOLD_LINE })}
    </p>
  );
}
