'use client';
/**
 * Move/Fuel/Mind suggestion chips.
 * See: src/components/today/INDEX.md
 */

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import type { CoachInsight } from '@/lib/score';
import { cn } from '@/lib/utils';
import {
  focusFromInsightParams,
  translateCoachActionLabel,
  translateCoachInsightLine,
} from '@/lib/readinessDisplay';

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
        const actionLabel = s.actionLabelKey
          ? translateCoachActionLabel(s.actionLabelKey, t)
          : t('todayCoachChipAction', { defaultValue: 'Open' });
        // English floors — chips used to default message to the action label,
        // so hydrate painted "Open Move pillar" instead of the insight line (.644).
        const focus = focusFromInsightParams(s.messageParams);
        const message = s.messageKey
          ? translateCoachInsightLine(
              {
                messageKey: s.messageKey,
                messageParams: s.messageParams,
                actionLabelKey: s.actionLabelKey,
                actionPath: path,
              },
              focus,
              t
            )
          : actionLabel;
        // Chip label is short action; full insight on title for long floors.
        return (
          <Link
            key={`${path}-${s.messageKey}`}
            href={path}
            className="inline-flex items-center min-h-[44px] tap-target border border-primary bg-tint px-3 py-1 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
            title={message}
          >
            {actionLabel}
          </Link>
        );
      })}
    </div>
  );
}
