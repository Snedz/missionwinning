'use client';

import { LayoutGrid } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { JourneyAction } from '@/lib/missionJourney';
import type { RecommendedFocus } from '@/lib/score';
import { JourneyStrip } from '@/components/journey/JourneyHero';
import { formatRecommendedFocusLine } from '@/lib/readinessDisplay';
import { Button } from '@/components/ui/button';

interface Props {
  today: string;
  recommendedFocus: RecommendedFocus;
  userEquip: string;
  streak: number;
  userEmail: string | null;
  action: JourneyAction;
  showFocusLine: boolean;
  showEditToday?: boolean;
  onEditToday?: () => void;
}

export function TodayPageHeader({
  today,
  recommendedFocus,
  userEquip,
  streak,
  userEmail,
  action,
  showFocusLine,
  showEditToday,
  onEditToday,
}: Props) {
  const { t } = useTranslation();

  return (
    <header className="space-y-1">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[32px] font-semibold tracking-tight leading-tight">
            {t('today', { defaultValue: 'Today' })}
          </h1>
          <p className="text-base text-muted-foreground mt-1">{today}</p>
          {showFocusLine && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {formatRecommendedFocusLine(recommendedFocus, t)}
              {userEquip === 'bodyweight' ? ` · ${t('todayBodyweightTag', { defaultValue: 'bodyweight' })}` : ''}
            </p>
          )}
        </div>
        {showEditToday && onEditToday && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 gap-1.5 min-h-[40px] border-border/60"
            onClick={onEditToday}
          >
            <LayoutGrid className="h-4 w-4 text-emerald-400" />
            {t('todayEditToday', { defaultValue: 'Edit Today' })}
          </Button>
        )}
      </div>
      {streak > 0 && (
        <p className="text-sm text-muted-foreground pt-1">
          {t('todayDayStreak', { count: streak, defaultValue: `${streak}-day streak` })}{' · '}
          <a href="/leaderboard" className="text-emerald-400 hover:underline">
            {t('leaderboardRankings', { defaultValue: 'Rankings' })}
          </a>
        </p>
      )}
      <p className="text-sm text-muted-foreground pt-0.5">
        {!userEmail ? (
          <>
            <a href="/profile" className="text-emerald-400 hover:underline">
              {t('signInLink', { defaultValue: 'Sign in' })}
            </a>{' '}
            {t('signInOptional', {
              defaultValue: 'optional — progress stays on this device.',
            })}
          </>
        ) : (
          t('cloudSyncOn', { defaultValue: 'Cloud sync on.' })
        )}
      </p>
      <div className="pt-3">
        <JourneyStrip action={action} />
      </div>
    </header>
  );
}
