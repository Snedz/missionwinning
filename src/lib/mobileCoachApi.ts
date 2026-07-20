/**
 * Server helpers for native mobile Coach API — wraps mw-core seed + adaptSummary.
 * Full planEngine remains client/web; native v1 uses seed + markSessionDone.
 */
import {
  createSeedCoachPlan,
  hasCoachAdaptationSignal,
  markSessionDone,
  summarizeCoachAdaptations,
  type CoachPlan,
  type EquipmentProfile,
} from '../../packages/mw-core/src/index';

export type MobileCoachPlanResponse = {
  plan: CoachPlan;
  adaptBeats: ReturnType<typeof summarizeCoachAdaptations>;
  hasAdaptSignal: boolean;
};

export function buildMobileCoachPlan(opts?: {
  equipment?: EquipmentProfile;
  withAdaptDemo?: boolean;
  revision?: number;
}): MobileCoachPlanResponse {
  const plan = createSeedCoachPlan(opts);
  return {
    plan,
    adaptBeats: summarizeCoachAdaptations(plan),
    hasAdaptSignal: hasCoachAdaptationSignal(plan),
  };
}

export function applySessionDone(plan: CoachPlan, sessionId: string): MobileCoachPlanResponse {
  const next = markSessionDone(plan, sessionId);
  return {
    plan: next,
    adaptBeats: summarizeCoachAdaptations(next),
    hasAdaptSignal: hasCoachAdaptationSignal(next),
  };
}

export type { CoachPlan, EquipmentProfile };
