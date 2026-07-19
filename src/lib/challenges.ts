import type { CompletedWorkoutLog } from '@/types';
import { getPillarWins, type PillarType } from '@/lib/pillarLog';
import { loadGuidebookProgress } from '@/lib/guidebookProgress';
import { STREAK_KEY, getTrainingStreak } from '@/lib/streaks';

export { STREAK_KEY, getTrainingStreak };

export type ChallengeId =
  | 'train-7'
  | 'protein-5'
  | 'volume-10k'
  | 'move-4'
  | 'mind-4'
  | 'learn-4'
  | 'guide-3'
  | 'track-5';

export interface ChallengeDef {
  id: ChallengeId;
  title: string;
  description: string;
  target: number;
  unit: string;
}

export const CHALLENGES: ChallengeDef[] = [
  {
    id: 'train-7',
    title: '7-Day Train Streak',
    description: 'Log a workout on 7 separate days this week.',
    target: 7,
    unit: 'days',
  },
  {
    id: 'protein-5',
    title: '5 High-Protein Days',
    description: 'Hit 120g+ protein on 5 days (Fuel pillar).',
    target: 5,
    unit: 'days',
  },
  {
    id: 'volume-10k',
    title: '10K Volume Week',
    description: 'Accumulate 10,000 kg·reps (or lb·reps) this week.',
    target: 10000,
    unit: 'volume',
  },
  {
    id: 'move-4',
    title: '4 Move Wins',
    description: 'Complete 4 mobility flows or Move pillar wins this week.',
    target: 4,
    unit: 'wins',
  },
  {
    id: 'mind-4',
    title: '4 Mind Sessions',
    description: 'Log 4 Mind pillar wins (breathing, guided, or check-in) this week.',
    target: 4,
    unit: 'wins',
  },
  {
    id: 'learn-4',
    title: '4 Learn Wins',
    description: 'Complete 4 Learn lessons or guidebook sections this week.',
    target: 4,
    unit: 'wins',
  },
  {
    id: 'guide-3',
    title: '3 Guidebook Sections',
    description: 'Read and mark 3 guidebook sections (cumulative).',
    target: 3,
    unit: 'sections',
  },
  {
    id: 'track-5',
    title: '5 Track Activities',
    description: 'Log 5 activities on the Track pillar this week.',
    target: 5,
    unit: 'activities',
  },
];

const STORAGE_KEY = 'mw_challenges';
const LAST_WORKOUT_KEY = 'mw_last_workout_date';
const PROTEIN_THRESHOLD = 120;

interface ChallengeState {
  weekStart: string; // ISO date (Monday)
  trainDays: string[]; // YYYY-MM-DD
  proteinDays: string[];
  weekVolume: number;
}

function getWeekStart(d = new Date()): string {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date.toISOString().split('T')[0];
}

function loadState(): ChallengeState {
  if (typeof window === 'undefined') {
    return { weekStart: getWeekStart(), trainDays: [], proteinDays: [], weekVolume: 0 };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const weekStart = getWeekStart();
    if (!raw) return { weekStart, trainDays: [], proteinDays: [], weekVolume: 0 };
    const parsed = JSON.parse(raw) as ChallengeState;
    if (parsed.weekStart !== weekStart) {
      return { weekStart, trainDays: [], proteinDays: [], weekVolume: 0 };
    }
    return parsed;
  } catch {
    return { weekStart: getWeekStart(), trainDays: [], proteinDays: [], weekVolume: 0 };
  }
}

function saveState(state: ChallengeState) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/** Call when a workout is completed. Updates streak + weekly train/volume challenges. */
export function recordWorkoutCompleted(log: CompletedWorkoutLog) {
  if (typeof window === 'undefined') return;

  const today = new Date(log.completedAt).toISOString().split('T')[0];
  const lastDate = localStorage.getItem(LAST_WORKOUT_KEY);
  let streak = parseInt(localStorage.getItem(STREAK_KEY) || '0', 10);

  if (lastDate !== today) {
    if (lastDate) {
      const last = new Date(lastDate);
      const curr = new Date(today);
      const diffDays = Math.floor((curr.getTime() - last.getTime()) / (1000 * 3600 * 24));
      streak = diffDays === 1 ? streak + 1 : 1;
    } else {
      streak = 1;
    }
    localStorage.setItem(LAST_WORKOUT_KEY, today);
    localStorage.setItem(STREAK_KEY, String(streak));
  }

  const state = loadState();
  if (!state.trainDays.includes(today)) {
    state.trainDays.push(today);
  }
  state.weekVolume += log.totalVolume;
  saveState(state);
}

/** Recompute protein-day challenge from nutrition log entries in localStorage. */
export function syncProteinChallengeFromNutrition() {
  if (typeof window === 'undefined') return;
  try {
    const logged = JSON.parse(localStorage.getItem('mw_nutrition_log') || '[]') as {
      protein?: number;
      date?: string;
    }[];
    const today = new Date().toISOString().split('T')[0];
    const byDate: Record<string, number> = {};
    logged.forEach((entry) => {
      const d = entry.date || today;
      byDate[d] = (byDate[d] || 0) + (entry.protein || 0);
    });

    const state = loadState();
    state.proteinDays = Object.entries(byDate)
      .filter(([, p]) => p >= PROTEIN_THRESHOLD)
      .map(([d]) => d)
      .filter((d) => d >= state.weekStart);
    saveState(state);
  } catch {
    // ignore
  }
}

export function getChallengeProgress(): Array<ChallengeDef & { current: number; percent: number }> {
  syncProteinChallengeFromNutrition();
  const state = loadState();
  const weekStart = state.weekStart;

  const pillarWinsThisWeek = (pillar: PillarType) =>
    getPillarWins(100).filter((w) => {
      const d = w.completedAt.split('T')[0];
      return w.pillar === pillar && d >= weekStart;
    }).length;

  const learnWinsThisWeek = () => {
    let n = pillarWinsThisWeek('learn');
    try {
      const completed = JSON.parse(localStorage.getItem('mw_learn_completed') || '[]') as string[];
      n = Math.max(n, Math.min(completed.length, 4));
    } catch {
      // ignore
    }
    return n;
  };

  const guideSectionsDone = () => loadGuidebookProgress().size;

  return CHALLENGES.map((c) => {
    let current = 0;
    if (c.id === 'train-7') current = state.trainDays.length;
    if (c.id === 'protein-5') current = state.proteinDays.length;
    if (c.id === 'volume-10k') current = Math.round(state.weekVolume);
    if (c.id === 'move-4') current = pillarWinsThisWeek('move');
    if (c.id === 'mind-4') current = pillarWinsThisWeek('mind');
    if (c.id === 'learn-4') current = learnWinsThisWeek();
    if (c.id === 'guide-3') current = guideSectionsDone();
    if (c.id === 'track-5') current = pillarWinsThisWeek('track');
    const percent = Math.min(100, Math.round((current / c.target) * 100));
    return { ...c, current, percent };
  });
}
