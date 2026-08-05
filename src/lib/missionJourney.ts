/**
 * Journey phase + next action. Cold-path free of challenges/guidebook/supabase —
 * only localStorage + optional workout history arrays.
 */
import type { CompletedWorkoutLog } from '@/types';
import { getPillarWins } from '@/lib/pillarLog';
import { getTrainingStreak } from '@/lib/streaks';
import { previewJustGoForEquipment } from '@/lib/justGoSession';
import { readRaw, writeRaw } from '@/lib/storage/safeStorage';
import { STORAGE_KEYS, WORKOUT_STORE_KEY } from '@/lib/storage/keys';
/* `.223` — the one definition, shared with `betaMetricsServer`. See that module. */
import { allBasicDone } from '@/lib/journey/basicComplete';
import { week1SecondSessionCue } from '@/lib/activation/week1SecondSession';

export type JourneyPhase = 'i-day' | 'basic' | 'readiness' | 'commissioned';

export interface JourneyBasicMilestones {
  workout: boolean;
  fuel: boolean;
  move: boolean;
  mind: boolean;
  learn: boolean;
}

export interface JourneyReadinessMilestones {
  parq: boolean;
  streakMet: boolean;
  winScoreSeen: boolean;
}

export interface JourneyState {
  phase: JourneyPhase;
  iDay: {
    startedAt?: string;
    acceptedMissionAt?: string;
    completedAt?: string;
  };
  basic: JourneyBasicMilestones;
  readiness: JourneyReadinessMilestones;
  commissionedAt?: string;
}

export interface JourneyAction {
  label: string;
  description: string;
  href: string;
  phase: JourneyPhase;
  stepLabel: string;
  progressPct: number;
  /** When set, Today hero starts this workout instead of navigating. */
  startWorkout?: {
    name: string;
    exercises: { exerciseId: string; sets: { reps: number; weight: number }[] }[];
  };
}

const STORAGE_KEY = 'mw_journey_state';

const DEFAULT_STATE: JourneyState = {
  phase: 'i-day',
  iDay: {},
  basic: { workout: false, fuel: false, move: false, mind: false, learn: false },
  readiness: { parq: false, streakMet: false, winScoreSeen: false },
};

/** Hydration-safe empty journey (no localStorage). */
export function getDefaultJourneyState(): JourneyState {
  return {
    phase: DEFAULT_STATE.phase,
    iDay: {},
    basic: { ...DEFAULT_STATE.basic },
    readiness: { ...DEFAULT_STATE.readiness },
  };
}

function hasLegacyOnboarding(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(readRaw(STORAGE_KEYS.experience) && readRaw(STORAGE_KEYS.equipment));
}

export function loadJourneyState(): JourneyState {
  if (typeof window === 'undefined') return { ...DEFAULT_STATE };

  try {
    const raw = readRaw(STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_STATE, ...JSON.parse(raw) } as JourneyState;
    }
  } catch {
    // fall through
  }

  if (hasLegacyOnboarding()) {
    const migrated: JourneyState = {
      ...DEFAULT_STATE,
      phase: 'basic',
      iDay: { completedAt: readRaw(STORAGE_KEYS.journeyStarted) ?? new Date().toISOString() },
    };
    saveJourneyState(migrated);
    return migrated;
  }

  return { ...DEFAULT_STATE };
}

export function saveJourneyState(state: JourneyState): void {
  if (typeof window === 'undefined') return;

  let prev: JourneyState = { ...DEFAULT_STATE };
  try {
    const raw = readRaw(STORAGE_KEY);
    if (raw) prev = { ...DEFAULT_STATE, ...JSON.parse(raw) } as JourneyState;
  } catch {
    // use default prev
  }

  writeRaw(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent('mw-journey-local-change'));
  void import('@/lib/journeySync').then((m) => m.scheduleJourneyPush());

  void import('@/lib/journeyAnalytics').then((a) => {
    if (prev.phase !== state.phase) {
      a.trackJourneyPhaseComplete(prev.phase, state.phase);
    }
    if (!prev.iDay.completedAt && state.iDay.completedAt) {
      a.trackJourneyEvent('i_day_complete', { experience: readRaw(STORAGE_KEYS.experience) });
    }
    if (!prev.commissionedAt && state.commissionedAt) {
      a.trackJourneyEvent('journey_commissioned', { at: state.commissionedAt });
    }
    a.trackBasicMilestoneChanges(prev.basic, state.basic);
    a.trackReadinessMilestoneChanges(prev.readiness, state.readiness);
  });
}

