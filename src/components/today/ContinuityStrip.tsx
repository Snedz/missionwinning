'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Brain, UtensilsCrossed, Wind } from 'lucide-react';
import type { ContinuitySuggestion } from '@/lib/today/continuityStrip';
import { cn } from '@/lib/utils';

const ICONS = {
  move: Wind,
  mind: Brain,
  fuel: UtensilsCrossed,
} as const;

type Props = {
  suggestions: ContinuitySuggestion[];
  className?: string;
};

/** Compact cross-pillar next steps after train history exists. */
export function ContinuityStrip({ suggestions, className }: Props) {
  const { t } = useTranslation();
  if (!suggestions.length) return null;

  return (
    <section
      className={cn(
        'border-2 border-border bg-card p-4 space-y-3 mt-1',
        className
      )}
      data-testid="continuity-strip"
      aria-label={t('continuityTitle', { defaultValue: 'After training' })}
    >
      <div>
        <h2 className="text-sm font-semibold text-foreground">
          {t('continuityTitle', { defaultValue: 'After training' })}
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {t('continuitySubtitle', {
            defaultValue: 'Move, mind, or fuel when you want them.',
          })}
        </p>
      </div>
      <ul className="space-y-2">
        {suggestions.map((s) => {
          const Icon = ICONS[s.kind];
          return (
            <li key={`${s.kind}-${s.href}-${s.titleKey}`}>
              <Link
                href={s.href}
                className="flex items-center gap-3 min-h-[44px] border-2 border-border px-3 py-2 hover:border-primary transition-colors"
              >
                <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-foreground">
                    {t(s.titleKey, { defaultValue: s.titleDefault })}
                  </span>
                  <span className="block text-[11px] text-muted-foreground">
                    {t(s.reasonKey, { defaultValue: s.reasonDefault })}
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
