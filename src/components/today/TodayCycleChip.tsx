'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import {
  cycleCueMessageKey,
  cyclePhaseLabelKey,
  estimateCyclePhase,
  loadCyclePrefs,
} from '@/lib/cyclePrefs';
import { localDateKey } from '@/lib/time/localDate';

const CUE_DEFAULTS: Record<string, string> = {
  cycleCueMenstrual:
    'Lower volume is fine if energy is down — rest is training too. Educational tip only.',
  cycleCueFollicular: 'Many athletes feel progressive work well here — listen to today’s energy.',
  cycleCueOvulatory: 'Stay sharp on form if loads feel high — quality over ego.',
  cycleCueLuteal:
    'If energy dips, ease volume and keep the habit. Soft cue only — not medical advice.',
};

/**
 * Optional dismissible-looking chip when cycle coaching is enabled.
 * Never blocks Train; pure display from local prefs.
 */
export function TodayCycleChip() {
  const { t } = useTranslation();

  const { show, phaseLabel, cue } = useMemo(() => {
    const prefs = loadCyclePrefs();
    if (!prefs.enabled) {
      return { show: false, phaseLabel: '', cue: '' };
    }
    const today = localDateKey();
    const phase = estimateCyclePhase(prefs, today);
    if (phase === 'unknown') {
      return {
        show: true,
        phaseLabel: t('cyclePhaseUnknown', { defaultValue: 'Set period start' }),
        cue: t('cycleCueNeedStart', {
          defaultValue: 'Add last period start in Profile to unlock soft cycle tips.',
        }),
      };
    }
    const key = cycleCueMessageKey(phase);
    return {
      show: true,
      phaseLabel: t(cyclePhaseLabelKey(phase), {
        defaultValue: phase,
      }),
      cue: key
        ? t(key, { defaultValue: CUE_DEFAULTS[key] ?? '' })
        : '',
    };
  }, [t]);

  if (!show) return null;

  return (
    <div className="border-2 border-border bg-card px-3 py-2 text-sm space-y-1">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {t('cycleChipEyebrow', { defaultValue: 'Cycle' })} · {phaseLabel}
      </p>
      {cue ? <p className="text-muted-foreground leading-relaxed">{cue}</p> : null}
      <p className="text-[11px] text-muted-foreground">
        <Link href="/profile" className="underline underline-offset-2 hover:text-foreground">
          {t('cycleChipProfile', { defaultValue: 'Profile settings' })}
        </Link>
        {' · '}
        {t('cycleChipEdu', { defaultValue: 'Educational only — not medical advice.' })}
      </p>
    </div>
  );
}
