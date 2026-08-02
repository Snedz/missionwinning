'use client';

import Link from 'next/link';
import { Dumbbell, Sparkles, Target, X } from 'lucide-react';
import { BETA_BANNER_DISMISS_KEY } from '@/lib/today/betaBannerDismissed';
import { useDismissed } from '@/hooks/useDismissed';

const chipClass =
  'inline-flex items-center gap-1.5 rounded-xl border border-border/50 bg-muted/30 px-3 min-h-[44px] text-xs font-medium text-muted-foreground hover:text-foreground hover:border-border tap-target';

export function BetaWelcomeBanner() {
  const { dismissed, ready, dismiss } = useDismissed(BETA_BANNER_DISMISS_KEY);

  // `ready` gates the first paint: the shell declares this block from the same
  // key, so showing it before the device has been read would flash a card the
  // mount site is about to retract.
  if (!ready || dismissed) return null;

  return (
    <div className="relative rounded-2xl border border-border/50 bg-muted/20 p-4 pr-12">
      <button
        type="button"
        aria-label="Dismiss"
        className="absolute top-2 end-2 flex h-11 w-11 items-center justify-center text-muted-foreground hover:text-foreground tap-target"
        onClick={dismiss}
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-widest font-medium mb-2">
        <Sparkles className="h-4 w-4" />
        Beta path
      </div>
      <p className="text-sm text-foreground/90 leading-relaxed mb-3">
        Finish I-Day, log one workout from Today, then open Mission Coach — weekly plans from your
        logs alone.{' '}
        <Link href="/beta" className="text-primary hover:underline">
          Beta guide →
        </Link>
      </p>
      <div className="flex flex-wrap gap-2">
        <Link href="/welcome" className={chipClass}>
          <Target className="h-3.5 w-3.5" />
          I-Day
        </Link>
        <Link href="/active" className={chipClass}>
          <Dumbbell className="h-3.5 w-3.5" />
          Train
        </Link>
        <Link href="/coach" className={chipClass}>
          <Sparkles className="h-3.5 w-3.5" />
          Mission Coach
        </Link>
      </div>
    </div>
  );
}
