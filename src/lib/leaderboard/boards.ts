import type { LeaderboardBoard } from './types';

export const LEADERBOARD_BOARDS: LeaderboardBoard[] = [
  {
    id: 'mission-score',
    title: 'Mission Score',
    subtitle: 'Cross-pillar Win Score — Train, Fuel, Move, Mind, Track, Learn.',
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
];

export function boardById(id: import('./types').LeaderboardBoardId): LeaderboardBoard {
  return LEADERBOARD_BOARDS.find((b) => b.id === id) ?? LEADERBOARD_BOARDS[0];
}

export const SQUAD_CODE_KEY = 'mw_squad_code';

export function loadSquadCode(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(SQUAD_CODE_KEY)?.trim().toUpperCase().slice(0, 8) || '';
}

export function saveSquadCode(code: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SQUAD_CODE_KEY, code.trim().toUpperCase().slice(0, 8));
}
