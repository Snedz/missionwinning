'use client';

import { cn } from '@/lib/utils';
import { LEADERBOARD_BOARDS } from '@/lib/leaderboard/boards';
import type { LeaderboardBoardId } from '@/lib/leaderboard/types';
import { Star, Flame, TrendingUp, Moon } from 'lucide-react';

const ICONS: Record<LeaderboardBoardId, typeof Star> = {
  'mission-score': Star,
  'training-streak': Flame,
  'weekly-volume': TrendingUp,
  'under-the-stars': Moon,
};

interface Props {
  boardId: LeaderboardBoardId;
  onBoardChange: (id: LeaderboardBoardId) => void;
}

export function LeaderboardBoardPicker({ boardId, onBoardChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {LEADERBOARD_BOARDS.map((b) => {
        const Icon = ICONS[b.id];
        const active = boardId === b.id;
        return (
          <button
            key={b.id}
            type="button"
            onClick={() => onBoardChange(b.id)}
            className={cn(
              'rounded-xl border p-3 text-left transition-all min-h-[72px]',
              active
                ? 'border-emerald-500/50 bg-emerald-950/30 shadow-md'
                : 'border-border/50 bg-card/50 hover:border-border'
            )}
          >
            <Icon
              className={cn('h-4 w-4 mb-1.5', active ? 'text-emerald-400' : 'text-muted-foreground')}
            />
            <div className={cn('text-xs font-semibold leading-tight', active && 'text-emerald-100')}>
              {b.title}
            </div>
          </button>
        );
      })}
    </div>
  );
}
