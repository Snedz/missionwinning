'use client';

import { cn } from '@/lib/utils';

type Props = {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
};

/** Shared filter tag for Library / public exercise filters — Modernist square,
 * tint fill when active. No local focus ring: the global :focus-visible covers it. */
export function FilterChip({ active, onClick, children, className }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'shrink-0 rounded-none border px-3 py-1 text-xs font-semibold transition-colors',
        active
          ? 'border-primary bg-tint text-primary'
          : 'border-border text-muted-foreground hover:bg-secondary hover:text-foreground',
        className
      )}
    >
      {children}
    </button>
  );
}
