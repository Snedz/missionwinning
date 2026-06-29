'use client';

import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { JourneyAction } from '@/lib/missionJourney';
import { getPhaseLabel } from '@/lib/missionJourney';

export function JourneyStrip({ action }: { action: JourneyAction }) {
  if (action.phase === 'commissioned') {
    return (
      <div className="flex items-center justify-between text-xs text-muted-foreground py-2">
        <span className="text-emerald-400 font-medium">{action.stepLabel}</span>
        <a href="/leaderboard" className="text-emerald-400/80 hover:text-emerald-400 hover:underline">
          Rankings →
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/40 bg-muted/30 p-4 space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-emerald-400 uppercase tracking-wide">
          {getPhaseLabel(action.phase)}
        </span>
        <span className="text-muted-foreground">{action.stepLabel}</span>
      </div>
      <div className="h-1 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
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
  const { t } = useTranslation();
  const label = activeWorkout ? t('resumeWorkout', { defaultValue: 'Resume workout' }) : action.label;

  return (
    <div className="content-card journey-enter p-6 space-y-4">
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
          {t('yourNextStep', { defaultValue: 'Your next step' })}
        </p>
        <h3 className="text-xl font-semibold tracking-tight">{label}</h3>
        <p className="text-base text-muted-foreground mt-2 leading-relaxed">{action.description}</p>
      </div>
      <button type="button" onClick={onPrimaryClick} className="primary-action">
        {label}
        <ChevronRight className="h-5 w-5" />
      </button>
      {action.phase === 'basic' && (
        <p className="text-xs text-center text-muted-foreground">
          One step at a time. More tools unlock as you progress.
        </p>
      )}
    </div>
  );
}
