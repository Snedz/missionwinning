'use client';

import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type PillarPageHeaderProps = {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  iconClassName?: string;
  className?: string;
};

export function PillarPageHeader({
  icon: Icon,
  title,
  subtitle,
  iconClassName,
  className,
}: PillarPageHeaderProps) {
  return (
    <div className={cn('space-y-1', className)}>
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
        <Icon className={cn('h-7 w-7 text-emerald-400 shrink-0', iconClassName)} />
        {title}
      </h1>
      <p className="text-muted-foreground text-sm md:text-base">{subtitle}</p>
    </div>
  );
}
