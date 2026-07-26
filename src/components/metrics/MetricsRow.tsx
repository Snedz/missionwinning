'use client';

import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { ScoreNumeral } from '@/components/ui/ScoreNumeral';
import type { BodyScores } from '@/lib/score';

interface MetricsRowProps {
  scores: BodyScores;
  demo?: boolean;
  embedded?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function MetricsRow({ scores, demo, embedded, size = 'md' }: MetricsRowProps) {
  const { t } = useTranslation();
  // Three numerals never get the 56px treatment — that is reserved for a single
  // hero figure. The old 'sm' ring maps to the smaller numeral, everything else
  // to the same 40px, so callers keep their existing size prop.
  const numeralSize = size === 'lg' ? 'lg' : 'md';

  const grid = (
    <>
      {demo && (
        <p className="eyebrow mb-4 text-center">
          {t('todayMetricsDemoNote', { defaultValue: 'Preview — your scores update as you train' })}
        </p>
      )}
      {/* The score band: three numerals divided by rules, not three rings. The
          emerald/warn/info tones are gone — hue was carrying meaning the labels
          already carry, and this system has one colour. */}
      <div className="grid grid-cols-3 divide-x-2 divide-border border-t-2 border-border">
        <ScoreNumeral
          className="px-3 pt-3 first:ps-0"
          label={t('todayMetricReadiness', { defaultValue: 'Readiness' })}
          value={scores.readiness}
          caption={t(scores.readinessLabelKey, { defaultValue: scores.readinessLabelKey })}
          size={numeralSize}
        />
        <ScoreNumeral
          className="px-3 pt-3"
          label={t('todayMetricStrain', { defaultValue: 'Strain' })}
          value={scores.strain}
          caption={t(scores.strainLabelKey, { defaultValue: scores.strainLabelKey })}
          size={numeralSize}
        />
        <ScoreNumeral
          className="px-3 pt-3"
          label={t('todayMetricRecovery', { defaultValue: 'Recovery' })}
          value={scores.recovery}
          caption={t(scores.recoveryLabelKey, { defaultValue: scores.recoveryLabelKey })}
          size={numeralSize}
        />
      </div>
    </>
  );

  if (embedded) {
    return <div className="pt-1">{grid}</div>;
  }

  return (
    <Card className="bg-card">
      <CardContent className="pt-6">{grid}</CardContent>
    </Card>
  );
}
