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
