'use client';

import { useEffect, useReducer, useRef } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricRing } from '@/components/ui/MetricRing';
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
import { restProgress } from '@/lib/restTimer';
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

  if (state.status === 'completed') {
    return (
      <Card className="content-card border-emerald-500/40" tabIndex={0} onKeyDown={onKeyDown}>
        <CardContent className="py-10 text-center space-y-4">
          <Check className="h-12 w-12 text-emerald-400 mx-auto" aria-hidden />
          <h3 className="text-xl font-bold">
            {t('guidedSessionComplete', { defaultValue: 'Session complete' })}
          </h3>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-xs text-muted-foreground px-2">
            {t('guidedSessionNextHint', {
              defaultValue: 'Next: log protein on Fuel, or start today’s training from Today.',
            })}
          </p>
          <div className="flex gap-2 justify-center flex-wrap">
            <Button asChild variant="outline" size="sm">
              <Link href="/nutrition">{t('coachActionLogNutrition', { defaultValue: 'Log Fuel' })}</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/log">{t('coachActionViewToday', { defaultValue: 'Back to Today' })}</Link>
            </Button>
            <Button variant="fitness" onClick={handleReset}>
              {t('guidedSessionRepeat', { defaultValue: 'Repeat' })}
            </Button>
            {onExit && (
              <Button variant="outline" onClick={onExit}>
                {t('guidedSessionBack', { defaultValue: 'Back' })}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const isCompact = variant === 'compact';

  return (
    <Card
      className={`content-card ${isCompact ? 'border-emerald-500/15' : 'border-primary/30'}`}
      tabIndex={0}
      onKeyDown={onKeyDown}
      role="region"
      aria-label={title}
    >
      <CardHeader className={isCompact ? 'pb-2' : undefined}>
        <CardTitle className={`flex justify-between items-start gap-2 ${isCompact ? 'text-base' : ''}`}>
          <span>{title}</span>
          {!isCompact && (
            <span className="text-sm font-normal text-muted-foreground tabular-nums">
              {t('guidedSessionStepOf', {
                current: state.stepIndex + 1,
                total: steps.length,
                defaultValue: `Step ${state.stepIndex + 1}/${steps.length}`,
              })}
            </span>
          )}
        </CardTitle>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={`flex ${isCompact ? 'flex-col' : 'flex-col sm:flex-row'} items-center gap-4`}>
          <MetricRing
            label={t('guidedSessionProgress', { defaultValue: 'Progress' })}
            value={`${totalPct}%`}
            sublabel={formatGuidedClock(state.remainingSec)}
            progress={totalPct}
            className="shrink-0"
          />
          <div className="flex-1 w-full min-h-[72px] rounded-xl bg-muted/20 border border-border/40 p-4">
            <p className={`leading-relaxed ${isCompact ? 'text-sm' : 'text-base'}`}>{step?.label}</p>
            {step?.cue && (
              <p className="text-sm text-muted-foreground mt-2">{step.cue}</p>
            )}
            {state.status !== 'idle' && (
              <p className="text-2xl font-bold tabular-nums text-emerald-400 mt-3" aria-live="polite">
                {formatGuidedClock(state.remainingSec)}
              </p>
            )}
          </div>
        </div>
        <div className="h-2 bg-muted rounded overflow-hidden" aria-hidden>
          <div
            className="h-2 bg-emerald-500 transition-all duration-1000"
            style={{ width: `${stepPct}%` }}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {state.status === 'idle' && (
            <Button variant="fitness" size={isCompact ? 'sm' : 'lg'} onClick={handleStart} aria-label={t('guidedSessionStart', { defaultValue: 'Start session' })}>
              <Play className="h-4 w-4 mr-2" aria-hidden />
              {t('guidedSessionStart', { defaultValue: 'Start' })}
            </Button>
          )}
          {state.status === 'playing' && (
            <Button variant="outline" size={isCompact ? 'sm' : 'lg'} onClick={handlePause} aria-label={t('guidedSessionPause', { defaultValue: 'Pause' })}>
              <Pause className="h-4 w-4 mr-2" aria-hidden />
              {t('guidedSessionPause', { defaultValue: 'Pause' })}
            </Button>
          )}
          {state.status === 'paused' && (
            <Button variant="fitness" size={isCompact ? 'sm' : 'lg'} onClick={handleResume} aria-label={t('guidedSessionResume', { defaultValue: 'Resume' })}>
              <Play className="h-4 w-4 mr-2" aria-hidden />
              {t('guidedSessionResume', { defaultValue: 'Resume' })}
            </Button>
          )}
          {state.status !== 'idle' && (
            <>
              <Button variant="ghost" size={isCompact ? 'sm' : 'default'} onClick={handleSkip} aria-label={t('guidedSessionSkip', { defaultValue: 'Skip step' })}>
                <SkipForward className="h-4 w-4 mr-2" aria-hidden />
                {t('guidedSessionSkip', { defaultValue: 'Skip' })}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                {t('guidedSessionReset', { defaultValue: 'Reset' })}
              </Button>
            </>
          )}
          {onExit && state.status === 'idle' && (
            <Button variant="ghost" size="sm" onClick={onExit}>
              {t('guidedSessionBack', { defaultValue: 'Back' })}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
