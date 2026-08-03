'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { ChevronRight, History, Moon, Sparkles, Sunrise, Trophy } from 'lucide-react';
import { isFreeBeta } from '@/lib/freeBeta';

const linkClass =
  'group flex items-center gap-3 border-2 border-border bg-card p-4 hover:border-foreground transition-colors min-h-[72px]';

interface TodayQuickLinksProps {
  /** Basic phase (pre-first-workout): no Bundle upsell, no themed boards —
   * nothing competes with the journey hero's single next action. */
  compact?: boolean;
}

export function TodayQuickLinks({ compact = false }: TodayQuickLinksProps) {
  const { t } = useTranslation();
  const showBundle = !compact && !isFreeBeta();

  return (
    <div className="space-y-3">
      <div className={`grid grid-cols-1 gap-3 ${compact || isFreeBeta() ?'sm:grid-cols-2' : 'sm:grid-cols-3'}`}>
        <Link
          href="/leaderboard"
          className={linkClass}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-border bg-background">
            <Trophy className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm">
              {t('leaderboardRankings', { defaultValue: 'Rankings' })}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {t('todayQuickRankingsDesc', { defaultValue: 'Mission Score & streaks' })}
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
        </Link>

        <Link
          href="/history"
          className={linkClass}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-border bg-background">
            <History className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm">
              {t('navHistory', { defaultValue: 'History' })}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {t('todayQuickHistoryDesc', { defaultValue: 'Volume, 1RM & muscle map' })}
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
        </Link>

        {showBundle && (
        <Link href="/bundle" className={`${linkClass} border-border bg-accent-100`}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-border bg-background">
            <Sparkles className="h-5 w-5 text-accent-900" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm">
              {t('navBundle', { defaultValue: 'Super Bundle' })}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {t('todayQuickBundleDesc', {
                defaultValue: 'Coach depth — logger stays free',
              })}
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-accent-900" />
        </Link>
        )}
      </div>

      {!compact && (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          href="/leaderboard?board=under-the-stars"
          className={linkClass}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-border bg-background">
            <Moon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm">
              {t('lbBoardUnderTheStars', { defaultValue: 'Under the Stars' })}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {t('todayQuickNightDesc', { defaultValue: '22:00–05:00 sessions' })}
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
        </Link>

        <Link
          href="/leaderboard?board=dawns-early-light"
          className={linkClass}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-border bg-background">
            <Sunrise className="h-5 w-5 text-status-warn" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm text-status-warn">
              {t('lbBoardDawnsEarlyLight', { defaultValue: "By Dawn's Early Light" })}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {t('todayQuickDawnDesc', { defaultValue: '05:00–08:00 sessions' })}
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-status-warn" />
        </Link>
      </div>
      )}
    </div>
  );
}
