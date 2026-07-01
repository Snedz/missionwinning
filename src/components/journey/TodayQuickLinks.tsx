'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { ChevronRight, History, Moon, Sparkles, Sunrise, Trophy } from 'lucide-react';

const linkClass =
  'group flex items-center gap-3 rounded-2xl border p-4 hover:border-emerald-500/50 transition-colors min-h-[72px]';

export function TodayQuickLinks() {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link
          href="/leaderboard"
          className={`${linkClass} border-emerald-500/30 bg-emerald-950/20`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20">
            <Trophy className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm">
              {t('leaderboardRankings', { defaultValue: 'Rankings' })}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {t('todayQuickRankingsDesc', { defaultValue: 'Mission Score & streaks' })}
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-emerald-400" />
        </Link>

        <Link href="/history" className={`${linkClass} border-sky-500/30 bg-sky-950/20`}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/20">
            <History className="h-5 w-5 text-sky-300" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm">
              {t('navHistory', { defaultValue: 'History' })}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {t('todayQuickHistoryDesc', { defaultValue: 'Volume, 1RM & muscle map' })}
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-sky-300" />
        </Link>

        <Link href="/bundle" className={`${linkClass} border-violet-500/30 bg-violet-950/20`}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/20">
            <Sparkles className="h-5 w-5 text-violet-300" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm">
              {t('navBundle', { defaultValue: 'Super Bundle' })}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {t('todayQuickBundleDesc', { defaultValue: 'All six pillars, one subscription' })}
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-violet-300" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          href="/leaderboard?board=under-the-stars"
          className={`${linkClass} border-indigo-500/30 bg-indigo-950/25`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20">
            <Moon className="h-5 w-5 text-indigo-300" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm text-indigo-100">
              {t('lbBoardUnderTheStars', { defaultValue: 'Under the Stars' })}
            </div>
            <div className="text-xs text-indigo-200/60 truncate">
              {t('todayQuickNightDesc', { defaultValue: '22:00–05:00 sessions' })}
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-indigo-300/60 group-hover:text-indigo-300" />
        </Link>

        <Link
          href="/leaderboard?board=dawns-early-light"
          className={`${linkClass} border-amber-500/30 bg-amber-950/20`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20">
            <Sunrise className="h-5 w-5 text-amber-300" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm text-amber-100">
              {t('lbBoardDawnsEarlyLight', { defaultValue: "By Dawn's Early Light" })}
            </div>
            <div className="text-xs text-amber-200/60 truncate">
              {t('todayQuickDawnDesc', { defaultValue: '05:00–08:00 sessions' })}
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-amber-300/60 group-hover:text-amber-300" />
        </Link>
      </div>
    </div>
  );
}
