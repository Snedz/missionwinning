import { SkeletonCard } from '@/components/ui/Skeleton';

/** Lightweight shell while a code-split route chunk loads. */
export function RouteLoading({ label }: { label: string }) {
  return (
    <div
      className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-6"
      role="status"
      aria-busy="true"
      aria-label={`Loading ${label}`}
    >
      <SkeletonCard className="w-full max-w-md" />
      <p className="text-sm text-muted-foreground">Loading {label}…</p>
    </div>
  );
}
