'use client';

import { GuidedStepPlayer } from '@/components/session/GuidedStepPlayer';
import { completeGuidedSession } from '@/lib/sessionComplete';
import { mobilityStepsToGuided } from '@/lib/guidedSession';
import type { MobilityFlow } from '@/data/mobilityFlows';

interface TimedFlowRunnerProps {
  flow: MobilityFlow;
  onComplete?: () => void;
  onExit?: () => void;
}

export function TimedFlowRunner({ flow, onComplete, onExit }: TimedFlowRunnerProps) {
  return (
    <GuidedStepPlayer
      sessionId={flow.id}
      title={flow.name}
      subtitle={flow.focus}
      steps={mobilityStepsToGuided(flow.steps)}
      onComplete={(result) => {
        completeGuidedSession('move', result, {
          sessionId: flow.id,
          durationMin: flow.durationMin,
        });
        onComplete?.();
      }}
      onExit={onExit}
    />
  );
}
