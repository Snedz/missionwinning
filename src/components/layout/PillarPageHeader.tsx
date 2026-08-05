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
 *
 * Speaks the system's display type: `.eyebrow` + `.display-section` (sentence
 * case — the caps were Barlow's, and `.display-section` never sets them). This
 * is the one file that gives all 13 pillar screens and every info page the
 * rebrand's voice; before it, the app had the palette but a hand-rolled
 * 600-weight title no other surface used. NO size or weight utility may sit
 * beside the display class — the utilities layer wins and silently discards
 * the clamp/weight (`check-display-type.mjs` enforces both).
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
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h1 className="flex items-center gap-3 display-section text-foreground">
        <Icon
          className={cn('h-6 w-6 shrink-0 text-primary md:h-8 md:w-8', iconClassName)}
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
