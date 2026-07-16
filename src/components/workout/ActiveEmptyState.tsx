'use client';

import { Dumbbell, Timer } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/EmptyState';
import { PillarPageHeader } from '@/components/layout/PillarPageHeader';
import { WorkoutVictorySheet } from '@/components/workout/WorkoutVictorySheet';
import type { WorkoutVictorySummary } from '@/lib/workoutVictory';

type Props = {
  onStart: () => void;
  victoryOpen: boolean;
  victorySummary: WorkoutVictorySummary | null;
  onVictoryOpenChange: (open: boolean) => void;
  onViewToday: () => void;
  onViewHistory: () => void;
};

/** Empty /active shell — start quick session or jump to Today / Builder. */
export function ActiveEmptyState({
  onStart,
  victoryOpen,
  victorySummary,
  onVictoryOpenChange,
  onViewToday,
  onViewHistory,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 py-6">
      <PillarPageHeader
        icon={Dumbbell}
        eyebrow={t('activeEyebrow', { defaultValue: 'Train' })}
        title={t('activeTitle', { defaultValue: 'Active workout' })}
        subtitle={t('activeEmptySubtitle', {
          defaultValue: 'Log sets with rest timers, PRs, and form cues — offline ready.',
        })}
      />
      <EmptyState
        icon={Timer}
        title={t('activeNoWorkout', { defaultValue: 'No Active Workout' })}
        description={t('activeNoWorkoutDesc', {
          defaultValue: 'Start a quick workout from Today or launch a saved routine from the builder.',
        })}
        actionLabel={t('activeStartWorkout', { defaultValue: 'Start Workout' })}
        onAction={onStart}
      />
      <div className="flex flex-wrap gap-3 justify-center text-sm">
        <Button variant="outline" asChild>
          <a href="/log">{t('activeGoToday', { defaultValue: 'Today hub' })}</a>
        </Button>
        <Button variant="outline" asChild>
          <a href="/builder">{t('activeGoBuilder', { defaultValue: 'Builder' })}</a>
        </Button>
      </div>
      <WorkoutVictorySheet
        open={victoryOpen}
        summary={victorySummary}
        onOpenChange={onVictoryOpenChange}
        onViewToday={onViewToday}
        onViewHistory={onViewHistory}
      />
    </div>
  );
}