export function isIDayComplete(state?: JourneyState): boolean {
  const s = state ?? loadJourneyState();
  return !!s.iDay.completedAt || hasLegacyOnboarding();
}

export function markIDayStarted(): void {
  const s = loadJourneyState();
  if (!s.iDay.startedAt) {
    s.iDay.startedAt = new Date().toISOString();
    writeRaw(STORAGE_KEYS.journeyStarted, s.iDay.startedAt);
    saveJourneyState(s);
  }
}

export function markMissionAccepted(): void {
  const s = loadJourneyState();
  s.iDay.acceptedMissionAt = new Date().toISOString();
  saveJourneyState(s);
}

export function completeIDay(profile: {
  experience: string;
  equipment: string;
  primaryGoal: string;
}): void {
  writeRaw(STORAGE_KEYS.experience, profile.experience);
  writeRaw(STORAGE_KEYS.equipment, profile.equipment);
  writeRaw(STORAGE_KEYS.primaryGoal, profile.primaryGoal);
  writeRaw(STORAGE_KEYS.goals, profile.primaryGoal);

  const s = loadJourneyState();
  s.iDay.completedAt = new Date().toISOString();
  s.phase = 'basic';
  saveJourneyState(s);
}

function detectBasicMilestones(workoutHistory: CompletedWorkoutLog[] = []): JourneyBasicMilestones {
  if (typeof window === 'undefined') {
    return { workout: false, fuel: false, move: false, mind: false, learn: false };
  }

  let workout = workoutHistory.length > 0;
  if (!workout) {
    try {
      const hist = JSON.parse(readRaw(WORKOUT_STORE_KEY) || '{}');
      workout = (hist?.state?.workoutHistory?.length ?? 0) > 0;
    } catch {
      workout = false;
    }
  }

  let fuel = false;
  try {
    const logs = JSON.parse(readRaw('mw_nutrition_log') || '[]') as { protein?: number }[];
    fuel = logs.some((l) => (l.protein ?? 0) > 0);
  } catch {
    fuel = false;
  }

  const wins = getPillarWins(100);
  const move = wins.some((w) => w.pillar === 'move');
  let mind = wins.some((w) => w.pillar === 'mind');
  try {
    const checkins = JSON.parse(readRaw('mw_mind_checkins') || '[]') as unknown[];
    if (checkins.length > 0) mind = true;
  } catch {
    // ignore
  }

  let learn = false;
  try {
    const completed = JSON.parse(readRaw('mw_learn_completed') || '[]') as unknown[];
    const guideDone = JSON.parse(readRaw('mw_guidebook_progress') || '[]') as unknown[];
    learn = completed.length > 0 || guideDone.length > 0;
  } catch {
    learn = false;
  }

  return { workout, fuel, move, mind, learn };
}



function detectReadinessMilestones(workoutHistory: CompletedWorkoutLog[]): JourneyReadinessMilestones {
  let parq = false;
  try {
    parq = !!readRaw('mw_last_assessment');
  } catch {
    parq = false;
  }

  const streak = getTrainingStreak(workoutHistory);
  const recent14 = workoutHistory.filter(
    (w) => Date.now() - new Date(w.completedAt).getTime() <= 14 * 86400000
  ).length;
  const streakMet = streak >= 7 || recent14 >= 5;

  return { parq, streakMet, winScoreSeen: true };
}

function allReadinessDone(r: JourneyReadinessMilestones): boolean {
  return r.parq && r.streakMet && r.winScoreSeen;
}

