'use client';

import { LayoutGrid } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface Props {
  onClick: () => void;
}

/** Bevel-inspired floating access to Move, Mind, Learn, Leaderboard, etc. */
export function MoreFab({ onClick }: Props) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={t('navMore', { defaultValue: 'More tools' })}
      className={cn(
        'md:hidden fixed z-[45] right-4 flex items-center gap-2',
        'rounded-full border border-emerald-500/40 bg-emerald-600/90 backdrop-blur-md',
        'text-white shadow-lg shadow-emerald-950/40 px-4 py-2.5 min-h-[44px]',
        'active:scale-[0.97] transition-transform',
        'bottom-[calc(60px+env(safe-area-inset-bottom))]'
      )}
    >
      <LayoutGrid className="h-5 w-5" />
      <span className="text-sm font-semibold">{t('navMore', { defaultValue: 'More' })}</span>
    </button>
  );
}
