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
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-primary">
            {today}
          </p>
          <h1 className="text-[2.1rem] font-extrabold leading-[1.05] tracking-[-0.01em] md:text-[2.5rem]">
            {t('today', { defaultValue: 'Today' })}
          </h1>
          {focusLine ? (
            <p className="text-sm leading-relaxed text-muted-foreground">{focusLine}</p>
          ) : null}
        </div>
        {showEditToday && onEditToday && (
          <button
            type="button"
            className="shrink-0 inline-flex items-center gap-1.5 min-h-[44px] border-2 border-foreground bg-transparent px-3 text-sm font-semibold transition-colors hover:bg-foreground/[0.07]"
            onClick={onEditToday}
          >
            <LayoutGrid className="h-4 w-4" />
            {t('todayEditToday', { defaultValue: 'Edit Today' })}
          </button>
        )}
      </div>
      {/* One meta line, per the handoff: streak tag · Rankings · sync state.
          These were three stacked blocks, which pushed the next action — the
          only thing on this screen that matters — further below the fold. */}
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-sm text-muted-foreground">
        {streak > 0 && (
          <>
            <StreakChip streak={streak} variant="inline" />
            <a href="/leaderboard" className="underline underline-offset-2 hover:text-foreground">
              {t('leaderboardRankings', { defaultValue: 'Rankings' })}
            </a>
          </>
        )}
        <span>
          {!userEmail ? (
            <>
              <a href="/profile" className="underline underline-offset-2 hover:text-foreground">
                {t('signInLink', { defaultValue: 'Sign in' })}
              </a>{' '}
              {t('signInOptional', {
                defaultValue: 'optional — progress stays on this device.',
              })}
            </>
          ) : (
            t('cloudSyncOn', { defaultValue: 'Cloud sync on.' })
          )}
        </span>
      </div>
      <JourneyStrip action={action} />
    </header>
  );
}
