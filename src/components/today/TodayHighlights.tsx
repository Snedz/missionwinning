'use client';

/**
 * One Highlights sentence. Renders nothing when there is nothing honest to say.
 */

import { useTranslation } from 'react-i18next';
import type { HighlightsSentence } from '@/lib/today/highlightsSentence';

export function TodayHighlights({ sentence }: { sentence: HighlightsSentence | null }) {
  const { t } = useTranslation();
  if (!sentence) return null;

  const text =
    sentence.key === 'todayHighlightsLast'
      ? t('todayHighlightsLast', {
          name: sentence.sessionName,
          defaultValue: '{{name}} is waiting.',
        })
      : t('todayHighlightsTrained', { defaultValue: 'You already trained today.' });

  return (
    <p className="text-sm leading-relaxed text-muted-foreground" data-testid="today-highlights">
      {text}
    </p>
  );
}
