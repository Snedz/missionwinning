import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';

/**
 * App-group loading boundary only — marketing/SSG routes stay without root loading.tsx.
 */
export default function AppLoading() {
  return (
    <div
      className="mx-auto w-full max-w-2xl space-y-6 px-4 py-8"
      data-no-page-enter
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Loading…</span>
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full max-w-sm" />
      </div>
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}
