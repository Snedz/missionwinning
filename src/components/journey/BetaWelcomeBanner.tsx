'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Moon, Sparkles, Trophy, X } from 'lucide-react';

const DISMISS_KEY = 'mw_beta_banner_dismissed';

export function BetaWelcomeBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(localStorage.getItem(DISMISS_KEY) !== '1');
  }, []);

  if (!visible) return null;

  return (
    <div className="relative rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/50 via-slate-950 to-indigo-950/40 p-4 pr-10 shadow-lg shadow-emerald-900/20">
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
      <div className="flex items-center gap-2 text-emerald-400 text-xs uppercase tracking-widest font-medium mb-2">
        <Sparkles className="h-4 w-4" />
        New in this beta
      </div>
      <p className="text-sm text-foreground/90 leading-relaxed mb-3">
        Journey path, rankings with night &amp; dawn boards, 14 languages. Tap the header to browse all tools.{' '}
        <Link href="/beta" className="text-emerald-400 hover:underline">
          Beta guide →
        </Link>
      </p>
      <div className="flex flex-wrap gap-2">
        <Link
          href="/leaderboard"
          className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20"
        >
          <Trophy className="h-3.5 w-3.5" />
          Rankings
        </Link>
        <Link
          href="/leaderboard?board=under-the-stars"
          className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/40 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-300 hover:bg-indigo-500/20"
        >
          <Moon className="h-3.5 w-3.5" />
          Under the Stars
        </Link>
        <Link
          href="/profile"
          className="inline-flex items-center gap-1.5 rounded-full border border-border/50 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          Language &amp; profile
        </Link>
      </div>
    </div>
  );
}
