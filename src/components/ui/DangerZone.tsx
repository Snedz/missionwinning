'use client';

import { cn } from '@/lib/utils';

type DangerZoneProps = {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
};

/** Geography for destructive actions — bordered, labeled, sit last on the page. */
export function DangerZone({
  title = 'Danger zone',
  description,
  children,
  className,
}: DangerZoneProps) {
  return (
    <section
      className={cn(
        'border-2 border-destructive bg-background p-4 space-y-3',
        className
      )}
      aria-label={title}
    >
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-destructive tracking-wide">{title}</h3>
        {description ? (
          <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </section>
  );
}
