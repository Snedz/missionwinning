'use client';

import type { LucideIcon } from 'lucide-react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ErrorStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: LucideIcon;
  className?: string;
};

/**
 * In-page fetch/recovery failure — pairs with EmptyState for empty success cases.
 *
 * Recut with EmptyState: flush left, 2px rules, no dashed border, no tinted
 * ground, no rounded chip. This one earns red because something actually
 * failed — but it separates by weight (a 2px `--primary` rule and a filled
 * mark) rather than washing the whole block in 5% danger, which on paper is
 * indistinguishable from the ground anyway.
 */
export function ErrorState({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon = AlertTriangle,
  className,
}: ErrorStateProps) {
  return (
    <div role="alert" className={cn('border-y-2 border-primary py-6', className)}>
      <div className="mb-4 flex h-9 w-9 items-center justify-center bg-primary text-primary-foreground">
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <p className="text-[22px] font-extrabold leading-tight tracking-[-0.01em] text-foreground">
        {title}
      </p>
      {description ? (
        <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
      {actionLabel && onAction ? (
        <Button
          type="button"
          variant="outline"
          className="mt-5 min-h-[44px] border-2 border-foreground"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
