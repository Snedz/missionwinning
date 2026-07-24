'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Dumbbell, Sparkles, Target, X } from 'lucide-react';
import { readRaw, writeRaw } from '@/lib/storage/safeStorage';

const DISMISS_KEY = 'mw_beta_banner_dismissed';

const chipClass =
  'inline-flex items-center gap-1.5 rounded-xl border border-border/50 bg-muted/30 px-3 min-h-[44px] text-xs font-medium text-muted-foreground hover:text-foreground hover:border-border tap-target';

export function BetaWelcomeBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(readRaw(DISMISS_KEY) !== '1');
  }, []);

  if (!visible) return null;

  return (
    <div className="relative rounded-2xl border border-border/50 bg-muted/20 p-4 pr-12">
      <button
        type="button"
        aria-label="Dismiss"
        className="absolute top-2 end-2 flex h-11 w-11 items-center justify-center text-muted-foreground hover:text-foreground tap-target"
        onClick={() => {
          writeRaw(DISMISS_KEY, '1');
          setVisible(false);
        }}
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
