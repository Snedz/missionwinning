import type { GuidedSessionComplete } from '@/lib/guidedSession';
import { logPillarWin, type PillarType } from '@/lib/pillarLog';

/** Log a guided session completion toward Win Score + pillar wins. */
export function completeGuidedSession(
  pillar: PillarType,
  result: GuidedSessionComplete,
  extra?: Record<string, string | number>
): void {
  logPillarWin(pillar, result.title, {
    sessionId: result.sessionId ?? '',
    steps: result.totalSteps,
    durationSec: result.durationSec,
    ...extra,
  });
}
