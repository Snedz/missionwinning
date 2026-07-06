'use client';
/**
 * Move/Fuel/Mind suggestion chips.
 * See: src/components/today/INDEX.md
 */

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import type { CoachInsight } from '@/lib/score';
import { cn } from '@/lib/utils';

const PILLAR_CHIP: Record<string, string> = {
  '/move': 'Move',
  '/nutrition': 'Fuel',
  '/mind': 'Mind',
  '/track': 'Track',
  '/learn/course': 'Learn',
};

type Props = {
  suggestions: CoachInsight[];
  className?: string;
};

export function CrossPillarCoachChips({ suggestions, className }: Props) {
  const { t } = useTranslation();
  if (suggestions.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {suggestions.map((s) => {
        const path = s.actionPath ?? '/log';
        const pillar = PILLAR_CHIP[path] ?? 'Action';
        const label = s.actionLabelKey
          ? t(s.actionLabelKey, { defaultValue: pillar })
          : pillar;
        return (
          <Link
            key={`${path}-${s.messageKey}`}
            href={path}
            className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20 transition-colors"
          >
            {label} →
          </Link>
        );
      })}
    </div>
  );
}
