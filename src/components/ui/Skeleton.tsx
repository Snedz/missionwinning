import { cn } from '@/lib/utils';

/** Pulse placeholder for route / card loading. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded-lg bg-muted/50', className)}
      aria-hidden
    />
  );
}

/** Content-card shaped loading block for route transitions. */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn('content-card space-y-3 p-4', className)}
      role="status"
      aria-busy="true"
      aria-label="Loading"
    >
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-6 w-2/3 max-w-[16rem]" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-10 w-full mt-2" />
    </div>
  );
}

/** Week strip + session cards — matches Coach plan layout. */
export function CoachPlanSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('space-y-4', className)}
      role="status"
      aria-busy="true"
      aria-label="Loading coach plan"
    >
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-12 shrink-0 rounded-xl" />
        ))}
      </div>
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}

/** Macro row + meal rows — matches Fuel meal plan card. */
export function FuelPlanSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('content-card space-y-4 p-4', className)}
      role="status"
      aria-busy="true"
      aria-label="Loading meal plan"
    >
      <Skeleton className="h-5 w-40" />
      <div className="flex gap-2">
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 flex-1" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-2 rounded-xl border border-border/40 p-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}
