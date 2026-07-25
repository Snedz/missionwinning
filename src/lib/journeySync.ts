import { supabase, getUser } from '@/lib/supabase';
import {
  loadJourneyState,
  saveJourneyState,
  type JourneyPhase,
  type JourneyState,
} from '@/lib/missionJourney';
import { loadUiMode, saveUiMode, type UiMode } from '@/lib/uiMode';

const PHASE_RANK: Record<JourneyPhase, number> = {
  'i-day': 0,
  basic: 1,
  readiness: 2,
  commissioned: 3,
};

import { loadPlan, isTasterUsed, markTasterUsed, savePlan } from '@/lib/coach/storage';
import { I18N_LANG_KEY, STORAGE_KEYS } from '@/lib/storage/keys';
import { readRaw, writeRaw } from '@/lib/storage/safeStorage';
import { mergeCoachPlans } from '@/lib/coachSync';
import type { CoachPlan } from '@/lib/coach/types';
import { enqueue, registerHandler } from '@/lib/sync/outbox';

export interface CloudProfileSlice {
  locale?: string | null;
  units?: string | null;
  goals?: string | null;
  equipment?: string | null;
  experience?: string | null;
  primary_goal?: string | null;
  ui_mode?: string | null;
  journey_state?: JourneyState | null;
  coach_plan?: CoachPlan | null;
  coach_taster_used?: boolean | null;
  updated_at?: string | null;
}

export function mergeJourneyStates(a: JourneyState, b: JourneyState): JourneyState {
  const phase = PHASE_RANK[a.phase] >= PHASE_RANK[b.phase] ? a.phase : b.phase;
  return {
    phase,
    iDay: {
      startedAt: a.iDay.startedAt || b.iDay.startedAt,
      acceptedMissionAt: a.iDay.acceptedMissionAt || b.iDay.acceptedMissionAt,
      completedAt: a.iDay.completedAt || b.iDay.completedAt,
    },
    basic: {
      workout: a.basic.workout || b.basic.workout,
      fuel: a.basic.fuel || b.basic.fuel,
      move: a.basic.move || b.basic.move,
      mind: a.basic.mind || b.basic.mind,
      learn: a.basic.learn || b.basic.learn,
    },
    readiness: {
      parq: a.readiness.parq || b.readiness.parq,
      streakMet: a.readiness.streakMet || b.readiness.streakMet,
      winScoreSeen: a.readiness.winScoreSeen || b.readiness.winScoreSeen,
    },
    commissionedAt: a.commissionedAt || b.commissionedAt,
  };
}

function applyProfileFieldsToLocal(profile: CloudProfileSlice): void {
  if (typeof window === 'undefined') return;
  if (profile.locale) writeRaw(I18N_LANG_KEY, profile.locale);
  if (profile.units === 'metric' || profile.units === 'imperial') {
    writeRaw(STORAGE_KEYS.units, profile.units);
  }
  if (profile.goals) writeRaw(STORAGE_KEYS.goals, profile.goals);
  if (profile.equipment) writeRaw(STORAGE_KEYS.equipment, profile.equipment);
  if (profile.experience) writeRaw(STORAGE_KEYS.experience, profile.experience);
  if (profile.primary_goal) {
    writeRaw(STORAGE_KEYS.primaryGoal, profile.primary_goal);
    writeRaw(STORAGE_KEYS.goals, profile.primary_goal);
  }
  if (profile.ui_mode === 'simple' || profile.ui_mode === 'pro') {
    saveUiMode(profile.ui_mode);
  }
  if (profile.coach_taster_used) {
    markTasterUsed();
  }
  if (profile.coach_plan && typeof profile.coach_plan === 'object') {
    const local = loadPlan();
    const merged = mergeCoachPlans(local, profile.coach_plan as CoachPlan);
    if (merged) savePlan(merged);
  }
}

