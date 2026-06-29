'use client';

import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import type { LeaderboardEntry, LeaderboardBoardTheme } from '@/lib/leaderboard/types';
import { Medal } from 'lucide-react';

interface Props {
  entries: LeaderboardEntry[];
  unit: string;
  yourRank: number | null;
  theme?: LeaderboardBoardTheme;
}

function rankDisplay(rank: number) {
  if (rank === 1) return <Medal className="h-4 w-4 text-amber-400" aria-label="1st" />;
  if (rank === 2) return <Medal className="h-4 w-4 text-slate-300" aria-label="2nd" />;
  if (rank === 3) return <Medal className="h-4 w-4 text-amber-700" aria-label="3rd" />;
  return <span className="font-mono text-muted-foreground tabular-nums">{rank}</span>;
}

function deltaDisplay(delta?: number) {
  if (delta == null || delta === 0) return <span className="text-muted-foreground">—</span>;
  if (delta > 0) return <span className="text-emerald-400">▲{delta}</span>;
  return <span className="text-red-400/90">▼{Math.abs(delta)}</span>;
}

export function LeaderboardTable({ entries, unit, yourRank, theme = 'default' }: Props) {
  const { t } = useTranslation();
  return (
    <div
      className={cn(
        'rounded-2xl border overflow-hidden backdrop-blur-md',
        theme === 'night' && 'border-indigo-500/25 bg-indigo-950/20',
        theme === 'dawn' && 'border-amber-500/25 bg-amber-950/15',
        theme === 'default' && 'border-white/10 bg-card/80'
      )}
    >
      <div className="grid grid-cols-[2.5rem_1fr_4.5rem_3.5rem] gap-2 px-3 py-2 text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border/50 bg-muted/20">
        <span>#</span>
        <span>Operator</span>
        <span className="text-right">Score</span>
        <span className="text-right">Δ</span>
      </div>
      <ul className="max-h-[min(52vh,420px)] overflow-y-auto divide-y divide-border/30">
        {entries.map((e) => {
          const rank = e.rank ?? 0;
          return (
            <li
              key={e.id}
              className={cn(
                'grid grid-cols-[2.5rem_1fr_4.5rem_3.5rem] gap-2 px-3 py-2.5 items-center text-sm',
                e.isYou && theme === 'night' && 'bg-indigo-500/20 ring-1 ring-inset ring-indigo-400/40',
                e.isYou && theme === 'dawn' && 'bg-amber-500/15 ring-1 ring-inset ring-amber-400/40',
                e.isYou && theme === 'default' && 'bg-emerald-500/15 ring-1 ring-inset ring-emerald-500/30',
                rank <= 3 && !e.isYou && 'bg-amber-500/5'
              )}
            >
              <div className="flex justify-center">{rankDisplay(rank)}</div>
              <div className="min-w-0">
                <div className={cn('font-medium truncate', e.isYou && 'text-emerald-300')}>
                  {e.operatorName}
                  {e.isYou && (
                    <span className="ml-1.5 text-[10px] uppercase tracking-wide text-emerald-400/80">
                      {t('lbYou', { defaultValue: 'You' })}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-muted-foreground truncate">
                  {e.detail ?? e.countryName}
                  {e.region && !e.isYou ? ` · ${e.region}` : ''}
                </div>
              </div>
              <div className="text-right font-mono font-semibold tabular-nums">
                {e.score.toLocaleString()}
                <span className="text-[10px] text-muted-foreground ml-0.5">{unit}</span>
              </div>
              <div className="text-right text-xs font-mono">{deltaDisplay(e.delta)}</div>
            </li>
          );
        })}
      </ul>
      {yourRank != null && yourRank > entries.length && (
        <div className="px-3 py-2 text-xs text-muted-foreground border-t border-border/50">
          Your rank #{yourRank} — scroll up to find your row highlighted in green.
        </div>
      )}
    </div>
  );
}
