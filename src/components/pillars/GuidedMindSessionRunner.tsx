'use client';

import { GuidedStepPlayer } from '@/components/session/GuidedStepPlayer';
import { completeGuidedSession } from '@/lib/sessionComplete';
import { mindStepsToGuided } from '@/lib/guidedSession';
import type { GuidedMindSession } from '@/data/guidedMindSessions';

type Props = {
  session: GuidedMindSession;
  onLogged?: () => void;
};

/** Thin wrapper — free + premium mind sessions use the shared player. */
export function GuidedMindSessionRunner({ session, onLogged }: Props) {
  return (
    <GuidedStepPlayer
      sessionId={session.id}
      title={session.title}
      subtitle={session.subtitle}
      steps={mindStepsToGuided(session.steps)}
      variant="compact"
      onComplete={(result) => {
        completeGuidedSession('mind', result, { sessionId: session.id });
        onLogged?.();
      }}
    />
  );
}
