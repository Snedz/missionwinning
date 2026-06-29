'use client';

import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { LEADERBOARD_BOARDS } from '@/lib/leaderboard/boards';
import type { LeaderboardBoardId } from '@/lib/leaderboard/types';
import { BOARD_I18N_KEY } from '@/i18n/leaderboardLocales';
import { Star, Flame, TrendingUp, UtensilsCrossed, Moon, Sunrise } from 'lucide-react';

const ICONS: Record<LeaderboardBoardId, typeof Star> = {
  'mission-score': Star,
  'training-streak': Flame,
  'weekly-volume': TrendingUp,
  'fuel-days': UtensilsCrossed,
  'under-the-stars': Moon,
  'dawns-early-light': Sunrise,
};

interface Props {
  boardId: LeaderboardBoardId;
  onBoardChange: (id: LeaderboardBoardId) => void;
}

export function LeaderboardBoardPicker({ boardId, onBoardChange }: Props) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {LEADERBOARD_BOARDS.map((b) => {
        const Icon = ICONS[b.id];
        const active = boardId === b.id;
        const themed = b.theme === 'night' || b.theme === 'dawn';
        const title = t(BOARD_I18N_KEY[b.id], { defaultValue: b.title });
        return (
          <button
            key={b.id}
            type="button"
            onClick={() => onBoardChange(b.id)}
            className={cn(
              'rounded-xl border p-3 text-left transition-all min-h-[72px]',
              active && b.theme === 'night' && 'border-indigo-500/50 bg-indigo-950/40 shadow-md',
              active && b.theme === 'dawn' && 'border-amber-500/50 bg-amber-950/30 shadow-md',
              active && !themed && 'border-emerald-500/50 bg-emerald-950/30 shadow-md',
              !active && 'border-border/50 bg-card/50 hover:border-border'
            )}
          >
            <Icon
              className={cn(
                'h-4 w-4 mb-1.5',
                active && b.theme === 'night' && 'text-indigo-300',
                active && b.theme === 'dawn' && 'text-amber-300',
                active && !themed && 'text-emerald-400',
                !active && 'text-muted-foreground'
              )}
            />
            <div
              className={cn(
                'text-xs font-semibold leading-tight',
                active && b.theme === 'night' && 'text-indigo-100',
                active && b.theme === 'dawn' && 'text-amber-100',
                active && !themed && 'text-emerald-100'
              )}
            >
              {title}
            </div>
          </button>
        );
      })}
    </div>
  );
}
