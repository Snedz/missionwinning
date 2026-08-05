'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  clampCycleLength,
  estimateCyclePhase,
  cyclePhaseLabelKey,
  loadCyclePrefs,
  saveCyclePrefs,
  type CyclePrefs,
} from '@/lib/cyclePrefs';
import { localDateKey } from '@/lib/time/localDate';

/**
 * Opt-in cycle coaching prefs — local only, educational, never gates logging.
 */
export function ProfileCycleCard() {
  const { t } = useTranslation();
  const [prefs, setPrefs] = useState<CyclePrefs>(() => loadCyclePrefs());
  const [savedFlash, setSavedFlash] = useState(false);

  const phase = estimateCyclePhase(prefs, localDateKey());
  const phaseLabel = t(cyclePhaseLabelKey(phase), {
    defaultValue:
      phase === 'menstrual'
        ? 'Menstrual'
        : phase === 'follicular'
          ? 'Follicular'
          : phase === 'ovulatory'
            ? 'Ovulatory'
            : phase === 'luteal'
              ? 'Luteal'
              : 'Unknown',
  });

  const persist = (next: CyclePrefs) => {
    const normalized = {
      ...next,
      typicalLengthDays:
        next.typicalLengthDays != null
          ? clampCycleLength(next.typicalLengthDays)
          : next.typicalLengthDays,
    };
    setPrefs(normalized);
    saveCyclePrefs(normalized);
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1200);
  };

  return (
    <Card className="content-card">
      <CardHeader>
        <CardTitle>{t('profileCycleTitle', { defaultValue: 'Cycle coaching' })}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground leading-relaxed">
          {t('profileCycleHint', {
            defaultValue:
              'Optional. Soft training tips from a simple phase model — educational only, not medical advice or fertility tracking. Stays on this device. Never blocks free logging.',
          })}
        </p>

        <div className="flex gap-2">
          <Button
            className="min-h-[44px] flex-1"
            variant={prefs.enabled ? 'selected' : 'outline'}
            onClick={() => persist({ ...prefs, enabled: true })}
          >
            {t('profileCycleOn', { defaultValue: 'On' })}
          </Button>
          <Button
            className="min-h-[44px] flex-1"
            variant={!prefs.enabled ? 'selected' : 'outline'}
            onClick={() => persist({ ...prefs, enabled: false })}
          >
            {t('profileCycleOff', { defaultValue: 'Off' })}
          </Button>
        </div>

        {prefs.enabled ? (
          <div className="space-y-3 border-t-2 border-border pt-3">
            <div>
              <label className="text-xs text-muted-foreground" htmlFor="cycle-last-start">
                {t('profileCycleLastStart', { defaultValue: 'Last period start' })}
              </label>
              <Input
                id="cycle-last-start"
                type="date"
                className="mt-1 min-h-[44px]"
                value={prefs.lastPeriodStart ?? ''}
                max={localDateKey()}
                onChange={(e) => {
                  const v = e.target.value;
                  persist({
                    ...prefs,
                    lastPeriodStart: v || undefined,
                  });
                }}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground" htmlFor="cycle-length">
                {t('profileCycleLength', { defaultValue: 'Typical length (days)' })}
              </label>
              <Input
                id="cycle-length"
                type="number"
                min={21}
                max={45}
                className="mt-1 min-h-[44px] tabular-nums"
                value={prefs.typicalLengthDays ?? 28}
                onChange={(e) => {
                  const n = parseInt(e.target.value, 10);
                  persist({
                    ...prefs,
                    typicalLengthDays: Number.isFinite(n) ? clampCycleLength(n) : 28,
                  });
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {t('profileCyclePhaseNow', {
                phase: phaseLabel,
                defaultValue: `Estimated phase today: ${phaseLabel}`,
              })}
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {t('profileCycleDisclaimer', {
                defaultValue:
                  'Heuristic windows only (not a diagnosis). If energy is low, lower volume is fine — Mission Coach may soft-bias readiness; your free logger always works.',
              })}
            </p>
            <p className="text-[11px]">
              <Link href="/principles" className="text-primary underline-offset-2 hover:underline">
                {t('profileCyclePrinciples', { defaultValue: 'Principles & fair standards' })}
              </Link>
            </p>
          </div>
        ) : null}

        {savedFlash ? (
          <p className="text-xs text-primary">
            {t('profileCycleSaved', { defaultValue: 'Saved on this device' })}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
