'use client';

import { Dumbbell, Timer } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/EmptyState';
import { PillarPageHeader } from '@/components/layout/PillarPageHeader';
import { WorkoutVictorySheet } from '@/components/workout/WorkoutVictorySheet';
import type { Debrief } from '@/lib/coach/debrief';
import type { WorkoutVictorySummary } from '@/lib/workout/workoutVictory';

type Props = {
  onStart: () => void;
  /** When false, Start is disabled until Zustand persist rehydrates. */
  hydrated?: boolean;
  victoryOpen: boolean;
  victorySummary: WorkoutVictorySummary | null;
  onVictoryOpenChange: (open: boolean) => void;
  onViewToday: () => void;
  onViewHistory: () => void;
  debrief?: Debrief | null;
  /** The athlete's journal fragments from the just-finished session. */
  fragments?: string[];
  /** Finished session id — lets a feel tap annotate that session's journal entry. */
  workoutId?: string;
};

/** Empty /active shell — start quick session or jump to Today / Builder. */
export function ActiveEmptyState({
  onStart,
  hydrated = true,
  victoryOpen,
  victorySummary,
  onVictoryOpenChange,
  debrief,
  fragments,
  workoutId,
  onViewToday,
  onViewHistory,
}: Props) {
  const { t } = useTranslation();

  return (
    /*
     * `aria-busy` while persist rehydrates, because this screen *is* busy.
     *
     * The Start button is disabled and relabelled "Loading session…" until
     * Zustand hands back the last workout, but nothing in the DOM said so: a
     * screen reader announced a disabled button with no explanation, and any
     * automated wait keyed on the semantic marker saw a settled page.
     *
     * `.253` — `a11y.spec.ts` carried a route special-case for exactly this
     * state (`if (path === '/active') await …getByRole('button', { name:
     * /start workout|loading session/i })`), which is `.220`'s shape: a rule
     * written as a list of the routes someone happened to hit, matched on the
     * button's *copy*, so changing that string silently removed the wait.
     * Declaring the state here makes `/active` a case of the general rule
     * rather than an exception beside it.
     */
    <div className="space-y-6 py-6" aria-busy={hydrated ? undefined : true}>
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
        title={
          hydrated
            ? t('activeNoWorkout', { defaultValue: 'No session running' })
            : t('activeLoadingSession', { defaultValue: 'Restoring session…' })
        }
        description={
          hydrated
            ? t('activeNoWorkoutDesc', {
                defaultValue:
                  'Start here, or open Today for the session already planned for you.',
              })
            : t('activeLoadingSessionDesc', {
                defaultValue: 'Reading the last workout saved on this device.',
              })
        }
        actionLabel={
          hydrated
            ? t('activeStartWorkout', { defaultValue: 'Start workout' })
            : t('activeLoadingSession', { defaultValue: 'Restoring session…' })
        }
        onAction={hydrated ? onStart : undefined}
        actionDisabled={!hydrated}
      />
      <div className="flex flex-wrap gap-3 text-sm">
        <Button variant="outline" className="min-h-[44px]" asChild>
          <a href="/log">{t('activeGoToday', { defaultValue: 'Today' })}</a>
        </Button>
        <Button variant="outline" className="min-h-[44px]" asChild>
          <a href="/builder">{t('activeGoBuilder', { defaultValue: 'Builder' })}</a>
        </Button>
      </div>
      <WorkoutVictorySheet
        open={victoryOpen}
        summary={victorySummary}
        debrief={debrief}
        fragments={fragments}
        workoutId={workoutId}
        onOpenChange={onVictoryOpenChange}
        onViewToday={onViewToday}
        onViewHistory={onViewHistory}
      />
    </div>
  );
}
