'use client';

import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { visibleLeaderboardBoards } from '@/lib/leaderboard/boards';
import type { LeaderboardBoardId } from '@/lib/leaderboard/types';
import { BOARD_I18N_KEY } from '@/i18n/leaderboardLocales';
import { Star, Flame, TrendingUp, UtensilsCrossed, Moon, Sunrise, Medal } from 'lucide-react';

const ICONS: Record<LeaderboardBoardId, typeof Star> = {
  'mission-score': Star,
  'training-streak': Flame,
  'weekly-volume': TrendingUp,
  'fuel-days': UtensilsCrossed,
  'presidential-fitness': Medal,
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
      {visibleLeaderboardBoards().map((b) => {
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
              'border-2 p-3 text-left transition-colors min-h-[72px]',
              active && b.theme === 'night' && 'border-border bg-card',
              active && b.theme === 'dawn' && 'border-border bg-accent-100',
              active && !themed && 'border-primary bg-tint',
              !active && 'border-border bg-card hover:border-foreground'
            )}
          >
            <Icon
              className={cn(
                'h-4 w-4 mb-1.5',
                active && b.theme === 'night' && 'text-muted-foreground',
                active && b.theme === 'dawn' && 'text-accent-900',
                active && !themed && 'text-primary',
                !active && 'text-muted-foreground'
              )}
            />
            <div
              className={cn(
                'text-xs font-semibold leading-tight',
                active && b.theme === 'night' && 'text-muted-foreground',
                active && b.theme === 'dawn' && 'text-accent-900',
                active && !themed && 'text-primary',
                !active && 'text-foreground'
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
