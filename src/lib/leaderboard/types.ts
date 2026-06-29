/** Gran Turismo 7–style leaderboard scopes. */
export type LeaderboardScope = 'global' | 'regional' | 'national' | 'local' | 'friends';

export type LeaderboardBoardId =
  | 'mission-score'
  | 'training-streak'
  | 'weekly-volume'
  | 'fuel-days';

export interface LeaderboardBoard {
  id: LeaderboardBoardId;
  title: string;
  subtitle: string;
  unit: string;
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
