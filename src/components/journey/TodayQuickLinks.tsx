'use client';

import Link from 'next/link';
import { ChevronRight, Moon, Sunrise, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function TodayQuickLinks() {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <Link
        href="/leaderboard"
        className="group flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 hover:border-emerald-500/50 transition-colors"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20">
          <Trophy className="h-5 w-5 text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm">
            {t('leaderboardRankings', { defaultValue: 'Rankings' })}
          </div>
          <div className="text-xs text-muted-foreground truncate">Mission Score &amp; streaks</div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-emerald-400" />
      </Link>
      <Link
        href="/leaderboard?board=under-the-stars"
        className="group flex items-center gap-3 rounded-2xl border border-indigo-500/30 bg-indigo-950/25 p-4 hover:border-indigo-500/50 transition-colors"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20">
          <Moon className="h-5 w-5 text-indigo-300" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-indigo-100">
            {t('lbBoardUnderTheStars', { defaultValue: 'Under the Stars' })}
          </div>
          <div className="text-xs text-indigo-200/60 truncate">22:00–05:00 sessions</div>
        </div>
        <ChevronRight className="h-4 w-4 text-indigo-300/60 group-hover:text-indigo-300" />
      </Link>
      <Link
        href="/leaderboard?board=dawns-early-light"
        className="group flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 hover:border-amber-500/50 transition-colors"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20">
          <Sunrise className="h-5 w-5 text-amber-300" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-amber-100">
            {t('lbBoardDawnsEarlyLight', { defaultValue: "By Dawn's Early Light" })}
          </div>
          <div className="text-xs text-amber-200/60 truncate">05:00–08:00 sessions</div>
        </div>
        <ChevronRight className="h-4 w-4 text-amber-300/60 group-hover:text-amber-300" />
      </Link>
    </div>
  );
}
