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

export interface CloudProfileSlice {
  locale?: string | null;
  units?: string | null;
  goals?: string | null;
  equipment?: string | null;
  experience?: string | null;
  primary_goal?: string | null;
  ui_mode?: string | null;
  journey_state?: JourneyState | null;
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
  if (profile.locale) localStorage.setItem('i18nextLng', profile.locale);
  if (profile.units === 'metric' || profile.units === 'imperial') {
    localStorage.setItem('mw_units', profile.units);
  }
  if (profile.goals) localStorage.setItem('mw_goals', profile.goals);
  if (profile.equipment) localStorage.setItem('mw_equipment', profile.equipment);
  if (profile.experience) localStorage.setItem('mw_experience', profile.experience);
  if (profile.primary_goal) {
    localStorage.setItem('mw_primary_goal', profile.primary_goal);
    localStorage.setItem('mw_goals', profile.primary_goal);
  }
  if (profile.ui_mode === 'simple' || profile.ui_mode === 'pro') {
    saveUiMode(profile.ui_mode);
  }
}

/** Pull cloud profile journey + preferences; merge with local (farthest progress wins). */
export async function pullJourneyFromCloud(): Promise<boolean> {
  const user = await getUser();
  if (!user || !process.env.NEXT_PUBLIC_SUPABASE_URL) return false;

  const { data, error } = await supabase
    .from('profiles')
    .select('locale, units, goals, equipment, experience, primary_goal, ui_mode, journey_state, updated_at')
    .eq('id', user.id)
    .maybeSingle();

  if (error || !data) return false;

  applyProfileFieldsToLocal(data as CloudProfileSlice);

  const local = loadJourneyState();
  if (data.journey_state && typeof data.journey_state === 'object') {
    const merged = mergeJourneyStates(local, data.journey_state as JourneyState);
    saveJourneyState(merged);
    if (merged.commissionedAt) {
      localStorage.setItem('mw_commissioned_at', merged.commissionedAt);
    }
  }

  window.dispatchEvent(new CustomEvent('mw-journey-synced'));
  return true;
}

/** Push local journey + profile prefs to Supabase. */
export async function pushJourneyToCloud(): Promise<boolean> {
  const user = await getUser();
  if (!user || !process.env.NEXT_PUBLIC_SUPABASE_URL) return false;

  const journey = loadJourneyState();
  const locale =
    typeof window !== 'undefined'
      ? localStorage.getItem('i18nextLng')?.split('-')[0] || 'en'
      : 'en';
  const units = typeof window !== 'undefined' ? localStorage.getItem('mw_units') || 'metric' : 'metric';
  const goals = typeof window !== 'undefined' ? localStorage.getItem('mw_goals') || '' : '';
  const equipment = typeof window !== 'undefined' ? localStorage.getItem('mw_equipment') || '' : '';
  const experience = typeof window !== 'undefined' ? localStorage.getItem('mw_experience') || '' : '';
  const primaryGoal =
    typeof window !== 'undefined' ? localStorage.getItem('mw_primary_goal') || goals : goals;
  const uiMode: UiMode = loadUiMode();

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

let pushTimer: ReturnType<typeof setTimeout> | null = null;

/** Debounced cloud push after local journey/prefs change. */
export function scheduleJourneyPush(delayMs = 1500): void {
  if (typeof window === 'undefined') return;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    pushTimer = null;
    void pushJourneyToCloud();
  }, delayMs);
}

/** On sign-in: merge cloud → local, then push merged state back. */
export async function syncJourneyOnSignIn(): Promise<void> {
  await pullJourneyFromCloud();
  await pushJourneyToCloud();
}
