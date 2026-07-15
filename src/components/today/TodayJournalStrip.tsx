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
  if (Number.isNaN(d.getTime())) return at.split('T')[0] ?? at;
  const today = new Date().toISOString().split('T')[0];
  const day = at.split('T')[0];
  const time = d.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' });
  if (day === today) return time;
  return d.toLocaleDateString(locale, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function TodayJournalStrip({ entries, locale, className }: Props) {
  const { t } = useTranslation();

  if (!entries.length) {
    return (
      <div
        className={cn(
          'rounded-xl border border-dashed border-border/60 bg-muted/10 px-4 py-6 text-center space-y-2',
          className
        )}
      >
        <p className="text-sm text-muted-foreground">
          {t('todayJournalEmpty', {
            defaultValue:
              'Nothing logged yet — train, fuel, or check in on Mind to start your strip.',
          })}
        </p>
        <Link href="/mind" className="text-sm text-primary hover:underline inline-block">
          {t('todayJournalViewMind', { defaultValue: 'Log check-in →' })}
        </Link>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {entries.map((entry) => {
        const meta = PILLAR_META[entry.pillar];
        const Icon = meta.icon;
        return (
          <Link
            key={entry.id}
            href={meta.href}
            className="flex items-start gap-3 rounded-xl border border-border/40 bg-card/50 px-3 py-2.5 hover:border-primary/40 hover:bg-primary/10 transition-colors"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted/60">
              <Icon className="h-4 w-4 text-primary" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-wide text-muted-foreground">
                <span>{t(meta.labelKey, { defaultValue: entry.pillar })}</span>
                <span aria-hidden>·</span>
                <time dateTime={entry.at}>{formatWhen(entry.at, locale)}</time>
              </div>
              <p className="text-sm font-medium truncate">{entry.title}</p>
              {entry.detail && (
                <p className="text-xs text-muted-foreground truncate">{entry.detail}</p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
