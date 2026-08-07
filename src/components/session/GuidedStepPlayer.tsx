'use client';

import { useEffect, useReducer, useRef } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { MeterBar } from '@/components/ui/MeterBar';
import { track } from '@/lib/analytics';
import {
  buildCompletionResult,
  currentStep,
  formatGuidedClock,
  initSessionState,
  overallProgress,
  pauseSession,
  resetSession,
  resumeSession,
  skipStep,
  startSession,
  tickSession,
  type GuidedSessionComplete,
  type GuidedSessionState,
  type GuidedStep,
} from '@/lib/guidedSession';
import { restProgress } from '@/lib/workout/restTimer';
import { Check, Pause, Play, SkipForward } from 'lucide-react';

type Props = {
  sessionId?: string;
  title: string;
  subtitle?: string;
  steps: GuidedStep[];
  onComplete?: (result: GuidedSessionComplete) => void;
  onExit?: () => void;
  /** Compact card layout for grid pickers (Mind free sessions). */
  variant?: 'full' | 'compact';
};

type Action =
  | { type: 'set'; state: GuidedSessionState }
  | { type: 'tick' }
  | { type: 'skip' };

function reducer(state: GuidedSessionState, action: Action): GuidedSessionState {
  switch (action.type) {
    case 'set':
      return action.state;
    case 'tick':
      return tickSession(state);
    case 'skip':
      return skipStep(state);
    default:
      return state;
  }
}

