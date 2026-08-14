import type { LeaderboardBoard } from './types';
import { isAmericaTrackEnabled } from '@/lib/americaConfig';
import { readRaw, writeRaw } from '@/lib/storage/safeStorage';

export const LEADERBOARD_BOARDS: LeaderboardBoard[] = [
  {
    id: 'mission-score',
    title: 'Mission Score',
    subtitle: 'Cross-pillar Mission Score — Train, Fuel, Move, Mind, Track, Learn.',
    unit: 'pts',
  },
  {
    id: 'training-streak',
    title: 'Training Streak',
    subtitle: 'Consecutive days with at least one logged workout.',
    unit: 'days',
  },
  {
    id: 'weekly-volume',
    title: 'Weekly Volume',
    subtitle: 'Total training volume this week (all sessions).',
    unit: 'vol',
  },
  {
    id: 'fuel-days',
    title: 'Fuel Days',
    subtitle: 'Days this week with 120g+ protein logged in Fuel.',
    unit: 'days',
  },
  {
    id: 'presidential-fitness',
    title: 'Presidential Fitness',
    subtitle: 'Best fitness test award tier — Presidential, National, Participant.',
    unit: 'pts',
    flavor:
      'Inspired by the classic Presidential Fitness Test. Log your test at /fitness-test to rank on this board.',
  },
  {
    id: 'under-the-stars',
    title: 'Under the Stars',
    subtitle: 'Sessions logged between 22:00 and 05:00 local — night discipline.',
    unit: 'ops',
    theme: 'night',
    flavor:
      'Operators who train when the world sleeps. Civilian fitness app — inspired by round-the-clock readiness, not affiliated with any military service.',
  },
  {
    id: 'dawns-early-light',
    title: "By Dawn's Early Light",
    subtitle: 'Sessions logged between 05:00 and 08:00 local — first light of the day.',
    unit: 'ops',
    theme: 'dawn',
    flavor:
      'Early risers who win the morning before the day wins them. One clear action at first light.',
  },
];

export const LEADERBOARD_SCOPES: {
  id: import('./types').LeaderboardScope;
  label: string;
  description: string;
}[] = [
  { id: 'global', label: 'Global', description: 'All Mission Operators worldwide' },
  { id: 'regional', label: 'Regional', description: 'Your continent / macro region' },
  { id: 'national', label: 'National', description: 'Your country cohort' },
  { id: 'local', label: 'Local', description: 'Operators in your area (locale cohort)' },
  { id: 'friends', label: 'Squad', description: 'Operators sharing your squad code' },
  { id: 'class', label: 'Class', description: 'PE class standings from signed-in fitness tests' },
];

export function boardById(id: import('./types').LeaderboardBoardId): LeaderboardBoard {
  return LEADERBOARD_BOARDS.find((b) => b.id === id) ?? LEADERBOARD_BOARDS[0];
}

/** Boards visible in this build — PFT board rides with the America track flag. */
export function visibleLeaderboardBoards(): LeaderboardBoard[] {
  if (isAmericaTrackEnabled()) return LEADERBOARD_BOARDS;
  return LEADERBOARD_BOARDS.filter((b) => b.id !== 'presidential-fitness');
}

/** Scopes visible in this build — the PE class scope rides with the America track flag. */
export function visibleLeaderboardScopes(): typeof LEADERBOARD_SCOPES {
  if (isAmericaTrackEnabled()) return LEADERBOARD_SCOPES;
  return LEADERBOARD_SCOPES.filter((s) => s.id !== 'class');
}

export const SQUAD_CODE_KEY = 'mw_squad_code';

export function loadSquadCode(): string {
  return readRaw(SQUAD_CODE_KEY)?.trim().toUpperCase().slice(0, 8) || '';
}

export function saveSquadCode(code: string): void {
  writeRaw(SQUAD_CODE_KEY, code.trim().toUpperCase().slice(0, 8));
}
