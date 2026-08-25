'use client';
/**
 * Today card linking to Mission Coach weekly plan.
 * See: src/components/coach/INDEX.md
 *
 * **Its buttons are `outline`, not red.** `.240` raised this card to the top of
 * Today's block budget, and it can render up to two actions ("Start this
 * session", "Generate this week") while `JourneyHero` already docks the
 * screen's one red action below. Three red fills on one screen is the competing-
 * CTA failure the quality bar names, and `redActions.ts` allows **zero** red
 * controls inside `main`. The guard had never caught it because the card mounts
 * only at `commissioned`, a phase the hero e2e never reaches — so this was a
 * latent break that promotion would have made live.
 */

import Link from 'next/link';
import { useMemo } from 'react';
import { PlanExerciseLine } from '@/components/coach/PlanExerciseLine';
import { loadBands } from '@/lib/coach/load';
import { useUnits, weightUnitLabel } from '@/hooks/useUnits';
import { useStartCoachSession } from '@/hooks/useStartCoachSession';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCoachPlan } from '@/hooks/useCoachPlan';
import { useWorkoutStore } from '@/store/workoutStore';
import { historyForWeek } from '@/lib/workout/startHistoryFrom';
import { CoachAdaptBanner } from '@/components/coach/CoachAdaptBanner';
import { CoachLogCite } from '@/components/coach/CoachLogCite';
import { summarizeWeekDose } from '@/lib/coach/weekDose';
import { sessionContinuity } from '@/lib/coach/programContinuity';
import { buildSessionWhyLine } from '@/lib/coach/sessionWhyLine';
import { isFreeBeta } from '@/lib/freeBeta';

