'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { ChevronRight, History, Moon, Sparkles, Sunrise, Trophy } from 'lucide-react';

const linkClass =
  'group flex items-center gap-3 rounded-2xl border p-4 hover:border-primary/40 transition-colors min-h-[72px]';

interface TodayQuickLinksProps {
  /** Basic phase (pre-first-workout): no Bundle upsell, no themed boards —
   * nothing competes with the journey hero's single next action. */
  compact?: boolean;
}

export function TodayQuickLinks({ compact = false }: TodayQuickLinksProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <div className={`grid grid-cols-1 gap-3 ${compact ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`}>
        <Link
          href="/leaderboard"
          className={`${linkClass} border-primary/40 bg-primary/10`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/20">
            <Trophy className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm">
              {t('leaderboardRankings', { defaultValue: 'Rankings' })}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {t('todayQuickRankingsDesc', { defaultValue: 'Mission Score & streaks' })}
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
        </Link>

        <Link
          href="/history"
          className={`${linkClass} border-[hsl(var(--status-info)/0.3)] bg-[hsl(var(--status-info)/0.08)]`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--status-info)/0.15)]">
            <History className="h-5 w-5 text-[hsl(var(--status-info))]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm">
              {t('navHistory', { defaultValue: 'History' })}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {t('todayQuickHistoryDesc', { defaultValue: 'Volume, 1RM & muscle map' })}
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-[hsl(var(--status-info))]" />
        </Link>

        {!compact && (
        <Link href="/bundle" className={`${linkClass} border-brass/30 bg-brass/10`}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brass/20">
            <Sparkles className="h-5 w-5 text-brass" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm">
              {t('navBundle', { defaultValue: 'Super Bundle' })}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {t('todayQuickBundleDesc', { defaultValue: 'All six pillars, one subscription' })}
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-brass" />
        </Link>
        )}
      </div>

      {!compact && (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          href="/leaderboard?board=under-the-stars"
          className={`${linkClass} border-[hsl(var(--status-info)/0.3)] bg-[hsl(var(--status-info)/0.1)]`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--status-info)/0.15)]">
            <Moon className="h-5 w-5 text-[hsl(var(--status-info))]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm">
              {t('lbBoardUnderTheStars', { defaultValue: 'Under the Stars' })}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {t('todayQuickNightDesc', { defaultValue: '22:00–05:00 sessions' })}
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-[hsl(var(--status-info))]" />
        </Link>

        <Link
          href="/leaderboard?board=dawns-early-light"
          className={`${linkClass} border-[hsl(var(--status-warn)/0.3)] bg-[hsl(var(--status-warn)/0.08)]`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--status-warn)/0.15)]">
            <Sunrise className="h-5 w-5 text-[hsl(var(--status-warn))]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm text-[hsl(var(--status-warn))]">
              {t('lbBoardDawnsEarlyLight', { defaultValue: "By Dawn's Early Light" })}
            </div>
            <div className="text-xs text-[hsl(var(--status-warn)/0.6)] truncate">
              {t('todayQuickDawnDesc', { defaultValue: '05:00–08:00 sessions' })}
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-status-warn/60 group-hover:text-status-warn" />
        </Link>
      </div>
      )}
    </div>
  );
}
