'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { JourneyAction } from '@/lib/missionJourney';
import { getPhaseLabel } from '@/lib/missionJourney';

export function JourneyStrip({ action }: { action: JourneyAction }) {
  if (action.phase === 'commissioned') {
    return (
      <div className="flex items-center justify-between text-xs text-muted-foreground py-1 border-b border-border/40">
        <span className="text-emerald-400 font-medium">{action.stepLabel}</span>
        <Link href="/profile" className="hover:underline">
          Your profile →
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-3 space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-emerald-400 uppercase tracking-wide">
          {getPhaseLabel(action.phase)}
        </span>
        <span className="text-muted-foreground">{action.stepLabel}</span>
      </div>
      <div className="h-1.5 bg-muted rounded overflow-hidden">
        <div
          className="h-full bg-emerald-500 transition-all duration-500"
          style={{ width: `${action.progressPct}%` }}
        />
      </div>
    </div>
  );
}

interface JourneyHeroProps {
  action: JourneyAction;
  onPrimaryClick: () => void;
  activeWorkout?: boolean;
}

export function JourneyHero({ action, onPrimaryClick, activeWorkout }: JourneyHeroProps) {
  const label = activeWorkout ? 'Resume workout' : action.label;

  return (
    <div className="rounded-xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/30 to-primary/5 p-6 space-y-4">
      <div>
        <p className="text-xs uppercase tracking-widest text-emerald-400/80 mb-1">Your next step</p>
        <h3 className="text-xl font-bold">{label}</h3>
        <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
      </div>
      <button
        type="button"
        onClick={onPrimaryClick}
        className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 px-6 rounded-lg text-lg transition-colors"
      >
        {label}
        <ChevronRight className="h-5 w-5" />
      </button>
      {action.phase === 'basic' && (
        <p className="text-[10px] text-center text-muted-foreground">
          One step at a time. Other tools unlock as you complete Basic Training.
        </p>
      )}
    </div>
  );
}
