'use client';

import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TodaySectionProps {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

/** Progressive disclosure for Pro Mode Today — Apple-style accordion sections. */
export function TodaySection({ title, description, defaultOpen = false, children }: TodaySectionProps) {
  return (
    <details
      className="content-card group"
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 min-h-[44px] [&::-webkit-details-marker]:hidden">
        <div className="text-left">
          <h3 className="font-semibold text-base">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
        <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      <div className="px-5 pb-5 pt-0 border-t border-border">{children}</div>
    </details>
  );
}

export function TodaySections({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('space-y-3', className)}>{children}</div>;
}
