'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Dumbbell, Sparkles, Target, X } from 'lucide-react';

const DISMISS_KEY = 'mw_beta_banner_dismissed';

export function BetaWelcomeBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(localStorage.getItem(DISMISS_KEY) !== '1');
  }, []);

  if (!visible) return null;

  return (
    <div className="relative rounded-2xl border border-primary/40 bg-gradient-to-br from-emerald-950/50 via-slate-950 to-[hsl(var(--status-info)/0.15)] p-4 pr-10 shadow-lg shadow-emerald-900/20">
      <button
        type="button"
        aria-label="Dismiss"
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground p-1"
        onClick={() => {
          localStorage.setItem(DISMISS_KEY, '1');
          setVisible(false);
        }}
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-center gap-2 text-primary text-xs uppercase tracking-widest font-medium mb-2">
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
        <Link
          href="/welcome"
          className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20"
        >
          <Target className="h-3.5 w-3.5" />
          I-Day
        </Link>
        <Link
          href="/active"
          className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20"
        >
          <Dumbbell className="h-3.5 w-3.5" />
          Train
        </Link>
        <Link
          href="/coach"
          className="inline-flex items-center gap-1.5 rounded-full border border-border/50 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Mission Coach
        </Link>
      </div>
    </div>
  );
}
