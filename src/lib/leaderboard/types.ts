/** Gran Turismo 7–style leaderboard scopes. */
export type LeaderboardScope = 'global' | 'regional' | 'national' | 'local' | 'friends';

export type LeaderboardBoardId =
  | 'mission-score'
  | 'training-streak'
  | 'weekly-volume'
  | 'under-the-stars';

export interface LeaderboardBoard {
  id: LeaderboardBoardId;
  title: string;
  subtitle: string;
  unit: string;
  /** Optional hero caption (event flavor text). */
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
  isYou?: boolean;
  /** Rank change vs last snapshot (positive = improved). */
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
  nightSessions: number;
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
