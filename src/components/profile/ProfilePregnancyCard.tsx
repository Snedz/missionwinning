'use client';

/**
 * Quiet Account control for the optional pregnancy / postpartum /
 * miscarriage-recovery flag. Not on Today. Not on first paint (More settings).
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PREGNANCY_FLAGS,
  type PregnancyFlag,
  loadPregnancyFlag,
  savePregnancyFlag,
} from '@/lib/pregnancySafety';

const FLAG_KEYS: Record<PregnancyFlag, { key: string; fallback: string }> = {
  none: { key: 'pregnancyFlagNone', fallback: 'None / not applicable' },
  pregnant: { key: 'pregnancyFlagPregnant', fallback: 'Pregnant' },
  postpartum: { key: 'pregnancyFlagPostpartum', fallback: 'Postpartum' },
  miscarriage_recovery: {
    key: 'pregnancyFlagMiscarriage',
    fallback: 'Miscarriage recovery',
  },
};

export function ProfilePregnancyCard() {
  const { t } = useTranslation();
  const [flag, setFlag] = useState<PregnancyFlag>(() => loadPregnancyFlag());

  const onChange = (next: PregnancyFlag) => {
    setFlag(next);
    savePregnancyFlag(next);
  };

  return (
    <Card className="content-card" data-testid="pregnancy-flag-card">
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          {t('pregnancyFlagTitle', { defaultValue: 'Pregnancy & recovery' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground leading-relaxed">
          {t('pregnancyFlagHint', {
            defaultValue:
              'Optional. Stored on this device. Never required to log. Stopping is always allowed.',
          })}
        </p>
        <label htmlFor="pregnancy-flag" className="sr-only">
          {t('pregnancyFlagTitle', { defaultValue: 'Pregnancy & recovery' })}
        </label>
        <select
          id="pregnancy-flag"
          value={flag}
          onChange={(e) => onChange(e.target.value as PregnancyFlag)}
          className="w-full min-h-[44px] rounded-none bg-background border-2 border-border px-3 py-2 text-sm tap-target"
        >
          {PREGNANCY_FLAGS.map((value) => (
            <option key={value} value={value}>
              {t(FLAG_KEYS[value].key, { defaultValue: FLAG_KEYS[value].fallback })}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {t('pregnancyFlagStop', {
            defaultValue:
              'If you have bleeding, cramping, feel faint, have chest pain, or cannot talk: stop and get help. This app is not emergency services.',
          })}
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {t('pregnancyFlagNotCare', {
            defaultValue:
              'This is not prenatal care and does not prevent miscarriage or complications. Not medical advice — ask your clinician.',
          })}
        </p>
      </CardContent>
    </Card>
  );
}
