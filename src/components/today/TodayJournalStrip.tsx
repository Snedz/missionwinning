'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import {
  BookOpen,
  Brain,
  Dumbbell,
  MapPin,
  UtensilsCrossed,
  Wind,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { JournalEntry, JournalPillar } from '@/lib/todayTrends';
import { cn } from '@/lib/utils';
import { localDateKey, localDateKeyFromIso } from '@/lib/time/localDate';

const PILLAR_META: Record<
  JournalPillar,
  { icon: LucideIcon; labelKey: keyof import('@/i18n/todayLocales').TodayStrings; href: string }
> = {
  train: { icon: Dumbbell, labelKey: 'todayPillarTrain', href: '/history' },
  fuel: { icon: UtensilsCrossed, labelKey: 'todayPillarFuel', href: '/nutrition' },
  move: { icon: Wind, labelKey: 'todayPillarMove', href: '/move' },
  mind: { icon: Brain, labelKey: 'todayPillarMind', href: '/mind' },
  track: { icon: MapPin, labelKey: 'todayPillarTrack', href: '/track' },
  learn: { icon: BookOpen, labelKey: 'todayPillarLearn', href: '/learn' },
};

type Props = {
  entries: JournalEntry[];
  locale: string;
  className?: string;
};

function formatWhen(at: string, locale: string): string {
  const d = new Date(at);
  // Unparseable: there is no local day to derive, and truncating to ten
  // characters only makes a malformed value look like a date. Show it as-is.
  if (Number.isNaN(d.getTime())) return at;
  const today = localDateKey();
  // `.225` — a UTC date compared against a local `today` showed this
  // morning's entry as "Jul 31" instead of its time, east of UTC.
  const day = localDateKeyFromIso(at);
  const time = d.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' });
  if (day === today) return time;
  return d.toLocaleDateString(locale, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function TodayJournalStrip({ entries, locale, className }: Props) {
  const { t } = useTranslation();

  if (!entries.length) {
    // A ruled box, not a dashed one. Copy is the repo's, not the mock's — the
    // handoff's own brief keeps copy unchanged, and rewording costs 13 locales.
    return (
      <div className={cn('space-y-3 border-2 border-border p-6', className)}>
        <p className="text-sm text-muted-foreground">
          {t('todayJournalEmpty', {
            defaultValue:
              'Nothing logged yet — train, fuel, or check in on Mind to start your strip.',
          })}
        </p>
        {/* Outline, not a red fill. Today docks exactly one red action and this
            is a secondary route into Mind — found by `check-display-type` the
            day that rule was written, which is the rule working. */}
        <Link
          href="/mind"
          className="inline-flex min-h-[44px] items-center border-2 border-border px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
        >
          {t('todayJournalViewMind', { defaultValue: 'Log check-in →' })}
        </Link>
      </div>
    );
  }

  // A ruled table, not a stack of cards: these are log lines, and 1px rules
  // between them read as one record instead of six floating objects.
  return (
    <div className={cn('border-t border-border', className)}>
      {entries.map((entry) => {
        const meta = PILLAR_META[entry.pillar];
        const Icon = meta.icon;
        return (
          <Link
            key={entry.id}
            href={meta.href}
            className="flex min-h-[44px] items-start gap-3 border-b border-border px-1 py-2.5 transition-colors hover:bg-accent-100"
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                <span>{t(meta.labelKey, { defaultValue: entry.pillar })}</span>
                <span aria-hidden>·</span>
                <time dateTime={entry.at} className="tabular-nums">
                  {formatWhen(entry.at, locale)}
                </time>
              </div>
              <p className="truncate text-sm font-semibold">{entry.title}</p>
              {entry.detail && (
                <p className="truncate text-xs text-muted-foreground">{entry.detail}</p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