export function CoachTodayCard() {
  const { t } = useTranslation();
  const { plan, todaySession, loading, locked, generate, needsParq } = useCoachPlan();
  const startCoachSession = useStartCoachSession();
  const workoutHistory = useWorkoutStore((s) => s.workoutHistory);
  const units = useUnits();
  const unitLabel = weightUnitLabel(units);

  /**
   * How this week compares to this athlete's own month — the same comparison the
   * debrief makes after a session, offered before one. Descriptive only: `load.ts`
   * documents at length why an ACWR band must never be phrased as a prediction.
   */
  const weekHistory = useMemo(() => historyForWeek(workoutHistory), [workoutHistory]);
  const bands = useMemo(() => loadBands(weekHistory), [weekHistory]);
  const bandLine =
    bands.ratio === null
      ? null
      : bands.zone === 'high'
        ? t('coachTodayBandHigh', {
            defaultValue: 'Your last week is running heavier than your month.',
          })
        : bands.zone === 'light'
          ? t('coachTodayBandLight', {
              defaultValue: 'Last week is lighter than your month.',
            })
          : t('coachTodayBandSteady', {
              defaultValue: 'Your week is tracking with your month.',
            });

  const continuity = useMemo(
    () => sessionContinuity(weekHistory, plan),
    [weekHistory, plan]
  );

  const sessionWhy = useMemo(() => {
    if (!todaySession) return null;
    return buildSessionWhyLine({
      kind: todaySession.kind,
      focusGroups: todaySession.focusGroups,
      leadWhyKey: todaySession.exercises[0]?.whyKey,
      loadZone: bands.ratio === null ? null : bands.zone,
    });
  }, [todaySession, bands.ratio, bands.zone]);

  const weekDose = plan ? summarizeWeekDose(plan) : null;
  const doseIntent =
    weekDose?.intent === 'strength'
      ? t('coachWeekDoseStrength', { defaultValue: 'mostly strength' })
      : weekDose?.intent === 'conditioning'
        ? t('coachWeekDoseConditioning', { defaultValue: 'conditioning focus' })
        : weekDose?.intent === 'recovery'
          ? t('coachWeekDoseRecovery', { defaultValue: 'recovery-heavy' })
          : t('coachWeekDoseMixed', { defaultValue: 'mixed strength & recovery' });

  if (loading) return null;

  const startToday = () => {
    if (!todaySession) return;
    startCoachSession(todaySession, { from: 'home' });
  };

  const freeBeta = isFreeBeta();

  return (
    <Card className="content-card border-border shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2 font-semibold">
          <Sparkles className="h-4 w-4 text-primary shrink-0" />
          {t('coachPageTitle', { defaultValue: 'Mission Coach' })}
        </CardTitle>
        <p className="text-xs text-muted-foreground font-normal leading-relaxed">
          {t('coachTodayMission', { defaultValue: 'Mission Coach · adapts from logs' })}
        </p>
        {/* The line above is the claim `earnedFromLogsCopy.test.ts` pins; this is
            the evidence for it, or the admission that there is none yet. */}
        <CoachLogCite className="mt-1" />
      </CardHeader>
      <CardContent className="space-y-3">
        {plan && !locked && (
          <CoachAdaptBanner
            plan={plan}
            compact
            rationaleHints={{
              loggedWorkoutCount: weekHistory.length,
              loadZone: bands.ratio === null ? null : bands.zone,
            }}
          />
        )}
        {plan && !locked && weekDose && weekDose.sessionCount > 0 && (
          <p className="text-xs text-muted-foreground text-center leading-relaxed" data-testid="coach-today-dose">
            {t('coachWeekDose', {
              count: weekDose.sessionCount,
              intent: doseIntent,
              minutes: weekDose.estMinutes,
              defaultValue: `This week’s dose: ${weekDose.sessionCount} sessions · ${doseIntent} · ~${weekDose.estMinutes} min`,
            })}
          </p>
        )}
        {!plan && !locked && (
          <>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('coachGenerateWeekHint', {
                defaultValue: 'Generate a weekly plan from your logs — no wearable required.',
              })}
            </p>
            {needsParq ? (
              <Button variant="outline" size="sm" className="min-h-[44px] tap-target" asChild>
                <Link href="/coach">
                  {t('firstStepParqTitle', { defaultValue: 'Screen before a coach plan' })}
                </Link>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="min-h-[44px] tap-target"
                onClick={() => generate()}
              >
                {t('coachGenerateWeek', { defaultValue: 'Generate this week' })}
              </Button>
            )}
          </>
        )}
        {locked && !freeBeta && (
          <>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('coachTasterLocked', { defaultValue: 'Your free week is complete' })}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('coachTasterFatigueNote', {
                defaultValue:
                  'Premium also watches strain: when load runs high (≥70), future sessions auto-shift lighter so you recover without quitting the week.',
              })}
            </p>
            <Button asChild variant="outline" size="sm" className="w-full min-h-[44px] tap-target">
              <Link href="/bundle">{t('coachUnlockBundle', { defaultValue: 'Unlock Super Bundle' })}</Link>
            </Button>
          </>
        )}
        {locked && freeBeta && (
          <>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('coachFreeBetaNextWeek', {
                defaultValue:
                  'Generate next week from your latest logs. Free during Alpha.',
              })}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="min-h-[44px] tap-target"
              onClick={() => generate()}
            >
              {t('coachGenerateWeek', { defaultValue: 'Generate this week' })}
            </Button>
          </>
        )}
        {plan && !locked && !todaySession && (
          <p className="text-sm text-muted-foreground">
            {t('coachNoSessionToday', {
              defaultValue: 'Rest or recovery day — light movement still counts.',
            })}
          </p>
        )}
        {plan && !locked && todaySession && (
          <>
            {/* Where this sits in the athlete's own history. Silent when there
                is nothing true to say — see programContinuity.ts for why there
                is no week number here. */}
            {continuity.line && (
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground tabular-nums">
                {continuity.line}
              </p>
            )}
            <p className="font-semibold">{todaySession.name}</p>
            {sessionWhy && (
              <p className="text-xs text-muted-foreground leading-relaxed" data-testid="coach-session-why">
                {t(sessionWhy.messageKey, {
                  ...sessionWhy.params,
                  defaultValue: sessionWhy.defaultValue,
                })}
              </p>
            )}

            {/* What the coach actually prescribed, before the athlete walks to the
                gym. The data has always existed on PlanExercise; Today only ever
                showed the session name. Capped at three so the card stays a card —
                the full list is one tap away on /coach. */}
            {todaySession.exercises.length > 0 && (
              <ul className="space-y-1">
                {todaySession.exercises.slice(0, 3).map((ex) => (
                  <PlanExerciseLine key={ex.exerciseId} ex={ex} unit={unitLabel} compact />
                ))}
                {todaySession.exercises.length > 3 && (
                  <li className="text-[11px] text-muted-foreground">
                    {t('coachTodayMoreExercises', {
                      count: todaySession.exercises.length - 3,
                      defaultValue: `+${todaySession.exercises.length - 3} more`,
                    })}
                  </li>
                )}
              </ul>
            )}

            {/* One descriptive band sentence, phrased exactly like the debrief's.
                Silence when the ratio is null — under 14 days of history there is
                nothing true to say, and filler is what `.171` refused to ship. */}
            {bandLine && <p className="text-[11px] text-muted-foreground">{bandLine}</p>}
            {todaySession.status !== 'done' && (
              <>
                <Button variant="outline" size="sm" className="w-full min-h-[44px] tap-target" onClick={startToday}>
                  {t('coachStartSession', { defaultValue: 'Start this session' })}
                </Button>
                <Link
                  href="/coach"
                  className="block text-center text-sm text-primary min-h-[44px] leading-[44px] hover:underline"
                >
                  {t('coachAdjustToday', { defaultValue: 'Adjust today' })}
                </Link>
              </>
            )}
            {todaySession.status === 'done' && (
              <p className="text-sm text-primary">
                {t('coachSessionDone', { defaultValue: 'Done' })} ✓
              </p>
            )}
          </>
        )}
        <Link href="/coach" className="text-xs text-primary hover:underline block text-center min-h-[44px] leading-[44px]">
          {locked && !freeBeta
            ? t('coachViewLockedPlan', { defaultValue: 'View last week & unlock' })
            : t('coachViewPlan', { defaultValue: 'View full week' })}
        </Link>
      </CardContent>
    </Card>
  );
}
