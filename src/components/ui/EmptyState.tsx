'use client';

import type { LucideIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  href?: string;
  /** Disable the action CTA (e.g. while store hydrates). */
  actionDisabled?: boolean;
  className?: string;
  /**
   * Optional Scout (or other) illustration — use on at most one empty surface.
   * See docs/MASCOT.md — never spam Train logger.
   */
  illustrationSrc?: string;
  illustrationAlt?: string;
};

/**
 * Empty success state — two 2px rules, flush left, on the paper ground.
 *
 * Was a dashed rounded box on a `bg-muted/20` fill with a 10%-opacity red icon
 * chip and centred copy: four things the system does not do. Nothing here is
 * decorative, so nothing here is a container.
 *
 * The action still renders where a caller passes one, but the design wants it
 * in the screen's docked field with every other primary action. Screens move it
 * there as they are rebuilt; passing it here stays valid until then.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  href,
  actionDisabled,
  className,
  illustrationSrc,
  illustrationAlt = '',
}: EmptyStateProps) {
  const ctaClass = 'mt-5 min-h-[44px] tap-target';

  return (
    <div className={cn('border-y-2 border-border py-6', className)}>
      {illustrationSrc ? (
        <div className="mb-4 relative h-28 w-28 overflow-hidden bg-card">
          <Image
            src={illustrationSrc}
            alt={illustrationAlt}
            width={112}
            height={112}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        /* Ink square, paper glyph — the same mark the monogram uses. A tinted
           chip at 10% alpha was invisible on paper and read as a disabled
           control where it was not. */
        <div className="mb-4 flex h-9 w-9 items-center justify-center bg-foreground text-background">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
      )}
      <h3 className="text-[22px] font-extrabold leading-tight tracking-[-0.01em] text-foreground">
        {title}
      </h3>
      <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-muted-foreground">
        {description}
      </p>
      {actionLabel && href && !actionDisabled && (
        <Button variant="fitness" className={ctaClass} asChild>
          <Link href={href}>{actionLabel}</Link>
        </Button>
      )}
      {actionLabel && onAction && !href && (
        <Button
          variant="fitness"
          className={ctaClass}
          onClick={onAction}
          disabled={actionDisabled}
        >
          {actionLabel}
        </Button>
      )}
      {actionLabel && actionDisabled && !onAction && !href && (
        <Button variant="fitness" className={ctaClass} disabled>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
