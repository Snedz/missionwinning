/** Gran Turismo 7–style leaderboard scopes. */
export type LeaderboardScope = 'global' | 'regional' | 'national' | 'local' | 'friends';

export type LeaderboardBoardId =
  | 'mission-score'
  | 'training-streak'
  | 'weekly-volume'
  | 'fuel-days'
  | 'under-the-stars'
  | 'dawns-early-light';

export type LeaderboardBoardTheme = 'default' | 'night' | 'dawn';

export interface LeaderboardBoard {
  id: LeaderboardBoardId;
  title: string;
  subtitle: string;
  unit: string;
  theme?: LeaderboardBoardTheme;
  flavor?: string;
}

export interface LeaderboardEntry {
  id: string;
  rank?: number;
  operatorName: string;
  score: number;
  region: string;
  countryCode: string;
  countryName: string;
  locale: string;
  squadCode?: string;
  isYou?: boolean;
  delta?: number;
  detail?: string;
  userId?: string;
}

export interface LeaderboardSnapshot {
  userId?: string;
  operatorName: string;
  missionScore: number;
  trainingStreak: number;
  weeklyVolume: number;
  fuelDays: number;
  nightSessions: number;
  dawnSessions: number;
  squadCode?: string;
  region: string;
  countryCode: string;
  countryName: string;
  locale: string;
}

export interface RankedLeaderboard {
  board: LeaderboardBoard;
  scope: LeaderboardScope;
  scopeLabel: string;
  entries: LeaderboardEntry[];
  yourRank: number | null;
  totalPlayers: number;
  updatedAt: string;
}

/** Count workouts in a local hour window [startHour, endHour). */
export function countSessionsInHourRange(
  workoutHistory: import('@/types').CompletedWorkoutLog[],
  startHour: number,
  endHour: number
): number {
  return workoutHistory.filter((w) => {
    const h = new Date(w.completedAt).getHours();
    if (startHour <= endHour) return h >= startHour && h < endHour;
    // wraps midnight e.g. 22–5 → 22,23,0,1,2,3,4
    return h >= startHour || h < endHour;
  }).length;
}
