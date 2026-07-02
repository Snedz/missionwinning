'use client';

import Link from 'next/link';
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
  secondaryActions?: { actionLabel: string; actionPath: string }[];
  source?: 'llm' | 'rules' | 'local' | 'offline';
  loading?: boolean;
  premiumLocked?: boolean;
}

export function CoachInsightCard({
  message,
  actionLabel,
  actionPath,
  secondaryActions = [],
  source = 'local',
  loading = false,
  premiumLocked = false,
}: CoachInsightCardProps) {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <Card className="border-border/60 bg-card/80 backdrop-blur-sm border-emerald-500/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-emerald-400" />
          {t('todayCoachInsightTitle', { defaultValue: 'Coach insight' })}
          {source === 'llm' && (
            <span className="text-[10px] font-normal uppercase tracking-wide text-emerald-400/80 border border-emerald-500/30 rounded-full px-2 py-0.5">
              {t('coachAiBadge', { defaultValue: 'AI' })}
            </span>
          )}
          {source === 'offline' && (
            <span className="text-[10px] font-normal uppercase tracking-wide text-slate-300/90 border border-slate-500/30 rounded-full px-2 py-0.5">
              {t('coachOfflineBadge', { defaultValue: 'Offline' })}
            </span>
          )}
        </CardTitle>
        <CardDescription>
          {t('todayCoachInsightDesc', {
            defaultValue: 'Based on your readiness, strain, recovery, and pillar synergy',
          })}
          {premiumLocked && (
            <>
              {' '}
              <Link href="/bundle" className="text-emerald-400 hover:underline">
                {t('coachPremiumUpsell', { defaultValue: 'Unlock cloud AI Coach with Super Bundle' })}
              </Link>
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <p
            className={cn(
              'text-sm text-foreground/90 flex-1',
              loading && 'animate-pulse text-muted-foreground'
            )}
          >
            {loading
              ? t('coachLoading', { defaultValue: 'Reading your mission data…' })
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
        </div>
        {!loading && secondaryActions.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-t border-border/40 pt-3">
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground shrink-0">
              {t('coachAlsoTry', { defaultValue: 'Also try' })}
            </span>
            {secondaryActions.map((action) => (
              <Button
                key={action.actionPath}
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-emerald-400/90 hover:text-emerald-300"
                onClick={() => router.push(action.actionPath)}
              >
                {action.actionLabel}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
