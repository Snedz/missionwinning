'use client';

import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type PillarPageHeaderProps = {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  /** Mono eyebrow above the display title (briefing anatomy). */
  eyebrow?: string;
  iconClassName?: string;
  className?: string;
};

/**
 * Unified page header: optional eyebrow → display title (+ icon) → muted subtitle.
 * Matches marketing briefing type so in-app pillars don't drop quality after Landing.
 */
export function PillarPageHeader({
  icon: Icon,
  title,
  subtitle,
  eyebrow,
  iconClassName,
  className,
}: PillarPageHeaderProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {eyebrow ? (
        <div className="briefing-rule">
          <span className="eyebrow">{eyebrow}</span>
        </div>
      ) : null}
      <h1 className="display-section flex items-center gap-3 text-[1.75rem] md:text-[2.25rem]">
        <Icon
          className={cn('h-7 w-7 shrink-0 text-primary md:h-8 md:w-8', iconClassName)}
          aria-hidden
        />
        <span className="min-w-0">{title}</span>
      </h1>
      {subtitle ? (
        <p className="max-w-2xl text-sm text-muted-foreground md:text-base">{subtitle}</p>
      ) : null}
    </div>
  );
}
