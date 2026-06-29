'use client';

import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MUSCLE_GROUP_I18N, type MuscleGroup } from '@/lib/muscleGroups';
import { formatRecommendedFocusLine } from '@/lib/readinessDisplay';
import type { CoachInsight, RecommendedFocus } from '@/lib/score';

interface CoachInsightCardProps {
  insight: CoachInsight;
}

export function CoachInsightCard({ insight }: CoachInsightCardProps) {
  const router = useRouter();
  const { t } = useTranslation();

  const params = { ...(insight.messageParams ?? {}) };
  if (params.focusGroup && params.focusStatusKey) {
    const focus: RecommendedFocus = {
      group: params.focusGroup as MuscleGroup,
      statusKey: params.focusStatusKey as RecommendedFocus['statusKey'],
    };
    params.focusLine = formatRecommendedFocusLine(focus, t);
    delete params.focusGroup;
    delete params.focusStatusKey;
  } else if (params.focusGroup) {
    const group = t(MUSCLE_GROUP_I18N[params.focusGroup as MuscleGroup], {
      defaultValue: params.focusGroup,
    });
    params.focusLine = group;
    delete params.focusGroup;
  }

  const message = t(insight.messageKey, {
    ...params,
    defaultValue: insight.messageKey,
  });

  return (
    <Card className="border-border/60 bg-card/80 backdrop-blur-sm border-emerald-500/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-emerald-400" />
          {t('todayCoachInsightTitle', { defaultValue: 'Coach insight' })}
        </CardTitle>
        <CardDescription>
          {t('todayCoachInsightDesc', {
            defaultValue: 'Based on your readiness, strain, and recovery',
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row sm:items-center gap-4">
        <p className="text-sm text-foreground/90 flex-1">{message}</p>
        <Button variant="outline" size="sm" className="shrink-0" onClick={() => router.push(insight.actionPath)}>
          {t(insight.actionLabelKey, { defaultValue: insight.actionLabelKey })}
        </Button>
      </CardContent>
    </Card>
  );
}
