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
  /** Marks the card for today — 2px red top rule (no elevation; radius 0 system). */
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
        // one-colour system. Today is the only marked treatment: a 2px primary
        // top rule — no shadow (Modernist has none).
        session.status === 'done' && 'bg-card',
        isToday && 'border-t-2 border-t-primary',
        /*
         * `.240` — de-emphasised by border, never by opacity.
         *
         * `opacity-60` dims the *text* along with the container: axe measured
         * #747372 on #eeeded (4.04:1) and #8c8b8b on #eeeded (2.9:1) here, both
         * serious. `.127` fixed exactly this in `WeekStrip` — "missed days
         * de-emphasised by border not opacity, because dimming the container
         * also dims the day label past 4.5:1" — and this file was missed in
         * that pass. A missed session still has to be readable; it is behind
         * you, not hidden from you (Horizon W criterion 4).
         *
         * `.256` reached the same conclusion from the other lane and measured
         * the muscle badges at **2.97:1** (`#8a8888` on `#eeebeb`, 10px) — a
         * third pair of numbers for one defect. It landed second, so `.240`'s
         * treatment stands, and `dashed` is the better of the two: a plain 2px
         * border is what every other card on this grid already draws, so it
         * said "missed" in a language the screen was using for "normal".
         *
         * What `.256` keeps is the part neither border does — the **Badge**
         * below. Both fixes were still visual-only; opacity and a border are
         * equally nothing to a screen reader, and `WeekStrip` had said it in
         * words the whole time.
         */
        session.status === 'missed' && 'border-2 border-dashed border-border bg-transparent',
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
          {/*
            The status was carried by opacity alone, which is nothing at all to a
            screen reader — "missed" was visual-only on the card, while
            `WeekStrip` has said it in words (`coachSessionMissed`) since it was
            written. Same key, so this costs no translation.
          */}
          {session.status === 'missed' && (
            <Badge variant="secondary" className="text-[10px]">
              {t('coachSessionMissed', { defaultValue: 'Missed' })}
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
