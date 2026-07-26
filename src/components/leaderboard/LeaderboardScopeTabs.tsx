'use client';

import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { visibleLeaderboardScopes } from '@/lib/leaderboard/boards';
import type { LeaderboardScope } from '@/lib/leaderboard/types';
import { SCOPE_I18N_KEY } from '@/i18n/leaderboardLocales';

interface Props {
  scope: LeaderboardScope;
  onScopeChange: (s: LeaderboardScope) => void;
  scopeLabel: string;
}

export function LeaderboardScopeTabs({ scope, onScopeChange, scopeLabel }: Props) {
  const { t } = useTranslation();
  return (
    <div className="space-y-2">
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {visibleLeaderboardScopes().map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onScopeChange(s.id)}
            className={cn(
              'shrink-0  px-3.5 py-2 text-xs font-medium transition-colors min-h-[36px]',
              scope === s.id
                ? 'bg-primary-fill text-white'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted'
            )}
          >
            {t(SCOPE_I18N_KEY[s.id], { defaultValue: s.label })}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        <span className="text-foreground/80 font-medium">{scopeLabel}</span>
        {' · '}
        {visibleLeaderboardScopes().find((s) => s.id === scope)?.description}
      </p>
    </div>
  );
}