/** Pull cloud profile journey + preferences; merge with local (farthest progress wins). */
export async function pullJourneyFromCloud(): Promise<boolean> {
  const user = await getUser();
  if (!user || !process.env.NEXT_PUBLIC_SUPABASE_URL) return false;

  const { data, error } = await supabase
    .from('profiles')
    .select('locale, units, goals, equipment, experience, primary_goal, ui_mode, journey_state, coach_plan, coach_taster_used, updated_at')
    .eq('id', user.id)
    .maybeSingle();

  if (error || !data) return false;

  applyProfileFieldsToLocal(data as CloudProfileSlice);

  const local = loadJourneyState();
  if (data.journey_state && typeof data.journey_state === 'object') {
    const merged = mergeJourneyStates(local, data.journey_state as JourneyState);
    saveJourneyState(merged);
    if (merged.commissionedAt) {
      writeRaw(STORAGE_KEYS.commissionedAt, merged.commissionedAt);
    }
  }

  window.dispatchEvent(new CustomEvent('mw-journey-synced'));
  return true;
}

/** Push local journey + profile prefs to Supabase. */
export async function pushJourneyToCloud(): Promise<boolean> {
  const user = await getUser();
  // Signed out is not a failure — see coachSync for why this must not return false.
  if (!user || !process.env.NEXT_PUBLIC_SUPABASE_URL) return true;

  const journey = loadJourneyState();
  const locale = readRaw(I18N_LANG_KEY)?.split('-')[0] || 'en';
  const units = readRaw(STORAGE_KEYS.units) || 'metric';
  const goals = readRaw(STORAGE_KEYS.goals) || '';
  const equipment = readRaw(STORAGE_KEYS.equipment) || '';
  const experience = readRaw(STORAGE_KEYS.experience) || '';
  const primaryGoal = readRaw(STORAGE_KEYS.primaryGoal) || goals;
  const uiMode: UiMode = loadUiMode();
  const coachPlan = loadPlan();
  const coachTasterUsed = isTasterUsed();

  const { error } = await supabase.from('profiles').upsert(
    {
      id: user.id,
      email: user.email,
      locale,
      units,
      goals,
      equipment,
      experience,
      primary_goal: primaryGoal,
      ui_mode: uiMode,
      journey_state: journey,
      coach_plan: coachPlan,
      coach_taster_used: coachTasterUsed,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  );

  if (error) {
    console.error('pushJourneyToCloud error', error);
    return false;
  }
  return true;
}

/** Debounced cloud push after local journey/prefs change. */
/** Queue the journey snapshot. Latest-state; `delayMs` kept for compatibility. */
export function scheduleJourneyPush(_delayMs = 1500): void {
  if (typeof window === 'undefined') return;
  enqueue('journey.state', 'state', null);
}

let journeyHandlerRegistered = false;

/** Idempotent. Called from useOutboxDrain. */
export function registerJourneySyncHandler(): void {
  if (journeyHandlerRegistered) return;
  journeyHandlerRegistered = true;
  registerHandler('journey.state', () => pushJourneyToCloud());
}

/** Fire-and-forget welcome email for recently signed-up users. */
function requestWelcomeEmail(): void {
  if (typeof window === 'undefined') return;
  try {
    void fetch('/api/journey/welcome', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    }).catch(() => {
      /* non-fatal */
    });
  } catch {
    /* non-fatal */
  }
}

/** On sign-in: merge cloud → local, then push merged state back. */
export async function syncJourneyOnSignIn(): Promise<void> {
  await pullJourneyFromCloud();
  const pushed = await pushJourneyToCloud();
  if (pushed) {
    requestWelcomeEmail();
    // Referral redeem (Wave 8) — fire-and-forget; service-role write via API
    void import('@/lib/referral').then((m) => m.redeemReferralFromAttribution());
    // Beta invite redeem (Wave 10) — same pattern
    void import('@/lib/invite').then((m) => m.redeemInviteFromAttribution());
  }
}
