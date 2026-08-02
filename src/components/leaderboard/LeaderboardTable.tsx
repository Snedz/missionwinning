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
  if (rank === 1) return <Medal className="h-4 w-4 text-status-warn" aria-label="1st" />;
  // `.225` — was `text-slate-300`, stock Tailwind. Rank is already carried by
  // position and the aria-label; the medals differ by tier, not by hue.
  if (rank === 2) return <Medal className="h-4 w-4 text-muted-foreground" aria-label="2nd" />;
  // Brass is retired (`.131`); this resolved to a neutral anyway.
  if (rank === 3) return <Medal className="h-4 w-4 text-muted-foreground/70" aria-label="3rd" />;
  return <span className="font-mono text-muted-foreground tabular-nums">{rank}</span>;
}

function deltaDisplay(delta?: number) {
  if (delta == null || delta === 0) return <span className="text-muted-foreground">—</span>;
  if (delta > 0) return <span className="text-primary">▲{delta}</span>;
  // `.225` — was `text-red-400/90`, a raw Tailwind palette red. `check-design-system`
  // forbids raw hex but not palette classes, so this survived the rebrand the same way
  // `.221`'s blue/green chart did. Direction is carried by the ▼ glyph, not colour
  // (WCAG 1.4.1), so muted ink is enough and red stays the one action colour.
  return <span className="text-muted-foreground">▼{Math.abs(delta)}</span>;
}

export function LeaderboardTable({ entries, unit, yourRank, theme = 'default' }: Props) {
  const { t } = useTranslation();

  /*
   * `.225` — nothing to list means no list.
   *
   * This rendered unconditionally: the bordered box, then the four-column header
   * strip (`# / Operator / Score / Δ`), then an empty `<ul>`. On the class scope
   * pacers are deliberately excluded (`rank.ts:74`), so a class with nothing
   * synced got a heading, a column header and a void — under a line reading
   * **"0 operators"**. That is the reference screenshot this wave is named after,
   * shipped, on a real route.
   *
   * The caller already renders an `EmptyState` above; drawing furniture beneath
   * it said the data was merely late rather than absent.
   */
  if (entries.length === 0) return null;

  return (
    <div
      className={cn(
        'border-2 overflow-hidden',
        theme === 'night' && 'border-border bg-card',
        theme === 'dawn' && 'border-[hsl(var(--status-warn)/0.25)] bg-[hsl(var(--status-warn)/0.08)]',
        theme === 'default' && 'border-border bg-card/80'
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
                e.isYou && theme === 'night' && 'bg-card ring-1 ring-inset ring-[hsl(var(--status-info)/0.4)]',
                e.isYou && theme === 'dawn' && 'bg-[hsl(var(--status-warn)/0.15)] ring-1 ring-inset ring-[hsl(var(--status-warn)/0.4)]',
                e.isYou && theme === 'default' && 'bg-tint ring-1 ring-inset ring-primary/30',
                rank <= 3 && !e.isYou && 'bg-[hsl(var(--status-warn)/0.05)]'
              )}
            >
              <div className="flex justify-center">{rankDisplay(rank)}</div>
              <div className="min-w-0">
                <div className={cn('font-medium truncate', e.isYou && 'text-primary')}>
                  {e.operatorName}
                  {e.isYou && (
                    <span className="ml-1.5 text-[10px] uppercase tracking-wide text-primary/80">
                      {t('lbYou', { defaultValue: 'You' })}
                    </span>
                  )}
                  {e.isPacer && !e.isYou && (
                    <span
                      className="ml-1.5 rounded border border-border/60 bg-muted/40 px-1 py-px text-[9px] uppercase tracking-wide text-muted-foreground align-middle"
                      title={t('lbPacerHint', {
                        defaultValue: 'Pacer — a virtual pace-setter, not a real athlete',
                      })}
                    >
                      {t('lbPacer', { defaultValue: 'Pacer' })}
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
