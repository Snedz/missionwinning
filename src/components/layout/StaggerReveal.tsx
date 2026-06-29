'use client';

import { cn } from '@/lib/utils';

const STEP_MS = 70;
const BASE_MS = 40;

type StaggerGroupProps = {
  children: React.ReactNode;
  className?: string;
};

/** Wraps a vertical stack that should animate in with staggered delays. */
export function StaggerGroup({ children, className }: StaggerGroupProps) {
  return <div className={cn('stagger-group', className)}>{children}</div>;
}

type StaggerItemProps = {
  index: number;
  children: React.ReactNode;
  className?: string;
};

/** Single block in a stagger group — fade/slide up with index-based delay. */
export function StaggerItem({ index, children, className }: StaggerItemProps) {
  return (
    <div
      className={cn('stagger-enter', className)}
      style={{ animationDelay: `${BASE_MS + index * STEP_MS}ms` }}
    >
      {children}
    </div>
  );
}
