'use client';

import { useEffect, useState } from 'react';
import { Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useMissionJourney } from '@/hooks/useMissionJourney';
import { ShareFitnessButton } from '@/components/fitness-test/ShareFitnessButton';
import { buildCommissioningShareText } from '@/lib/shareFitnessMission';
import { showMahaCopy } from '@/lib/americaConfig';
import { readRaw, writeRaw } from '@/lib/storage/safeStorage';

const CELEBRATED_KEY = 'mw_commissioned_celebrated';

export function CommissioningCeremony() {
  const { t } = useTranslation();
  const { isCommissioned, state } = useMissionJourney();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isCommissioned || !state.commissionedAt) return;
    if (readRaw(CELEBRATED_KEY)) return;
    setOpen(true);
  }, [isCommissioned, state.commissionedAt]);

  const dismiss = () => {
    writeRaw(CELEBRATED_KEY, '1');
    setOpen(false);
  };

  if (!open) return null;

  const defaultShare = buildCommissioningShareText(false);
  const mahaShare = buildCommissioningShareText(true);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-foreground/60"
        aria-label="Close"
        onClick={dismiss}
      />
      <div
        className="relative w-full max-w-md border-2 border-[hsl(var(--accent-poster))] bg-card p-8 shadow-none animate-in zoom-in-95 duration-300"
        role="dialog"
        aria-labelledby="commissioning-title"
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center border-2 border-primary bg-background">
          <Award className="h-8 w-8 text-primary" />
        </div>
        <p className="text-xs uppercase tracking-widest text-primary mb-2">
          {t('commissionedLabel', { defaultValue: 'Commissioned' })}
        </p>
        <h2 id="commissioning-title" className="text-2xl font-semibold tracking-tight mb-3">
          {t('commissionedTitle', { defaultValue: 'You are ready for daily duty' })}
        </h2>
        <p className="text-base text-muted-foreground leading-relaxed mb-6">
          {t('commissionedBody', {
            defaultValue:
              'Basic Training and Readiness complete. Today is your command center — one clear action every day. Health for everyone, everywhere.',
          })}
        </p>
        <button type="button" onClick={dismiss} className="primary-action">
          {t('commissionedCta', { defaultValue: 'Continue to Today' })}
        </button>
        <ShareFitnessButton
          text={defaultShare}
          variant="ghost"
          className="mt-3 w-full"
          labelKey="commissionedShare"
          defaultLabel="Share commissioning"
        />
        {(showMahaCopy() || process.env.NODE_ENV === 'development') && (
          <ShareFitnessButton
            text={mahaShare}
            variant="ghost"
            className="mt-1 w-full text-muted-foreground"
            labelKey="commissionedShareMaha"
            defaultLabel="Share — Make America Healthy Again"
          />
        )}
      </div>
    </div>
  );
}
