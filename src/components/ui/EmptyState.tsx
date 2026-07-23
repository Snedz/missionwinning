'use client';

import type { LucideIcon } from 'lucide-react';
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
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  href,
  actionDisabled,
  className,
}: EmptyStateProps) {
  const ctaClass = 'mt-5 min-h-[44px] tap-target';

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20 px-6 py-10 text-center',
        className
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
        <Icon className="h-7 w-7 text-primary" />
      </div>
      <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-foreground">
        {title}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
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
