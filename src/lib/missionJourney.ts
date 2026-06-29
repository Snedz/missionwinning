import { getTrainingStreak } from '@/lib/challenges';
import { getPillarWins } from '@/lib/pillarLog';
import type { CompletedWorkoutLog } from '@/types';

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

function hasLegacyOnboarding(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(localStorage.getItem('mw_experience') && localStorage.getItem('mw_equipment'));
}

export function loadJourneyState(): JourneyState {
  if (typeof window === 'undefined') return { ...DEFAULT_STATE };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
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
      iDay: { completedAt: localStorage.getItem('mw_journey_started') ?? new Date().toISOString() },
    };
    saveJourneyState(migrated);
    return migrated;
  }

  return { ...DEFAULT_STATE };
}

export function saveJourneyState(state: JourneyState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function isIDayComplete(state?: JourneyState): boolean {
  const s = state ?? loadJourneyState();
  return !!s.iDay.completedAt || hasLegacyOnboarding();
}

export function markIDayStarted(): void {
  const s = loadJourneyState();
  if (!s.iDay.startedAt) {
    s.iDay.startedAt = new Date().toISOString();
    localStorage.setItem('mw_journey_started', s.iDay.startedAt);
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
  localStorage.setItem('mw_experience', profile.experience);
  localStorage.setItem('mw_equipment', profile.equipment);
  localStorage.setItem('mw_primary_goal', profile.primaryGoal);
  localStorage.setItem('mw_goals', profile.primaryGoal);

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
      const hist = JSON.parse(localStorage.getItem('workout-tracker-storage') || '{}');
      workout = (hist?.state?.workoutHistory?.length ?? 0) > 0;
    } catch {
      workout = false;
    }
  }

  let fuel = false;
  try {
    const logs = JSON.parse(localStorage.getItem('mw_nutrition_log') || '[]') as { protein?: number }[];
    fuel = logs.some((l) => (l.protein ?? 0) > 0);
  } catch {
    fuel = false;
  }

  const wins = getPillarWins(100);
  const move = wins.some((w) => w.pillar === 'move');
  let mind = wins.some((w) => w.pillar === 'mind');
  try {
    const checkins = JSON.parse(localStorage.getItem('mw_mind_checkins') || '[]') as unknown[];
    if (checkins.length > 0) mind = true;
  } catch {
    // ignore
  }

  let learn = false;
  try {
    const completed = JSON.parse(localStorage.getItem('mw_learn_completed') || '[]') as unknown[];
    learn = completed.length > 0;
  } catch {
    learn = false;
  }

  return { workout, fuel, move, mind, learn };
}

function detectReadinessMilestones(workoutHistory: CompletedWorkoutLog[]): JourneyReadinessMilestones {
  let parq = false;
  try {
    parq = !!localStorage.getItem('mw_last_assessment');
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

function allBasicDone(b: JourneyBasicMilestones): boolean {
  return b.workout && b.fuel && b.move && b.mind && b.learn;
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

  s.basic = detectBasicMilestones(workoutHistory);

  if (!allBasicDone(s.basic)) {
    s.phase = 'basic';
    saveJourneyState(s);
    return s;
  }

  s.readiness = detectReadinessMilestones(workoutHistory);

  if (!allReadinessDone(s.readiness)) {
    s.phase = 'readiness';
    saveJourneyState(s);
    return s;
  }

  if (!s.commissionedAt) {
    s.commissionedAt = new Date().toISOString();
    localStorage.setItem('mw_commissioned_at', s.commissionedAt);
  }
  s.phase = 'commissioned';
  saveJourneyState(s);
  return s;
}

const BASIC_STEPS: { key: keyof JourneyBasicMilestones; label: string; description: string; href: string }[] = [
  {
    key: 'workout',
    label: 'Start your first workout',
    description: '10-minute bodyweight mission — no equipment required.',
    href: '/active',
  },
  {
    key: 'fuel',
    label: 'Log your first meal',
    description: 'One protein entry in Fuel counts.',
    href: '/nutrition',
  },
  {
    key: 'move',
    label: 'Complete a Move flow',
    description: '4-minute mobility — opens hips and shoulders.',
    href: '/move',
  },
  {
    key: 'mind',
    label: 'Try one breathing cycle',
    description: 'One minute of box breathing in Mind.',
    href: '/mind',
  },
  {
    key: 'learn',
    label: 'Finish one Learn lesson',
    description: 'Mark any lesson done — takes about 2 minutes.',
    href: '/learn',
  },
];

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
    const next = BASIC_STEPS.find((s) => !state.basic[s.key])!;
    const action: JourneyAction = {
      label: next.label,
      description: next.description,
      href: next.href,
      phase: 'basic',
      stepLabel: `Basic Training · Step ${done + 1} of 5`,
      progressPct: Math.round((done / 5) * 100),
    };
    if (next.key === 'workout') {
      action.startWorkout = FIRST_WORKOUT;
    }
    return action;
  }

  if (state.phase === 'readiness') {
    if (!state.readiness.parq) {
      return {
        label: 'Complete health screen',
        description: 'PAR-Q assessment — required before full training load.',
        href: '/assessments',
        phase: 'readiness',
        stepLabel: 'Readiness · Health screen',
        progressPct: 33,
      };
    }
    if (!state.readiness.streakMet) {
      return {
        label: 'Keep your training streak',
        description: '7-day streak or 5 workouts in 14 days — build the habit.',
        href: '/active',
        phase: 'readiness',
        stepLabel: 'Readiness · Commitment',
        progressPct: 66,
        startWorkout: FIRST_WORKOUT,
      };
    }
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
