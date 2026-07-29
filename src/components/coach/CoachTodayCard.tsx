'use client';
/**
 * Today card linking to Mission Coach weekly plan.
 * See: src/components/coach/INDEX.md
 */

import Link from 'next/link';
import { useMemo } from 'react';
import { PlanExerciseLine } from '@/components/coach/PlanExerciseLine';
import { loadBands } from '@/lib/coach/load';
import { useUnits, weightUnitLabel } from '@/hooks/useUnits';
import { planSessionToTemplates } from '@/lib/coach/planSessionTemplates';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCoachPlan } from '@/hooks/useCoachPlan';
import { useWorkoutStore } from '@/store/workoutStore';
import { track } from '@/lib/analytics';
import { CoachAdaptBanner } from '@/components/coach/CoachAdaptBanner';
import { summarizeWeekDose } from '@/lib/coach/weekDose';
import { isFreeBeta } from '@/lib/freeBeta';

export function CoachTodayCard() {
  const { t } = useTranslation();
  const router = useRouter();
  const { plan, todaySession, loading, locked, generate } = useCoachPlan();
  const startWorkout = useWorkoutStore((s) => s.startWorkout);
  const workoutHistory = useWorkoutStore((s) => s.workoutHistory);
  const units = useUnits();
  const unitLabel = weightUnitLabel(units);

  /**
   * How this week compares to this athlete's own month — the same comparison the
   * debrief makes after a session, offered before one. Descriptive only: `load.ts`
   * documents at length why an ACWR band must never be phrased as a prediction.
   */
  const bands = useMemo(() => loadBands(workoutHistory), [workoutHistory]);
  const bandLine =
    bands.ratio === null
      ? null
      : bands.zone === 'high'
        ? t('coachTodayBandHigh', {
            defaultValue: 'Your last week is running heavier than your month.',
          })
        : bands.zone === 'light'
          ? t('coachTodayBandLight', {
              defaultValue: 'Your last week is lighter than your month — room to add.',
            })
          : t('coachTodayBandSteady', {
              defaultValue: 'Your week is tracking with your month.',
            });

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
    if (!todaySession || todaySession.status === 'done') return;
    startWorkout(todaySession.name, planSessionToTemplates(todaySession));
    track('coach_session_started', { kind: todaySession.kind, from: 'home' });
    router.push('/active');
  };

  const freeBeta = isFreeBeta();

  return (
    <Card className="content-card border-border/50 shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2 font-semibold">
          <Sparkles className="h-4 w-4 text-primary shrink-0" />
          {t('coachPageTitle', { defaultValue: 'Mission Coach' })}
        </CardTitle>
        <p className="text-xs text-muted-foreground font-normal leading-relaxed">
          {t('coachTodayMission', { defaultValue: 'Built from your logs — no wearable required.' })}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {plan && !locked && <CoachAdaptBanner plan={plan} compact />}
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
            <Button variant="fitness" size="sm" onClick={() => generate()}>
              {t('coachGenerateWeek', { defaultValue: 'Generate this week' })}
            </Button>
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
                  'Premium eases later sessions when load runs high so you recover without quitting the week.',
              })}
            </p>
            <Button asChild variant="fitness" size="sm" className="w-full">
              <Link href="/bundle">{t('coachUnlockBundle', { defaultValue: 'Unlock Super Bundle' })}</Link>
            </Button>
          </>
        )}
        {locked && freeBeta && (
          <>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('coachFreeBetaNextWeek', {
                defaultValue:
                  'Open beta keeps Coach open. Generate the next week from your latest logs.',
              })}
            </p>
            <Button variant="fitness" size="sm" onClick={() => generate()}>
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
            <p className="font-medium">{todaySession.name}</p>

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
                <Button variant="fitness" size="sm" className="w-full" onClick={startToday}>
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
            ? t('coachViewLockedPlan', { defaultValue: 'View last week' })
            : t('coachViewPlan', { defaultValue: 'View full week' })}{' '}
          →
        </Link>
      </CardContent>
    </Card>
  );
}
