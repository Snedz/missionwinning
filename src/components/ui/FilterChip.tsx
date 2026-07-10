'use client';

import { cn } from '@/lib/utils';

type Props = {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
};

/** Shared pill chip for Library / public exercise filters. */
export function FilterChip({ active, onClick, children, className }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        active
          ? 'border-primary bg-primary/15 text-primary'
          : 'border-border/60 text-muted-foreground hover:bg-muted/50',
        className
      )}
    >
      {children}
    </button>
  );
}
