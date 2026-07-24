'use client';

import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type PillarPageHeaderProps = {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  /** Quiet label above the title (in-app — not marketing mono caps). */
  eyebrow?: string;
  iconClassName?: string;
  className?: string;
};

/**
 * In-app page header: optional eyebrow → title + icon → muted subtitle.
 * Uses sentence-case type so pillar screens feel human, not briefing-template.
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
        <p className="text-xs font-medium tracking-wide text-muted-foreground">{eyebrow}</p>
      ) : null}
      <h1 className="flex items-center gap-3 text-[1.65rem] font-semibold tracking-tight text-foreground md:text-[2rem] leading-tight">
        <Icon
          className={cn('h-6 w-6 shrink-0 text-primary md:h-7 md:w-7', iconClassName)}
          aria-hidden
        />
        <span className="min-w-0">{title}</span>
      </h1>
      {subtitle ? (
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
