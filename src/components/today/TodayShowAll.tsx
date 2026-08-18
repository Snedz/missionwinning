'use client';

/**
 * Lean house door. First paint stays date + pins + sentence + Start.
 * Coach week lives here — not on HomeTodayLean, not as a second Today.
 */

import { useTranslation } from 'react-i18next';
import { TodayCoachWeekStrip } from '@/components/coach/TodayCoachWeekStrip';

export function TodayShowAll() {
  const { t } = useTranslation();

  return (
    <details className="group border-2 border-border bg-card">
      <summary
        className="flex min-h-[44px] cursor-pointer list-none items-center px-4 py-3 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden"
        data-testid="today-show-all"
      >
        {t('todayShowAll', { defaultValue: 'Show all' })}
      </summary>
      <div className="space-y-4 border-t-2 border-border p-4">
        <TodayCoachWeekStrip />
      </div>
    </details>
  );
}
