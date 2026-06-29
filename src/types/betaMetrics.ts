import type { JourneyPhase } from '@/lib/missionJourney';

export interface BetaFunnelAggregate {
  totalProfiles: number;
  signedUpLast14Days: number;
  iDayComplete: number;
  iDayCompletionPct: number;
  basicComplete: number;
  basicCompletePct: number;
  commissioned: number;
  commissionedPct: number;
  phaseCounts: Record<JourneyPhase, number>;
  journeyEventCount: number;
  phaseTransitionCount: number;
  targets: {
    iDayPct: number;
    basicPct: number;
    commissionedPct: number;
    launchBasicPct: number;
  };
  launchReady: boolean;
  launchNotes: string[];
}