/** Recompute phase from live app data and persist. */
export function syncJourneyPhase(workoutHistory: CompletedWorkoutLog[] = []): JourneyState {
  const s = loadJourneyState();

  if (!isIDayComplete(s)) {
    s.phase = 'i-day';
    saveJourneyState(s);
    return s;
  }

  /*
   * Both milestone snapshots are recomputed before any phase decision.
   *
   * `.243` — `s.readiness` used to be computed *after* the `allBasicDone` early
   * return, so for anyone still in Basic it was never refreshed. Completing the
   * PAR-Q writes `mw_last_assessment` and nothing else touches journey state, so
   * `readiness.parq` stayed false until a workout was logged — and the First
   * Steps checklist reads that flag for its sixth step. The card exists mostly
   * for the Basic-phase athlete on the lean shell, and it was showing exactly
   * that athlete an unticked box for something they had just finished.
   *
   * Detection is pure reads; only the *snapshot* moves. The phase ladder below
   * is unchanged — `allBasicDone` still gates `basic`, and a Basic athlete with
   * `parq` true still stays in `basic`.
   */
  s.basic = detectBasicMilestones(workoutHistory);
  s.readiness = detectReadinessMilestones(workoutHistory);

  if (!allBasicDone(s.basic)) {
    s.phase = 'basic';
    saveJourneyState(s);
    return s;
  }

  if (!allReadinessDone(s.readiness)) {
    s.phase = 'readiness';
    saveJourneyState(s);
    return s;
  }

  if (!s.commissionedAt) {
    s.commissionedAt = new Date().toISOString();
    writeRaw(STORAGE_KEYS.commissionedAt, s.commissionedAt);
  }
  s.phase = 'commissioned';
  saveJourneyState(s);
  return s;
}

const BASIC_STEPS: { key: keyof JourneyBasicMilestones; label: string; description: string; href: string }[] = [
  {
    key: 'workout',
    label: 'Start your first workout',
    description: 'Gear-matched session — log one set to open the path.',
    href: '/active',
  },
];

function firstWorkoutTemplate(): NonNullable<JourneyAction['startWorkout']> {
  const fallback = {
    name: 'First Mission Workout',
    exercises: [
      { exerciseId: 'air-squat', sets: [{ reps: 10, weight: 0 }, { reps: 10, weight: 0 }] },
      { exerciseId: 'push-ups', sets: [{ reps: 8, weight: 0 }, { reps: 8, weight: 0 }] },
      { exerciseId: 'glute-bridge', sets: [{ reps: 12, weight: 0 }] },
      { exerciseId: 'plank', sets: [{ reps: 30, weight: 0 }] },
    ],
  };
  if (typeof window === 'undefined') return fallback;
  try {
    const equipment = readRaw(STORAGE_KEYS.equipment) || 'bodyweight';
    const session = previewJustGoForEquipment(equipment);
    if (session.exercises.length === 0) return fallback;
    return { name: session.name, exercises: session.exercises };
  } catch {
    return fallback;
  }
}

/** Static BW fallback (tests / SSR). Prefer `firstWorkoutTemplate()` at call sites. */
const FIRST_WORKOUT = {
  name: 'First Mission Workout',
  exercises: [
    { exerciseId: 'air-squat', sets: [{ reps: 10, weight: 0 }, { reps: 10, weight: 0 }] },
    { exerciseId: 'push-ups', sets: [{ reps: 8, weight: 0 }, { reps: 8, weight: 0 }] },
    { exerciseId: 'glute-bridge', sets: [{ reps: 12, weight: 0 }] },
    { exerciseId: 'plank', sets: [{ reps: 30, weight: 0 }] },
  ],
};

