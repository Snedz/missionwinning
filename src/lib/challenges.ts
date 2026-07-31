import type { CompletedWorkoutLog } from '@/types';
import { getPillarWins, type PillarType } from '@/lib/pillarLog';
import { loadGuidebookProgress } from '@/lib/guidebookProgress';
import { STREAK_KEY, getTrainingStreak } from '@/lib/streaks';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readJson, readRaw, writeJson, writeRaw } from '@/lib/storage/safeStorage';
import { localDateKey, localDateKeyFromIso, localWeekKey } from '@/lib/time/localDate';

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

const STORAGE_KEY = STORAGE_KEYS.challenges;
const LAST_WORKOUT_KEY = STORAGE_KEYS.lastWorkoutDate;
const PROTEIN_THRESHOLD = 120;

interface ChallengeState {
  weekStart: string; // ISO date (Monday)
  trainDays: string[]; // YYYY-MM-DD
  proteinDays: string[];
  weekVolume: number;
}

/** Local Monday key — see `time/localDate.ts` for why this is not `toISOString()`. */
function getWeekStart(d = new Date()): string {
  return localWeekKey(d);
}

function loadState(): ChallengeState {
  const weekStart = getWeekStart();
  const empty: ChallengeState = { weekStart, trainDays: [], proteinDays: [], weekVolume: 0 };
  const parsed = readJson<ChallengeState | null>(STORAGE_KEY, null);
  // A stored week that is not this week resets rather than carrying totals forward.
  if (!parsed || parsed.weekStart !== weekStart) return empty;
  return parsed;
}

function saveState(state: ChallengeState) {
  writeJson(STORAGE_KEY, state);
}

/** Call when a workout is completed. Updates streak + weekly train/volume challenges. */
export function recordWorkoutCompleted(log: CompletedWorkoutLog) {
  if (typeof window === 'undefined') return;

  const today = localDateKeyFromIso(log.completedAt);

  /*
   * `.220` — this used to be the repo's **third** derivation of "consecutive
   * days": a read-increment-write of `mw_streak` with its own
   * `new Date(a) - new Date(b)` millisecond arithmetic, which is the spelling
   * `.199` and `.212` were both about and `.217` replaced everywhere else.
   *
   * It is gone rather than corrected. Post-`.217` the workout **history** is the
   * authority for the training streak — `getTrainingStreak` derives it, and this
   * write never carried the date the override now requires, so the value it
   * produced was already unreadable. Keeping a dateless writer alive is worse
   * than useless: it is a loaded gun for anyone who later "restores" the
   * override branch and silently reintroduces the streak that never breaks.
   *
   * `mw_last_workout_date` is still written — it is the only thing that reads it.
   */
  if (readRaw(LAST_WORKOUT_KEY) !== today) {
    writeRaw(LAST_WORKOUT_KEY, today);
  }

  const state = loadState();
  if (!state.trainDays.includes(today)) {
    state.trainDays.push(today);
  }
  state.weekVolume += log.totalVolume;
  saveState(state);
}

/** Recompute protein-day challenge from stored nutrition log entries. */
export function syncProteinChallengeFromNutrition() {
  const logged = readJson<{ protein?: number; date?: string }[]>(STORAGE_KEYS.nutritionLog, []);
  if (!Array.isArray(logged)) return;
  const today = localDateKey();
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
}

export function getChallengeProgress(): Array<ChallengeDef & { current: number; percent: number }> {
  syncProteinChallengeFromNutrition();
  const state = loadState();
  const weekStart = state.weekStart;

  const pillarWinsThisWeek = (pillar: PillarType) =>
    getPillarWins(100).filter((w) => {
      // `.225` — UTC date vs a local `weekStart`: a Monday-morning win east
      // of UTC dated to Sunday and fell outside the week it belonged to.
      const d = localDateKeyFromIso(w.completedAt);
      return w.pillar === pillar && d >= weekStart;
    }).length;

  const learnWinsThisWeek = () => {
    const n = pillarWinsThisWeek('learn');
    const completed = readJson<string[]>(STORAGE_KEYS.learnCompleted, []);
    return Math.max(n, Math.min(completed.length, 4));
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
