import type { JourneyBasicMilestones, JourneyPhase, JourneyReadinessMilestones } from '@/lib/missionJourney';
import { getUser, supabase } from '@/lib/supabase';

export interface JourneyAnalyticsEvent {
  name: string;
  payload: Record<string, unknown>;
  at: string;
}

const LOG_KEY = 'mw_journey_events';
const MAX_LOCAL_EVENTS = 100;

/** Persist journey analytics locally and push to Supabase when signed in. */
export function trackJourneyEvent(name: string, payload: Record<string, unknown> = {}): void {
  if (typeof window === 'undefined') return;

  const event: JourneyAnalyticsEvent = {
    name,
    payload,
    at: new Date().toISOString(),
  };

  try {
    const log = JSON.parse(localStorage.getItem(LOG_KEY) || '[]') as JourneyAnalyticsEvent[];
    log.push(event);
    localStorage.setItem(LOG_KEY, JSON.stringify(log.slice(-MAX_LOCAL_EVENTS)));
    localStorage.setItem(`mw_event_${name}_${Date.now()}`, JSON.stringify(event));
  } catch {
    localStorage.setItem(`mw_event_${name}_${Date.now()}`, JSON.stringify(event));
  }

  window.dispatchEvent(new CustomEvent('mw-journey-event', { detail: event }));
  void pushEventToCloud(event);
}

export function trackJourneyPhaseComplete(from: JourneyPhase, to: JourneyPhase): void {
  if (from === to) return;
  trackJourneyEvent('journey_phase_complete', { from, to });
}

export function trackBasicMilestoneChanges(
  prev: JourneyBasicMilestones,
  next: JourneyBasicMilestones
): void {
  for (const key of Object.keys(next) as (keyof JourneyBasicMilestones)[]) {
    if (!prev[key] && next[key]) {
      trackJourneyEvent('journey_milestone_complete', { phase: 'basic', milestone: key });
    }
  }
}

export function trackReadinessMilestoneChanges(
  prev: JourneyReadinessMilestones,
  next: JourneyReadinessMilestones
): void {
  for (const key of Object.keys(next) as (keyof JourneyReadinessMilestones)[]) {
    if (!prev[key] && next[key]) {
      trackJourneyEvent('journey_milestone_complete', { phase: 'readiness', milestone: key });
    }
  }
}

async function pushEventToCloud(event: JourneyAnalyticsEvent): Promise<void> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
  const user = await getUser();
  if (!user) return;

  const { error } = await supabase.from('journey_events').insert({
    user_id: user.id,
    event_name: event.name,
    payload: event.payload,
    created_at: event.at,
  });

  if (error) console.warn('journey_events insert', error.message);
}

export function getJourneyEvents(): JourneyAnalyticsEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(LOG_KEY) || '[]') as JourneyAnalyticsEvent[];
  } catch {
    return [];
  }
}

export interface BetaFunnelMetrics {
  phase: JourneyPhase;
  iDayComplete: boolean;
  basicDone: number;
  basicTotal: number;
  readinessDone: number;
  readinessTotal: number;
  commissioned: boolean;
  eventCount: number;
  phaseCompletes: number;
}

export function getBetaFunnelMetrics(state: {
  phase: JourneyPhase;
  iDay: { completedAt?: string };
  basic: JourneyBasicMilestones;
  readiness: JourneyReadinessMilestones;
  commissionedAt?: string;
}): BetaFunnelMetrics {
  const basicDone = Object.values(state.basic).filter(Boolean).length;
  const readinessDone = Object.values(state.readiness).filter(Boolean).length;
  const events = getJourneyEvents();

  return {
    phase: state.phase,
    iDayComplete: !!state.iDay.completedAt,
    basicDone,
    basicTotal: 5,
    readinessDone,
    readinessTotal: 3,
    commissioned: !!state.commissionedAt,
    eventCount: events.length,
    phaseCompletes: events.filter((e) => e.name === 'journey_phase_complete').length,
  };
}