export function getNextAction(workoutHistory: CompletedWorkoutLog[] = []): JourneyAction {
  const state = syncJourneyPhase(workoutHistory);

  if (!isIDayComplete(state)) {
    return {
      label: 'Begin I-Day',
      description: 'Where the journey begins — in-processing takes about 2 minutes.',
      href: '/welcome',
      phase: 'i-day',
      stepLabel: 'I-Day · Where you start',
      progressPct: 0,
    };
  }

  if (state.phase === 'basic') {
    const done = BASIC_STEPS.filter((s) => state.basic[s.key]).length;
    const next = BASIC_STEPS.find((s) => !state.basic[s.key]);
    if (!next) {
      /*
       * K6 — basic steps complete; sync should already be readiness.
       * Old soft-Coach boss here fought Flow-6 / Victory (train first).
       * Fall through to the same readiness primary as the readiness phase.
       */
      const readinessPrimary = pickReadinessPrimaryAction({
        readiness: state.readiness,
        completedSessions: workoutHistory.length,
        startWorkout: firstWorkoutTemplate(),
      });
      if (readinessPrimary) return readinessPrimary;
      return {
        label: 'Keep training',
        description: 'Log the next session — Coach builds from history.',
        href: '/active',
        phase: 'basic',
        stepLabel: 'Basic Training · Train',
        progressPct: 100,
        startWorkout: firstWorkoutTemplate(),
      };
    }
    const total = BASIC_STEPS.length;
    const action: JourneyAction = {
      label: next.label,
      description: next.description,
      href: next.href,
      phase: 'basic',
      stepLabel: `Basic Training · Step ${done + 1} of ${total}`,
      progressPct: Math.round((done / total) * 100),
    };
    if (next.key === 'workout') {
      action.startWorkout = firstWorkoutTemplate();
    }
    return action;
  }

  if (state.phase === 'readiness') {
    /*
     * Flow-6 — habit critical path wins while commitment is open.
     *
     * After the first log, sync leaves `basic` for `readiness`. The old ladder
     * put PAR-Q then guidebook on JourneyHero before train — Victory and First
     * Steps already boss session 2 at `/active`. Two dies, two clocks.
     *
     * PAR-Q stays required to *commission* (detectReadinessMilestones). It is
     * not the free-logger boss. Guidebook lives in First Steps / Learn / More,
     * never as Today primary while `!streakMet`.
     */
    const readinessPrimary = pickReadinessPrimaryAction({
      readiness: state.readiness,
      completedSessions: workoutHistory.length,
      startWorkout: firstWorkoutTemplate(),
    });
    if (readinessPrimary) return readinessPrimary;
  }

  if (state.phase === 'commissioned') {
    return {
      label: 'Start today\'s workout',
      description: 'You\'re commissioned — one clear action every day.',
      href: '/active',
      phase: 'commissioned',
      stepLabel: `Mission Operator · Day ${daysSinceCommission(state.commissionedAt)}`,
      progressPct: 100,
    };
  }

  return {
    label: 'Go to Today',
    description: 'Your command center.',
    href: '/log',
    phase: state.phase,
    stepLabel: 'Today',
    progressPct: 50,
  };
}

function daysSinceCommission(iso?: string): number {
  if (!iso) return 1;
  return Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000));
}

/**
 * Pure readiness boss pin for Today (Flow-6).
 *
 * While streak/commitment is open → train (session-2 copy at exactly one log).
 * After commitment, if PAR-Q still open → health screen (commissioning path).
 * Never returns `/learn/guide` as primary.
 */
export function pickReadinessPrimaryAction(opts: {
  readiness: JourneyReadinessMilestones;
  completedSessions: number;
  startWorkout: NonNullable<JourneyAction['startWorkout']>;
}): JourneyAction | null {
  const { readiness, completedSessions, startWorkout } = opts;

  if (!readiness.streakMet) {
    const week1 = week1SecondSessionCue({ completedSessions });
    if (week1) {
      return {
        label: week1.defaultLabel,
        description: week1.defaultReason,
        href: week1.href,
        phase: 'readiness',
        stepLabel: 'Readiness · Session 2',
        progressPct: 40,
        startWorkout,
      };
    }
    return {
      label: 'Keep your training streak',
      description: '7-day streak or 5 workouts in 14 days — build the habit.',
      href: '/active',
      phase: 'readiness',
      stepLabel: 'Readiness · Commitment',
      progressPct: 66,
      startWorkout,
    };
  }

  if (!readiness.parq) {
    return {
      label: 'Complete health screen',
      description: 'PAR-Q assessment — required before full training load.',
      href: '/assessments',
      phase: 'readiness',
      stepLabel: 'Readiness · Health screen',
      progressPct: 80,
    };
  }

  return null;
}

export function getPhaseLabel(phase: JourneyPhase): string {
  switch (phase) {
    case 'i-day':
      return 'I-Day';
    case 'basic':
      return 'Basic Training';
    case 'readiness':
      return 'Readiness';
    case 'commissioned':
      return 'Commissioned';
  }
}

export { FIRST_WORKOUT, daysSinceCommission };
