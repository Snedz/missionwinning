'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WeekStrip } from '@/components/coach/WeekStrip';
import { useCoachPlan } from '@/hooks/useCoachPlan';

/** Compact coach week overview for the Today hub. */
export function TodayCoachWeekStrip() {
  const { t } = useTranslation();
  const { plan, loading, todayOffset, weekStart } = useCoachPlan();

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
      <CardContent>
        {plan ? (
          <WeekStrip weekStart={weekStart} sessions={plan.sessions} todayOffset={todayOffset} />
        ) : (
          <p className="text-sm text-muted-foreground text-center py-2">
            {t('coachGenerateWeekHint', {
              defaultValue: 'Open Coach to generate your weekly plan.',
            })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
