'use client';

import { LayoutGrid } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { JourneyAction } from '@/lib/missionJourney';
import { JourneyStrip } from '@/components/journey/JourneyHero';
import { StreakChip } from '@/components/today/StreakChip';

interface Props {
  today: string;
  /** Optional focus line under the title (full dashboard). */
  focusLine?: string | null;
  streak: number;
  userEmail: string | null;
  action: JourneyAction;
  showEditToday?: boolean;
  onEditToday?: () => void;
}

/**
 * Today chrome — no shadcn Button (Radix Slot) on the cold path.
 * Lean shell passes minimal props; full dashboard can pass focusLine + Edit.
 */
export function TodayPageHeader({
  today,
  focusLine,
  streak,
  userEmail,
  action,
  showEditToday,
  onEditToday,
}: Props) {
  const { t } = useTranslation();

  return (
    <header className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="eyebrow-live">{today}</p>
          <h1 className="display-section text-[1.85rem] md:text-[2.35rem]">
            {t('today', { defaultValue: 'Today' })}
          </h1>
          {focusLine ? <p className="text-sm text-muted-foreground">{focusLine}</p> : null}
        </div>
        {showEditToday && onEditToday && (
          <button
            type="button"
            className="shrink-0 inline-flex items-center gap-1.5 min-h-[40px] rounded-md border border-border/60 bg-background px-3 text-sm font-medium hover:bg-accent"
            onClick={onEditToday}
          >
            <LayoutGrid className="h-4 w-4 text-muted-foreground" />
            {t('todayEditToday', { defaultValue: 'Edit Today' })}
          </button>
        )}
      </div>
      {streak > 0 && (
        <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-1">
          <StreakChip streak={streak} variant="inline" />
          <span aria-hidden>·</span>
          <a href="/leaderboard" className="text-muted-foreground hover:text-foreground hover:underline">
            {t('leaderboardRankings', { defaultValue: 'Rankings' })}
          </a>
        </p>
      )}
      <p className="text-sm text-muted-foreground">
        {!userEmail ? (
          <>
            <a href="/profile" className="text-muted-foreground hover:text-foreground hover:underline">
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
      <JourneyStrip action={action} />
    </header>
  );
}
