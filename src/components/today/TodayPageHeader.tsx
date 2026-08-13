'use client';

import { LayoutGrid } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { JourneyAction } from '@/lib/missionJourney';
import { JourneyStrip } from '@/components/journey/JourneyHero';
import { StreakChip } from '@/components/today/StreakChip';
import { LOCAL_FIRST_COPY } from '@/lib/localFirstCopy';

interface Props {
  today: string;
  /** Optional focus line under the title (full dashboard). */
  focusLine?: string | null;
  streak: number;
  userEmail: string | null;
  /** F-017 — hide the Sign-in link until the first logged workout. */
  hasFirstWorkout?: boolean;
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
  hasFirstWorkout = false,
  action,
  showEditToday,
  onEditToday,
}: Props) {
  const { t } = useTranslation();

  return (
    /*
     * Field manual composition (hero-feel A): mono eyebrow → display → quiet
     * meta → journey strip. The red Start lives in JourneyHero / dock, not here.
     */
    <header className="space-y-2.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="eyebrow text-primary">{today}</p>
          <h1 className="display-section text-foreground">
            {t('today', { defaultValue: 'Today' })}
          </h1>
          {focusLine ? (
            <p className="max-w-[28rem] text-sm leading-relaxed text-muted-foreground">
              {focusLine}
            </p>
          ) : null}
        </div>
        {showEditToday && onEditToday && (
          <button
            type="button"
            className="shrink-0 inline-flex min-h-[44px] items-center gap-1.5 border-2 border-border bg-transparent px-3 text-sm font-semibold text-muted-foreground transition-colors hover:border-foreground hover:bg-muted hover:text-foreground"
            onClick={onEditToday}
          >
            <LayoutGrid className="h-4 w-4" />
            {t('todayEditToday', { defaultValue: 'Edit Today' })}
          </button>
        )}
      </div>
      {/* Meta stays one line and small so the docked Start is the job of the fold. */}
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted-foreground">
        {streak > 0 && (
          <>
            <StreakChip streak={streak} variant="inline" />
            <a href="/leaderboard" className="underline underline-offset-2 hover:text-foreground">
              {t('leaderboardRankings', { defaultValue: 'Rankings' })}
            </a>
          </>
        )}
        {userEmail ? (
          <span>
            {t('cloudSyncOn', {
              defaultValue: LOCAL_FIRST_COPY.todayBackupWhenOnline,
            })}
          </span>
        ) : hasFirstWorkout && !userEmail ? (
          <span>
            <a href="/profile" className="underline underline-offset-2 hover:text-foreground">
              {t('signInOptional', {
                defaultValue: LOCAL_FIRST_COPY.todaySignInOptional,
              })}
            </a>
          </span>
        ) : null}
      </div>
      <JourneyStrip action={action} />
    </header>
  );
}
