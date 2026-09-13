'use client';

/**
 * Quiet Account control for the optional pregnancy / postpartum flag.
 * Not on Today. Not on first paint (More settings).
 *
 * Athlete labels: None / Pregnant / Postpartum only. The stored
 * `miscarriage_recovery` value is UNSIGNED as copy — not shown here.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ATHLETE_VISIBLE_FLAGS,
  type PregnancyFlag,
  isAthleteVisibleFlag,
  loadPregnancyFlag,
  savePregnancyFlag,
} from '@/lib/pregnancySafety';

const FLAG_KEYS: Record<
  (typeof ATHLETE_VISIBLE_FLAGS)[number],
  { key: string; fallback: string }
> = {
  none: { key: 'pregnancyFlagNone', fallback: 'None' },
  pregnant: { key: 'pregnancyFlagPregnant', fallback: 'Pregnant' },
  postpartum: { key: 'pregnancyFlagPostpartum', fallback: 'Postpartum' },
};

export function ProfilePregnancyCard() {
  const { t } = useTranslation();
  const [flag, setFlag] = useState<PregnancyFlag>(() => loadPregnancyFlag());

  const onChange = (next: PregnancyFlag) => {
    if (!isAthleteVisibleFlag(next)) return;
    setFlag(next);
    savePregnancyFlag(next);
  };

  const selectValue = isAthleteVisibleFlag(flag) ? flag : '';

  return (
    <div className="house-card space-y-3" data-testid="pregnancy-flag-card">
        <h3 className="text-base font-semibold">
          {t('pregnancyFlagTitle', { defaultValue: 'Pregnancy & postpartum' })}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {t('pregnancyFlagHint', {
            defaultValue:
              'Optional. Stored on this device. Never required to log. Stopping is always allowed.',
          })}
        </p>
        <label htmlFor="pregnancy-flag" className="sr-only">
          {t('pregnancyFlagTitle', { defaultValue: 'Pregnancy & postpartum' })}
        </label>
        <select
          id="pregnancy-flag"
          value={selectValue}
          onChange={(e) => onChange(e.target.value as PregnancyFlag)}
          className="w-full min-h-[44px] rounded-none bg-background border-2 border-border px-3 py-2 text-sm tap-target"
        >
          {ATHLETE_VISIBLE_FLAGS.map((value) => (
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
    </div>
  );
}
