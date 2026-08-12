'use client';
/**
 * Single coach session with exercises.
 * See: src/components/coach/INDEX.md
 */

import { PlanExerciseLine } from '@/components/coach/PlanExerciseLine';
import { useStartCoachSession } from '@/hooks/useStartCoachSession';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PlanSession } from '@/lib/coach/types';
import {
  buildSessionRationale,
  type SessionRationaleHints,
} from '@/lib/coach/sessionRationale';
import { useUnits, weightUnitLabel } from '@/hooks/useUnits';
import { cn } from '@/lib/utils';

type Props = {
  session: PlanSession;
  className?: string;
  /** Marks the card for today — 2px red top rule (no elevation; radius 0 system). */
  isToday?: boolean;
  /**
   * D12 — filled Start only on the one boss session (today, or next upcoming
   * when today is rest). Other days stay outline so `/coach` is not a red farm.
   */
  isPrimaryStart?: boolean;
  /** Today’s not-done session only — opens adjust flow. */
  onAdjust?: () => void;
  /**
   * Optional log-derived hints already computed upstream (history length, load band).
   * Never invent metrics here — only pass what CoachContext / loadBands already have.
   * Session rationale paints only on the boss Start card (`.699` / F-012).
   */
  rationaleHints?: SessionRationaleHints;
};

export function PlanSessionCard({
  session,
  className,
  isToday,
  isPrimaryStart,
  onAdjust,
  rationaleHints,
}: Props) {
  const { t } = useTranslation();
  const startCoachSession = useStartCoachSession();
  const units = useUnits();
  const unit = weightUnitLabel(units);
  const primary = isPrimaryStart ?? isToday;
  // Boss session only — keep other cards quiet; never force onto Train/Today.
  const sessionRationale =
    primary && session.status !== 'done' && session.status !== 'missed'
      ? buildSessionRationale(session, rationaleHints)
      : null;

  const start = () => {
    startCoachSession(session, { from: 'coach' });
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
        {sessionRationale ? (
          <div
            className="space-y-1.5 border-s-[3px] border-s-[hsl(var(--accent-poster))] bg-muted px-3 py-2"
            data-testid="coach-session-rationale"
          >
            <p className="eyebrow text-[10px] text-accent-900">
              {t('coachWhySessionEyebrow', {
                defaultValue: 'Why this session — from your logs',
              })}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">
                {t('coachRationaleInputLabel', { defaultValue: 'From your logs' })}
                {': '}
              </span>
              {t(sessionRationale.inputKey, {
                ...sessionRationale.inputParams,
                defaultValue: sessionRationale.inputDefault,
              })}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">
                {t('coachRationaleRuleLabel', { defaultValue: 'Rule applied' })}
                {': '}
              </span>
              {t(sessionRationale.ruleKey, {
                defaultValue: sessionRationale.ruleDefault,
              })}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">
                {t('coachRationaleEffectLabel', { defaultValue: 'Expected effect' })}
                {': '}
              </span>
              {t(sessionRationale.effectKey, {
                ...sessionRationale.effectParams,
                defaultValue: sessionRationale.effectDefault,
              })}
            </p>
          </div>
        ) : null}
        <ul className="space-y-2 text-sm">
          {session.exercises.map((ex) => (
            <PlanExerciseLine key={ex.exerciseId} ex={ex} unit={unit} />
          ))}
        </ul>
        {session.status !== 'done' && (
          <div className="space-y-2">
            {/*
              D12 — one red Start on the week grid: only today.
              Other days stay outline so zero-state `/coach` is not a farm of
              primary fills (was cap 4 = every card + Regenerate).
            */}
            <Button
              className={primary ? 'w-full primary-action' : 'w-full'}
              variant={primary ? 'default' : 'outline'}
              onClick={start}
            >
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
