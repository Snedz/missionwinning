/** Headless timed-step session logic — shared by Mind + Move GuidedStepPlayer. */

import { formatRestClock, restProgress } from '@/lib/workout/restTimer';

export type GuidedStep = {
  label: string;
  cue?: string;
  durationSec: number;
};

export type GuidedSessionStatus = 'idle' | 'playing' | 'paused' | 'completed';

export type GuidedSessionState = {
  status: GuidedSessionStatus;
  stepIndex: number;
  remainingSec: number;
  steps: GuidedStep[];
};

export type GuidedSessionComplete = {
  sessionId?: string;
  title: string;
  totalSteps: number;
  durationSec: number;
};

export function totalSessionDurationSec(steps: GuidedStep[]): number {
  return steps.reduce((sum, s) => sum + s.durationSec, 0);
}

export function initSessionState(steps: GuidedStep[]): GuidedSessionState {
  return {
    status: 'idle',
    stepIndex: 0,
    remainingSec: steps[0]?.durationSec ?? 0,
    steps,
  };
}

export function currentStep(state: GuidedSessionState): GuidedStep | undefined {
  return state.steps[state.stepIndex];
}

export function stepProgress(state: GuidedSessionState): number {
  const step = currentStep(state);
  if (!step || step.durationSec <= 0) return 0;
  return restProgress(step.durationSec, state.remainingSec);
}

export function overallProgress(state: GuidedSessionState): number {
  if (!state.steps.length) return 0;
  const total = totalSessionDurationSec(state.steps);
  if (total <= 0) return 0;
  const completedBefore = state.steps
    .slice(0, state.stepIndex)
    .reduce((sum, s) => sum + s.durationSec, 0);
  const current = currentStep(state);
  const currentElapsed = current ? current.durationSec - state.remainingSec : 0;
  return Math.min(100, Math.round(((completedBefore + currentElapsed) / total) * 100));
}

export function startSession(state: GuidedSessionState): GuidedSessionState {
  if (!state.steps.length || state.status === 'completed') return state;
  return { ...state, status: 'playing' };
}

export function pauseSession(state: GuidedSessionState): GuidedSessionState {
  if (state.status !== 'playing') return state;
  return { ...state, status: 'paused' };
}

export function resumeSession(state: GuidedSessionState): GuidedSessionState {
  if (state.status !== 'paused') return state;
  return { ...state, status: 'playing' };
}

export function resetSession(steps: GuidedStep[]): GuidedSessionState {
  return initSessionState(steps);
}

function advanceOrComplete(state: GuidedSessionState): GuidedSessionState {
  const nextIndex = state.stepIndex + 1;
  if (nextIndex >= state.steps.length) {
    return { ...state, status: 'completed', remainingSec: 0 };
  }
  return {
    ...state,
    stepIndex: nextIndex,
    remainingSec: state.steps[nextIndex].durationSec,
  };
}

export function skipStep(state: GuidedSessionState): GuidedSessionState {
  if (state.status === 'completed' || !state.steps.length) return state;
  return advanceOrComplete(state);
}

/** Decrement remaining by 1s; auto-advance when a step ends. */
export function tickSession(state: GuidedSessionState): GuidedSessionState {
  if (state.status !== 'playing') return state;
  if (state.remainingSec > 0) {
    return { ...state, remainingSec: state.remainingSec - 1 };
  }
  return advanceOrComplete(state);
}

export function buildCompletionResult(
  state: GuidedSessionState,
  meta: { sessionId?: string; title: string }
): GuidedSessionComplete {
  return {
    sessionId: meta.sessionId,
    title: meta.title,
    totalSteps: state.steps.length,
    durationSec: totalSessionDurationSec(state.steps),
  };
}

export function formatGuidedClock(seconds: number): string {
  return formatRestClock(seconds);
}

/** Map mind session steps to shared player shape. */
export function mindStepsToGuided(
  steps: { text: string; durationSec: number }[]
): GuidedStep[] {
  return steps.map((s) => ({ label: s.text, durationSec: s.durationSec }));
}

/** Map mobility flow steps to shared player shape. */
export function mobilityStepsToGuided(
  steps: { title: string; cue: string; durationSec: number }[]
): GuidedStep[] {
  return steps.map((s) => ({ label: s.title, cue: s.cue, durationSec: s.durationSec }));
}
