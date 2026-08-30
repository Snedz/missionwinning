'use client';

/**
 * Pre-start warning for marked hard sessions (PFT, 2-mile / max / test, field test).
 * Not a logger gate — Back does not start; Log set on a normal session is untouched.
 */

import { useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { AdaptiveOverlay } from '@/components/ui/AdaptiveOverlay';
import {
  hardSessionStopLine,
  isPregnancySafetyHold,
  loadPregnancyFlag,
} from '@/lib/pregnancySafety';

type Props = {
  open: boolean;
  onContinue: () => void;
  onBack: () => void;
};

export function HardSessionWarningSheet({ open, onContinue, onBack }: Props) {
  const { t } = useTranslation();
  const titleId = useId();
  const continueRef = useRef<HTMLButtonElement | null>(null);
  const flag = loadPregnancyFlag();
  const stopLine = hardSessionStopLine(flag);
  const holdOn = isPregnancySafetyHold(flag);

  return (
    <AdaptiveOverlay
      open={open}
      onClose={onBack}
      size="sm"
      className="mw-house house-hard-session"
      titleId={titleId}
      eyebrow={t('hardSessionEyebrow', { defaultValue: 'Before a hard session' })}
      title={t('hardSessionTitle', { defaultValue: 'Stopping is allowed' })}
      initialFocusRef={continueRef}
      bodyClassName="p-5 space-y-3"
      footer={
        <div className="flex flex-col gap-2">
          <button
            ref={continueRef}
            type="button"
            className="house-btn min-h-[52px] w-full tap-target"
            onClick={onContinue}
          >
            {t('hardSessionContinue', { defaultValue: 'I understand — start' })}
          </button>
          <button
            type="button"
            className="house-btn house-btn-ghost min-h-[52px] w-full tap-target"
            onClick={onBack}
          >
            {t('hardSessionBack', { defaultValue: 'Back' })}
          </button>
        </div>
      }
    >
      <p className="house-lede text-sm">
        {t('hardSessionLead', {
          defaultValue:
            'A max-effort or timed test can be dangerous. This is not the default way to train.',
        })}
      </p>
      <p className="text-sm leading-relaxed" data-testid="hard-session-stop">
        {holdOn
          ? t('hardSessionStopPregnancy', { defaultValue: stopLine })
          : t('hardSessionStop', { defaultValue: stopLine })}
      </p>
      <p className="house-lede text-sm">
        {t('hardSessionNotCare', {
          defaultValue:
            'This app is not medical care and cannot prevent a medical emergency.',
        })}
      </p>
      <p className="text-sm leading-relaxed">
        {t('hardSessionEmergency', {
          defaultValue:
            'If this is an emergency, call local emergency services — not this app.',
        })}
      </p>
      <p className="house-lede text-sm">
        {t('hardSessionClinician', {
          defaultValue:
            'Talk with a clinician before max-effort tests if you have a heart, breathing, or other health condition, or if you are unsure.',
        })}
      </p>
    </AdaptiveOverlay>
  );
}
