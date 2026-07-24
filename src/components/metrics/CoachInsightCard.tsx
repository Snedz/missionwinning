'use client';

import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CoachInsightCardProps {
  message: string;
  actionLabel: string;
  actionPath: string;
  source?: 'llm' | 'rules' | 'local';
  loading?: boolean;
}

export function CoachInsightCard({
  message,
  actionLabel,
  actionPath,
  source = 'local',
  loading = false,
}: CoachInsightCardProps) {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <Card className="border-border/50 bg-card/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Sparkles className="h-4 w-4 text-primary" />
          {t('todayCoachInsightTitle', { defaultValue: 'Coach note' })}
          {source === 'llm' && (
            <span className="text-[10px] font-medium text-primary/90 border border-primary/30 rounded-full px-2 py-0.5">
              {t('coachAiBadge', { defaultValue: 'Live' })}
            </span>
          )}
        </CardTitle>
        <CardDescription className="leading-relaxed">
          {t('todayCoachInsightDesc', {
            defaultValue: 'From your recent training load and recovery',
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row sm:items-center gap-4">
        <p
          className={cn(
            'text-sm text-foreground/90 flex-1 leading-relaxed',
            loading && 'animate-pulse text-muted-foreground'
          )}
        >
          {loading
            ? t('coachLoading', { defaultValue: 'Looking at your week…' })
            : message}
        </p>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0"
          disabled={loading}
          onClick={() => router.push(actionPath)}
        >
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
