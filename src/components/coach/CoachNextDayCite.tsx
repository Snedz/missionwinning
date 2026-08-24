'use client';

/**
 * Quiet next-day cite on Coach (boss-adjacent / Show all).
 * Outline Start — never a second Today primary-action.
 */

import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useStartCoachSession } from '@/hooks/useStartCoachSession';
import { useWorkoutStore } from '@/store/workoutStore';
import type { NextDayCite } from '@/lib/coach/nextDayFromLogs';
import type { CoachPlan } from '@/lib/coach/types';

type Props = {
  cite: NextDayCite;
  plan?: CoachPlan | null;
  /** Hide Start when the boss card already starts this plan session. */
  hideStart?: boolean;
};

export function CoachNextDayCite({ cite, plan, hideStart }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const startWorkout = useWorkoutStore((s) => s.startWorkout);
  const startCoachSession = useStartCoachSession();

  const canStartLogs = cite.source === 'logs' && !!cite.template;
  const canStartPlan = cite.source === 'plan' && !!cite.planSessionId;
  const showStart = !hideStart && (canStartLogs || canStartPlan);

  const start = () => {
    if (cite.source === 'plan' && cite.planSessionId) {
      const session = plan?.sessions.find((s) => s.id === cite.planSessionId);
      if (session) startCoachSession(session, { from: 'coach' });
      return;
    }
    if (!cite.template) return;
    startWorkout(cite.template.name, cite.template.exercises);
    router.push('/active');
  };

  return (
    <div
      className="border-2 border-border bg-card px-4 py-3"
      data-testid="coach-next-day"
      data-next-day-source={cite.source}
    >
      <p className="eyebrow text-[10px] text-muted-foreground">
        {t('coachNextDayEyebrow', { defaultValue: 'Next day' })}
      </p>
      <p className="mt-1 text-base font-semibold" data-testid="coach-next-day-name">
        {cite.name}
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        {cite.source === 'plan'
          ? t('coachNextDayFromPlan', { defaultValue: "From this week's plan" })
          : t('coachNextDayFromLogs', { defaultValue: 'From your logs' })}
      </p>
      {showStart ? (
        <Button
          type="button"
          variant="outline"
          className="mt-3 w-full min-h-[44px]"
          onClick={start}
          data-testid="coach-next-day-start"
        >
          {t('coachNextDayStart', {
            name: cite.name,
            defaultValue: 'Start {{name}}',
          })}
        </Button>
      ) : null}
    </div>
  );
}
