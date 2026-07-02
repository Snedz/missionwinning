'use client';

import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export function FaqSection({
  id = 'faq',
  title,
  subtitle,
  items,
  className,
}: {
  id?: string;
  title: string;
  subtitle?: string;
  items: FaqItem[];
  className?: string;
}) {
  return (
    <section id={id} className={cn('scroll-mt-20', className)}>
      <div className="text-center sm:text-start mb-8 space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h2>
        {subtitle && <p className="text-muted-foreground max-w-2xl">{subtitle}</p>}
      </div>
      <div className="space-y-3 max-w-3xl mx-auto sm:mx-0">
        {items.map((item) => (
          <details
            key={item.id}
            className="group rounded-xl border border-border/60 bg-card/50 open:border-emerald-500/30 transition-colors"
          >
            <summary className="tap-target flex cursor-pointer list-none items-center justify-between gap-4 p-4 font-medium text-sm sm:text-base [&::-webkit-details-marker]:hidden">
              {item.question}
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>
            <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
              {item.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
