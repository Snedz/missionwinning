'use client';
/**
 * Single coach session with exercises.
 * See: src/components/coach/INDEX.md
 */

import { useRouter } from 'next/navigation';
import { PlanExerciseLine } from '@/components/coach/PlanExerciseLine';
import { planSessionToTemplates } from '@/lib/coach/planSessionTemplates';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWorkoutStore } from '@/store/workoutStore';
import { track } from '@/lib/analytics';
import type { PlanSession } from '@/lib/coach/types';
import { useUnits, weightUnitLabel } from '@/hooks/useUnits';
import { cn } from '@/lib/utils';

type Props = {
  session: PlanSession;
  className?: string;
  /** Marks the card for today — red top rule + the one elevation on this screen. */
  isToday?: boolean;
  /** Today’s not-done session only — opens adjust flow. */
  onAdjust?: () => void;
};

export function PlanSessionCard({ session, className, isToday, onAdjust }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const units = useUnits();
  const startWorkout = useWorkoutStore((s) => s.startWorkout);
  const unit = weightUnitLabel(units);

  const start = () => {
    startWorkout(session.name, planSessionToTemplates(session));
    track('coach_session_started', { kind: session.kind, dayOffset: session.dayOffset });
    router.push('/active');
  };

  return (
    <Card
      className={cn(
        'content-card',
        // Done is the surface fill; the amber border was a status hue in a
        // one-colour system. Today keeps the only marked treatment on the grid:
        // a red top rule and the single elevation this screen is allowed.
        session.status === 'done' && 'bg-card',
        isToday && 'border-t-[3px] border-t-[hsl(var(--accent-poster))] shadow-md',
        session.status === 'missed' && 'opacity-60',
        className
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">{session.name}</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {t('coachEstMinutes', {
                defaultValue: '{{minutes}} min',
                minutes: session.estMinutes,
              })}
            </p>
          </div>
          {session.status === 'swapped' && (
            <Badge variant="secondary" className="text-[10px]">
              {t('coachSessionSwapped', { defaultValue: 'Adapted' })}
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-1 pt-1">
          {session.focusGroups.slice(0, 4).map((mg) => (
            <Badge key={mg} variant="muscle" className="text-[10px]">
              {mg}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="space-y-2 text-sm">
          {session.exercises.map((ex) => (
            <PlanExerciseLine key={ex.exerciseId} ex={ex} unit={unit} />
          ))}
        </ul>
        {session.status !== 'done' && (
          <div className="space-y-2">
            <Button className="w-full primary-action" variant="fitness" onClick={start}>
              {t('coachStartSession', { defaultValue: 'Start this session' })}
            </Button>
            {onAdjust ? (
              <button
                type="button"
                className="w-full text-sm text-primary min-h-[44px] hover:underline"
                onClick={onAdjust}
              >
                {t('coachAdjustToday', { defaultValue: 'Adjust today' })}
              </button>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
