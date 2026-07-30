'use client';

import { cn } from '@/lib/utils';

/**
 * Stagger reads as polish for the first few blocks and as lag for the rest.
 *
 * At 70ms with no cap, the eleventh block on Today started fading in **740ms**
 * after the page was interactive — the athlete watched the screen assemble
 * instead of using it. 50ms with the index capped at 6 keeps the cascade
 * legible and puts the worst case at 340ms, under the ~400ms where a delay stops
 * feeling like motion and starts feeling like waiting.
 */
const STEP_MS = 50;
const BASE_MS = 40;
/** Past this many blocks, everything shares the last delay. */
const MAX_STEPS = 6;

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
      style={{ animationDelay: `${BASE_MS + Math.min(index, MAX_STEPS) * STEP_MS}ms` }}
    >
      {children}
    </div>
  );
}
