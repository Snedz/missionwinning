'use client';

import { useTranslation } from 'react-i18next';
import type { JourneyAction } from '@/lib/missionJourney';
import { JourneyStrip } from '@/components/journey/JourneyHero';

interface Props {
  today: string;
  recommendedFocus: string;
  userEquip: string;
  streak: number;
  userEmail: string | null;
  action: JourneyAction;
  showFocusLine: boolean;
}

export function TodayPageHeader({
  today,
  recommendedFocus,
  userEquip,
  streak,
  userEmail,
  action,
  showFocusLine,
}: Props) {
  const { t } = useTranslation();

  return (
    <header className="space-y-1">
      <div>
        <h1 className="text-[32px] font-semibold tracking-tight leading-tight">
          {t('today', { defaultValue: 'Today' })}
        </h1>
        <p className="text-base text-muted-foreground mt-1">{today}</p>
        {showFocusLine && (
          <p className="text-sm text-muted-foreground mt-0.5">
            {t('recommendedFocus', { defaultValue: recommendedFocus })}
            {userEquip === 'bodyweight' ? ` · ${t('todayBodyweightTag', { defaultValue: 'bodyweight' })}` : ''}
          </p>
        )}
      </div>
      {streak > 0 && (
        <p className="text-sm text-muted-foreground pt-1">
          {streak}-day streak ·{' '}
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