export function GuidedStepPlayer({
  sessionId,
  title,
  subtitle,
  steps,
  onComplete,
  onExit,
  variant = 'full',
}: Props) {
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(reducer, steps, initSessionState);
  const completedRef = useRef(false);

  const step = currentStep(state);
  const stepPct = step ? restProgress(step.durationSec, state.remainingSec) * 100 : 0;
  const totalPct = overallProgress(state);

  useEffect(() => {
    if (state.status !== 'completed' || completedRef.current) return;
    completedRef.current = true;
    const result = buildCompletionResult(state, { sessionId, title });
    track('pillar_win', {
      pillar: 'guided',
      action: 'session_completed',
      sessionId: sessionId ?? title,
      steps: result.totalSteps,
    });
    onComplete?.(result);
  }, [state, sessionId, title, onComplete]);

  useEffect(() => {
    if (state.status !== 'playing') return;
    const id = setInterval(() => dispatch({ type: 'tick' }), 1000);
    return () => clearInterval(id);
  }, [state.status]);

  const handleStart = () => dispatch({ type: 'set', state: startSession(state) });
  const handlePause = () => dispatch({ type: 'set', state: pauseSession(state) });
  const handleResume = () => dispatch({ type: 'set', state: resumeSession(state) });
  const handleSkip = () => dispatch({ type: 'skip' });
  const handleReset = () => {
    completedRef.current = false;
    dispatch({ type: 'set', state: resetSession(steps) });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (state.status === 'idle') handleStart();
      else if (state.status === 'playing') handlePause();
      else if (state.status === 'paused') handleResume();
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleSkip();
    }
    if (e.key === 'Escape') onExit?.();
  };

  // The red completion banner. A finished session is the one moment this screen
  // earns the field — and .poster-field, not poster red, because the hint line
  // under it is 12px.
  if (state.status === 'completed') {
    return (
      <Card className="poster-field border-0" tabIndex={0} onKeyDown={onKeyDown}>
        <CardContent className="py-10 space-y-4">
          <Check className="h-12 w-12" aria-hidden />
          <h3 className="text-2xl font-extrabold">
            {t('guidedSessionComplete', { defaultValue: 'Session complete' })}
          </h3>
          <p className="poster-sub text-sm">{title}</p>
          <p className="poster-sub text-xs">
            {t('guidedSessionNextHint', {
              defaultValue: 'Next: log protein on Fuel, read a Learn chapter, or return to Today.',
            })}
          </p>
          <div className="flex gap-2 flex-wrap">
            <Button asChild variant="onInk" size="sm" className="min-h-[44px] tap-target">
              <Link href="/nutrition">{t('coachActionLogNutrition', { defaultValue: 'Log Fuel' })}</Link>
            </Button>
            <Button asChild variant="onInk" size="sm" className="min-h-[44px] tap-target">
              <Link href="/learn/guide">{t('coachActionOpenLearn', { defaultValue: 'Open Learn' })}</Link>
            </Button>
            <Button asChild variant="onInk" size="sm" className="min-h-[44px] tap-target">
              <Link href="/log">{t('coachActionViewToday', { defaultValue: 'Back to Today' })}</Link>
            </Button>
            <Button variant="onInkSolid" className="min-h-[44px] tap-target" onClick={handleReset}>
              {t('guidedSessionRepeat', { defaultValue: 'Repeat' })}
            </Button>
            {onExit && (
              <Button variant="onInk" className="min-h-[44px] tap-target" onClick={onExit}>
                {t('guidedSessionBack', { defaultValue: 'Back' })}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const isCompact = variant === 'compact';
  // Ink once it is actually running. Idle is still a card you might start; a
  // running session is the only thing on screen, same rule as the rest dock.
  const running = state.status !== 'idle';

  return (
    <Card
      className={cn(
        'content-card',
        running && 'border-neutral-900 bg-neutral-900 text-neutral-100'
      )}
      tabIndex={0}
      onKeyDown={onKeyDown}
      role="region"
      aria-label={title}
    >
      <CardHeader className={isCompact ? 'pb-2' : undefined}>
        <CardTitle className={`flex justify-between items-start gap-2 ${isCompact ? 'text-base' : ''}`}>
          <span>{title}</span>
          {!isCompact && (
            <span
            className={cn(
              'text-sm font-normal tabular-nums',
              running ? 'text-neutral-400' : 'text-muted-foreground'
            )}
          >
              {t('guidedSessionStepOf', {
                current: state.stepIndex + 1,
                total: steps.length,
                defaultValue: `Step ${state.stepIndex + 1}/${steps.length}`,
              })}
            </span>
          )}
        </CardTitle>
        {subtitle && (
          <p className={cn('text-xs', running ? 'text-neutral-400' : 'text-muted-foreground')}>
            {subtitle}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* The bar spans the panel now instead of sitting beside it as a ring —
            a session's progress is a length, and it reads at a glance. */}
        <div className="flex flex-col gap-4">
          <MeterBar
            label={t('guidedSessionProgress', { defaultValue: 'Progress' })}
            value={totalPct}
            tone={running ? 'ink' : 'paper'}
            readout={`${totalPct}% · ${formatGuidedClock(state.remainingSec)}`}
          />
          <div
            className={cn(
              'flex-1 w-full min-h-[72px] border-2 p-4',
              running ? 'border-neutral-700 bg-neutral-800' : 'border-border bg-card'
            )}
          >
            <p className={cn('leading-relaxed', isCompact ? 'text-sm' : 'text-base')}>
              {step?.label}
            </p>
            {step?.cue && (
              <p className={cn('text-sm mt-2', running ? 'text-neutral-400' : 'text-muted-foreground')}>
                {step.cue}
              </p>
            )}
            {running && (
              <p
                className="text-[44px] font-extrabold leading-none tabular-nums mt-3"
                aria-live="polite"
              >
                {formatGuidedClock(state.remainingSec)}
              </p>
            )}
          </div>
          {/* Step dots: where you are in the flow at a glance, per the handoff.
              Squares, because nothing here is round. */}
          {steps.length > 1 && (
            <div className="flex flex-wrap gap-1" aria-hidden>
              {steps.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    'h-1.5 w-4',
                    i < state.stepIndex
                      ? running ? 'bg-accent-400' : 'bg-primary-fill'
                      : i === state.stepIndex
                        ? running ? 'bg-neutral-100' : 'bg-foreground'
                        : running ? 'bg-neutral-700' : 'bg-neutral-300'
                  )}
                />
              ))}
            </div>
          )}
        </div>
        {/* Current step, not the session — stays a bare div rather than a
            MeterBar because it is aria-hidden decoration and MeterBar
            announces itself as a progressbar. */}
        <div
          className={cn('h-1.5 overflow-hidden', running ? 'bg-neutral-700' : 'bg-neutral-300')}
          aria-hidden
        >
          <div
            className={cn(
              'h-full transition-all duration-1000',
              running ? 'bg-accent-400' : 'bg-primary-fill'
            )}
            style={{ width: `${stepPct}%` }}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {/*
              `.242` — red on the full-screen player, paper-on-ink in a card.

              This was `variant="default"` unconditionally, and both callers
              (`GuidedMindSessionRunner`, `TimedFlowRunner`) render `compact` in a
              grid — so `/mind` painted **one red Start per guided session**, ten
              of them, and `/move` did the same per flow. That is the reading
              `.241` recorded as *"a composition decision per screen"* and it was
              too pessimistic by nine screens: it is one shared line.

              `outline`, and the ground is why. The card goes ink only once
              `running` is true (see the `cn` above), and Start renders in exactly
              one state — `idle` — so it is always on **paper**. The ink-panel
              variants are the trap here rather than the answer: `onInkSolid` is
              `bg-neutral-100`, near-white on paper, which is `.155`'s 1.01:1
              defect wearing the other palette. A 2px ink border is the same
              demotion `.241` gave `EmptyState`'s CTA, on the same ground.

              Full-screen keeps the red: there is one action on that screen, and
              spending the do-this-now colour on it is what the colour is for.
          */}
          {state.status === 'idle' && (
            <Button variant={isCompact ? 'outline' : 'default'} size={isCompact ? 'sm' : 'lg'} className="min-h-[44px]" onClick={handleStart} aria-label={t('guidedSessionStart', { defaultValue: 'Start session' })}>
              <Play className="h-4 w-4 mr-2" aria-hidden />
              {t('guidedSessionStart', { defaultValue: 'Start' })}
            </Button>
          )}
          {state.status === 'playing' && (
            <Button variant="onInk" size={isCompact ? 'sm' : 'lg'} className="min-h-[44px]" onClick={handlePause} aria-label={t('guidedSessionPause', { defaultValue: 'Pause' })}>
              <Pause className="h-4 w-4 mr-2" aria-hidden />
              {t('guidedSessionPause', { defaultValue: 'Pause' })}
            </Button>
          )}
          {state.status === 'paused' && (
            <Button variant="onInkSolid" size={isCompact ? 'sm' : 'lg'} className="min-h-[44px]" onClick={handleResume} aria-label={t('guidedSessionResume', { defaultValue: 'Resume' })}>
              <Play className="h-4 w-4 mr-2" aria-hidden />
              {t('guidedSessionResume', { defaultValue: 'Resume' })}
            </Button>
          )}
          {state.status !== 'idle' && (
            <>
              <Button variant="onInk" size={isCompact ? 'sm' : 'default'} className="min-h-[44px] tap-target" onClick={handleSkip} aria-label={t('guidedSessionSkip', { defaultValue: 'Skip step' })}>
                <SkipForward className="h-4 w-4 mr-2" aria-hidden />
                {t('guidedSessionSkip', { defaultValue: 'Skip' })}
              </Button>
              <Button variant="onInk" size="sm" className="min-h-[44px] tap-target" onClick={handleReset}>
                {t('guidedSessionReset', { defaultValue: 'Reset' })}
              </Button>
            </>
          )}
          {onExit && state.status === 'idle' && (
            <Button variant="ghost" size="sm" className="min-h-[44px] tap-target" onClick={onExit}>
              {t('guidedSessionBack', { defaultValue: 'Back' })}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
