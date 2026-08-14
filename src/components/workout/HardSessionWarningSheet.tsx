'use client';

/**
 * Pre-start warning for marked hard sessions (PFT, 2-mile / max / test, field test).
 * Not a logger gate — Back does not start; Log set on a normal session is untouched.
 */

import { useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { AdaptiveOverlay } from '@/components/ui/AdaptiveOverlay';

type Props = {
  open: boolean;
  onContinue: () => void;
  onBack: () => void;
};

export function HardSessionWarningSheet({ open, onContinue, onBack }: Props) {
  const { t } = useTranslation();
  const titleId = useId();
  const continueRef = useRef<HTMLButtonElement | null>(null);

  return (
    <AdaptiveOverlay
      open={open}
      onClose={onBack}
      size="sm"
      titleId={titleId}
      eyebrow={t('hardSessionEyebrow', { defaultValue: 'Before a hard session' })}
      title={t('hardSessionTitle', { defaultValue: 'Stopping is allowed' })}
      initialFocusRef={continueRef}
      bodyClassName="p-5 space-y-3"
      footer={
        <div className="flex flex-col gap-2">
          <Button
            ref={continueRef}
            type="button"
            variant="default"
            className="primary-action w-full min-h-[52px] tap-target"
            onClick={onContinue}
          >
            {t('hardSessionContinue', { defaultValue: 'I understand — start' })}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full min-h-[52px] border-2 border-border tap-target"
            onClick={onBack}
          >
            {t('hardSessionBack', { defaultValue: 'Back' })}
          </Button>
        </div>
      }
    >
      <p className="text-sm text-muted-foreground leading-relaxed">
        {t('hardSessionLead', {
          defaultValue:
            'A max-effort or timed test can be dangerous. This is not the default way to train.',
        })}
      </p>
      <p className="text-sm leading-relaxed">
        {t('hardSessionStop', {
          defaultValue:
            'Stop if you have chest pain, feel faint, have severe shortness of breath, or cannot talk.',
        })}
      </p>
      <p className="text-sm text-muted-foreground leading-relaxed">
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
      <p className="text-sm text-muted-foreground leading-relaxed">
        {t('hardSessionClinician', {
          defaultValue:
            'Talk with a clinician before max-effort tests if you have a heart, breathing, or other health condition, or if you are unsure.',
        })}
      </p>
    </AdaptiveOverlay>
  );
}
