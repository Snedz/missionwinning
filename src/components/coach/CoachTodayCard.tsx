'use client';
/**
 * Today card linking to Mission Coach weekly plan.
 * See: src/components/coach/INDEX.md
 */

import Link from 'next/link';
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

export function CoachTodayCard() {
  const { t } = useTranslation();
  const router = useRouter();
  const { plan, todaySession, loading, locked, generate } = useCoachPlan();
  const startWorkout = useWorkoutStore((s) => s.startWorkout);
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
    const exercises = todaySession.exercises.map((ex) => ({
      exerciseId: ex.exerciseId,
      sets: Array.from({ length: ex.sets }, () => ({ reps: ex.reps, weight: ex.weight })),
      ...(ex.loadPct != null && ex.loadPct > 0 ? { loadPct: ex.loadPct } : {}),
    }));
    startWorkout(todaySession.name, exercises);
    track('coach_session_started', { kind: todaySession.kind, from: 'home' });
    router.push('/active');
  };

  return (
    <Card className="content-card border-primary/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="eyebrow text-[10px]">
            {t('coachTodayMission', { defaultValue: 'Mission Coach · adapts from logs' })}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {plan && !locked && <CoachAdaptBanner plan={plan} compact />}
        {plan && !locked && weekDose && weekDose.sessionCount > 0 && (
          <p className="text-xs text-muted-foreground text-center" data-testid="coach-today-dose">
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
            <p className="text-sm text-muted-foreground">
              {t('coachGenerateWeekHint', {
                defaultValue: 'Generate a weekly plan from your logs — no wearable required.',
              })}
            </p>
            <Button variant="fitness" size="sm" onClick={() => generate()}>
              {t('coachGenerateWeek', { defaultValue: 'Generate this week' })}
            </Button>
          </>
        )}
        {locked && (
          <>
            <p className="text-sm text-muted-foreground">
              {t('coachTasterLocked', { defaultValue: 'Your free week is complete' })}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('coachTasterFatigueNote', {
                defaultValue:
                  'Premium also watches strain: when load runs high (≥70), future sessions auto-shift lighter so you recover without quitting the week.',
              })}
            </p>
            <Button asChild variant="fitness" size="sm" className="w-full">
              <Link href="/bundle">{t('coachUnlockBundle', { defaultValue: 'Unlock Super Bundle' })}</Link>
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
              <p className="text-sm text-status-warn">
                {t('coachSessionDone', { defaultValue: 'Done' })} ✓
              </p>
            )}
          </>
        )}
        <Link href="/coach" className="text-xs text-primary hover:underline block text-center">
          {locked
            ? t('coachViewLockedPlan', { defaultValue: 'View last week & unlock' })
            : t('coachViewPlan', { defaultValue: 'View full week' })}{' '}
          →
        </Link>
      </CardContent>
    </Card>
  );
}
