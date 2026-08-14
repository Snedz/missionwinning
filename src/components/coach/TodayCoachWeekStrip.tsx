'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WeekStrip } from '@/components/coach/WeekStrip';
import { CoachLogCite } from '@/components/coach/CoachLogCite';
import { CoachAdaptBanner } from '@/components/coach/CoachAdaptBanner';
import { useCoachPlan } from '@/hooks/useCoachPlan';
import { summarizeWeekDose } from '@/lib/coach/weekDose';

/** Compact coach week overview for the Today hub. */
export function TodayCoachWeekStrip() {
  const { t } = useTranslation();
  const { plan, loading, todayOffset, weekStart } = useCoachPlan();
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

  return (
    <Card className="content-card border-2 border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="eyebrow text-[10px]">
              {t('coachWeekOverview', { defaultValue: 'Mission Coach · this week' })}
            </span>
          </span>
          <Link href="/coach" className="text-xs text-primary hover:underline font-normal min-h-[44px] inline-flex items-center tap-target">
            {t('coachViewPlan', { defaultValue: 'View full week' })}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {plan ? (
          <>
            <WeekStrip weekStart={weekStart} sessions={plan.sessions} todayOffset={todayOffset} />
            {weekDose && weekDose.sessionCount > 0 ? (
              <p
                className="text-xs text-muted-foreground text-center leading-relaxed"
                data-testid="today-coach-week-dose"
              >
                {t('coachWeekDose', {
                  count: weekDose.sessionCount,
                  intent: doseIntent,
                  minutes: weekDose.estMinutes,
                  defaultValue: `This week’s dose: ${weekDose.sessionCount} sessions · ${doseIntent} · ~${weekDose.estMinutes} min`,
                })}
              </p>
            ) : null}
            <CoachAdaptBanner plan={plan} compact todayOffset={todayOffset} />
          </>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-2">
            {t('coachGenerateWeekHint', {
              defaultValue: 'Open Coach to generate your weekly plan.',
            })}
          </p>
        )}
        {/* Which week this is a plan *from* — or that there is nothing yet. */}
        <CoachLogCite className="text-center" />
      </CardContent>
    </Card>
  );
}
