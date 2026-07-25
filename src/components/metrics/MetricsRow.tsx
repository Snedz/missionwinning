'use client';

import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { ProgressRing } from '@/components/ui/ProgressRing';
import type { BodyScores } from '@/lib/score';

interface MetricsRowProps {
  scores: BodyScores;
  demo?: boolean;
  embedded?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function MetricsRow({ scores, demo, embedded, size = 'md' }: MetricsRowProps) {
  const { t } = useTranslation();

  const grid = (
    <>
      {demo && (
        <p className="eyebrow mb-4 text-center">
          {t('todayMetricsDemoNote', { defaultValue: 'Preview — your scores update as you train' })}
        </p>
      )}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <ProgressRing
          label={t('todayMetricReadiness', { defaultValue: 'Readiness' })}
          value={scores.readiness}
          subtitle={t(scores.readinessLabelKey, { defaultValue: scores.readinessLabelKey })}
          tone="emerald"
          size={size}
        />
        <ProgressRing
          label={t('todayMetricStrain', { defaultValue: 'Strain' })}
          value={scores.strain}
          subtitle={t(scores.strainLabelKey, { defaultValue: scores.strainLabelKey })}
          tone="warn"
          size={size}
        />
        <ProgressRing
          label={t('todayMetricRecovery', { defaultValue: 'Recovery' })}
          value={scores.recovery}
          subtitle={t(scores.recoveryLabelKey, { defaultValue: scores.recoveryLabelKey })}
          tone="info"
          size={size}
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
