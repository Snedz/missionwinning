'use client';

import { Card, CardContent } from '@/components/ui/card';
import { ScoreRing } from './ScoreRing';
import type { BodyScores } from '@/lib/score';

interface MetricsRowProps {
  scores: BodyScores;
  demo?: boolean;
  embedded?: boolean;
}

export function MetricsRow({ scores, demo, embedded }: MetricsRowProps) {
  const grid = (
    <>
      {demo && (
        <p className="text-xs text-muted-foreground text-center mb-4 uppercase tracking-widest">
          Preview — your scores update as you train
        </p>
      )}
      <div className="grid grid-cols-3 gap-4">
        <ScoreRing
          label="Readiness"
          value={scores.readiness}
          subtitle={scores.readinessLabel}
          color="emerald"
        />
        <ScoreRing label="Strain" value={scores.strain} subtitle={scores.strainLabel} color="amber" />
        <ScoreRing
          label="Recovery"
          value={scores.recovery}
          subtitle={scores.recoveryLabel}
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
