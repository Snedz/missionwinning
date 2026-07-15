'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { CalendarDays } from 'lucide-react';
import type { WeekRecap } from '@/lib/weekRecap';

type Props = {
  recap: WeekRecap;
};

/** End-of-week / in-week briefing — retention surface for day-8 return. */
export function TodayWeekRecapCard({ recap }: Props) {
  const { t } = useTranslation();
  if (!recap.hasActivity && !recap.isWeekEnd) return null;

  const title = recap.isWeekEnd
    ? t('todayWeekRecapSundayTitle', { defaultValue: 'Week recap' })
    : t('todayWeekRecapTitle', { defaultValue: 'This week' });

  return (
    <section className="content-card border-brass/25 bg-brass/5 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brass/15 text-brass">
          <CalendarDays className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="eyebrow-honor">{title}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t('todayWeekRecapBody', {
              sessions: recap.sessions,
              sets: recap.totalSets,
              streak: recap.streak,
              defaultValue: recap.hasActivity
                ? `${recap.sessions} sessions · ${recap.totalSets} sets · ${recap.streak}-day streak`
                : 'No sessions yet this week — Just Go keeps the path alive.',
            })}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link
          href="/coach"
          className="text-xs font-medium text-primary hover:underline underline-offset-4"
        >
          {t('todayWeekRecapCoach', { defaultValue: 'Open AI weekly plan' })}
        </Link>
        <span className="text-muted-foreground text-xs">·</span>
        <Link
          href="/history"
          className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline underline-offset-4"
        >
          {t('todayWeekRecapHistory', { defaultValue: 'History' })}
        </Link>
      </div>
    </section>
  );
}
