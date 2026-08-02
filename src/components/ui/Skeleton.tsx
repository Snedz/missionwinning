import { cn } from '@/lib/utils';

/**
 * Reserved-space placeholder for route / card loading.
 *
 * No pulse, and `neutral-300` rather than `bg-muted/50`. The old bars were
 * `#eae9e9` at half alpha over a `#eae9e9` card — literally invisible until the
 * pulse dimmed them, which meant the animation *was* the information and
 * `prefers-reduced-motion` deleted it. A placeholder's job is to hold the shape
 * the content will take; it does not need to move to say so.
 */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('bg-neutral-300', className)} aria-hidden />;
}

/**
 * A single placeholder that **announces itself**, for `dynamic()` fallbacks.
 *
 * `Skeleton` is `aria-hidden`: it is a shape, deliberately not content, and every
 * composite below wraps a group of them in one `role="status" aria-busy="true"`
 * so the screen says "loading" once rather than five times. That contract breaks
 * the moment a bare `Skeleton` is used *as* a fallback with no wrapper — which is
 * what `HomeTodayDashboard` did for five lazily-mounted widgets on `/`. The
 * result was a loading state invisible twice over: assistive tech was told to
 * skip it, and nothing in the DOM said the region was busy.
 *
 * `.253` — the second half of that mattered more than expected. `a11y.spec.ts`
 * settles by waiting for `getAnimations()` to go quiet, and these placeholders
 * deliberately do not animate (see above), so the page read as *finished* while
 * five of them were still on screen. The better the loading design got, the
 * blinder the wait became.
 *
 * So: `aria-busy` is the one marker both the athlete's screen reader and the
 * gate read, and a placeholder that stands alone has to carry it.
 */
export function SkeletonBlock({
  className,
  label = 'Loading',
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div role="status" aria-busy="true" aria-label={label}>
      <Skeleton className={className} />
    </div>
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

/**
 * Loading states print what they already know.
 *
 * Day initials, macro names and section titles are static — they are known
 * before any data lands, so blanking them makes the screen change shape twice
 * (grey box → label → value) instead of once. Only the numerals are reserved.
 */
const DAY_INITIALS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const skeletonLabel =
  'text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground';

/** Week strip + session cards — matches Coach plan layout. */
export function CoachPlanSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('space-y-4', className)}
      role="status"
      aria-busy="true"
      aria-label="Loading coach plan"
    >
      <div className="grid grid-cols-7 border-y-2 border-border">
        {DAY_INITIALS.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-2 py-2">
            <span className={skeletonLabel} aria-hidden>
              {d}
            </span>
            <Skeleton className="h-2 w-2" />
          </div>
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
      className={cn('space-y-4 border-2 border-border p-4', className)}
      role="status"
      aria-busy="true"
      aria-label="Loading meal plan"
    >
      <span className={skeletonLabel}>Today&apos;s plan</span>
      <div className="flex gap-4">
        {['Protein', 'Carbs', 'Fat'].map((macro) => (
          <div key={macro} className="flex-1 space-y-1.5">
            <span className={skeletonLabel}>{macro}</span>
            <Skeleton className="h-6 w-full" />
          </div>
        ))}
      </div>
      {['Breakfast', 'Lunch', 'Dinner'].map((meal) => (
        <div key={meal} className="space-y-2 border-t-2 border-border pt-3">
          <span className={skeletonLabel}>{meal}</span>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}
