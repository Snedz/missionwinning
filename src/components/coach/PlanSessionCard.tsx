'use client';
/**
 * Single coach session with exercises.
 * See: src/components/coach/INDEX.md
 */

import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { EXERCISES } from '@/data/exercises';
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
    const exercises = session.exercises.map((ex) => ({
      exerciseId: ex.exerciseId,
      sets: Array.from({ length: ex.sets }, () => ({ reps: ex.reps, weight: ex.weight })),
      ...(ex.loadPct != null && ex.loadPct > 0 ? { loadPct: ex.loadPct } : {}),
    }));
    startWorkout(session.name, exercises);
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
          {session.exercises.map((ex) => {
            const data = EXERCISES.find((e) => e.id === ex.exerciseId);
            const name = data?.name ?? ex.exerciseId;
            const load =
              ex.loadPct != null && ex.loadPct > 0 && ex.weight > 0
                ? ` · ${ex.loadPct}% · ${ex.weight}${unit}`
                : ex.weight > 0
                  ? ` @ ${ex.weight}${unit}`
                  : '';
            return (
              <li key={ex.exerciseId} className="border-b border-border/30 pb-2 last:border-0">
                <div className="font-medium">
                  {name} — {ex.sets}×{ex.reps}
                  {load}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t(ex.whyKey, {
                    defaultValue: ex.whyKey,
                  })}
                </p>
              </li>
            );
          })}
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
