'use client';

import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { ScoreRing } from './ScoreRing';
import type { BodyScores } from '@/lib/score';

interface MetricsRowProps {
  scores: BodyScores;
  demo?: boolean;
  embedded?: boolean;
}

export function MetricsRow({ scores, demo, embedded }: MetricsRowProps) {
  const { t } = useTranslation();

  const grid = (
    <>
      {demo && (
        <p className="text-xs text-muted-foreground text-center mb-4 uppercase tracking-widest">
          {t('todayMetricsDemoNote', { defaultValue: 'Preview — your scores update as you train' })}
        </p>
      )}
      <div className="grid grid-cols-3 gap-4">
        <ScoreRing
          label={t('todayMetricReadiness', { defaultValue: 'Readiness' })}
          value={scores.readiness}
          subtitle={t(scores.readinessLabelKey, { defaultValue: scores.readinessLabelKey })}
          color="emerald"
        />
        <ScoreRing
          label={t('todayMetricStrain', { defaultValue: 'Strain' })}
          value={scores.strain}
          subtitle={t(scores.strainLabelKey, { defaultValue: scores.strainLabelKey })}
          color="amber"
        />
        <ScoreRing
          label={t('todayMetricRecovery', { defaultValue: 'Recovery' })}
          value={scores.recovery}
          subtitle={t(scores.recoveryLabelKey, { defaultValue: scores.recoveryLabelKey })}
          color="blue"
        />
      </div>
    </>
  );

  if (embedded) {
    return <div className="pt-1">{grid}</div>;
  }

  return (
    <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
      <CardContent className="pt-6">{grid}</CardContent>
    </Card>
  );
}
