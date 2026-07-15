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
  '/learn': 'Learn',
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
        const actionLabel = s.actionLabelKey
          ? t(s.actionLabelKey, { defaultValue: pillar })
          : pillar;
        const message = s.messageKey
          ? t(s.messageKey, {
              defaultValue: actionLabel,
              ...(s.messageParams ?? {}),
            })
          : actionLabel;
        return (
          <Link
            key={`${path}-${s.messageKey}`}
            href={path}
            className="inline-flex items-center rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
            title={actionLabel}
          >
            {message} →
          </Link>
        );
      })}
    </div>
  );
}
