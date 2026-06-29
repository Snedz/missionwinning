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
    id: 'under-the-stars',
    title: 'Under the Stars',
    subtitle: 'Night discipline — sessions logged between 22:00 and 05:00 local.',
    unit: 'ops',
    flavor:
      'Operators who train when the world sleeps. Inspired by night-flight readiness — civilian fitness, not affiliated with DoD.',
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
  { id: 'friends', label: 'Friends', description: 'Your squad — coming soon' },
];

export function boardById(id: import('./types').LeaderboardBoardId): LeaderboardBoard {
  return LEADERBOARD_BOARDS.find((b) => b.id === id) ?? LEADERBOARD_BOARDS[0];
}
