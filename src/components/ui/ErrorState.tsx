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

/** In-page fetch/recovery failure — pairs with EmptyState for empty success cases. */
export function ErrorState({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon = AlertTriangle,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'content-card flex flex-col items-center justify-center gap-3 border-dashed border-status-danger/30 bg-status-danger/5 px-6 py-10 text-center',
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-status-danger/10 text-status-danger">
        <Icon className="h-6 w-6" aria-hidden />
      </div>
      <div className="space-y-1 max-w-sm">
        <p className="font-medium text-foreground">{title}</p>
        {description ? (
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        ) : null}
      </div>
      {actionLabel && onAction ? (
        <Button type="button" variant="outline" className="mt-1" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
