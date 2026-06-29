import { gatherWeeklyPillarStats } from '@/lib/pillarScoreInputs';
import { getTrainingStreak } from '@/lib/challenges';
import { computeWinScore } from '@/lib/score';
import type { CompletedWorkoutLog } from '@/types';
import type { LeaderboardBoardId, LeaderboardSnapshot } from './types';
import { resolveGeoFromLocale } from './regions';

const OPERATOR_NAME_KEY = 'mw_operator_name';

export function loadOperatorName(): string {
  if (typeof window === 'undefined') return 'Mission Operator';
  return localStorage.getItem(OPERATOR_NAME_KEY)?.trim() || 'Mission Operator';
}

export function saveOperatorName(name: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(OPERATOR_NAME_KEY, name.trim().slice(0, 24));
}

function countNightSessions(workoutHistory: CompletedWorkoutLog[]): number {
  return workoutHistory.filter((w) => {
    const h = new Date(w.completedAt).getHours();
    return h >= 22 || h < 5;
  }).length;
}

function highProteinDaysThisWeek(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const logs = JSON.parse(localStorage.getItem('mw_nutrition_log') || '[]') as {
      date?: string;
      protein?: number;
    }[];
    const start = new Date();
    const day = start.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    start.setDate(start.getDate() + diff);
    const weekStart = start.toISOString().split('T')[0];
    const days = new Set<string>();
    for (const l of logs) {
      if ((l.protein ?? 0) >= 120 && l.date && l.date >= weekStart) days.add(l.date);
    }
    return days.size;
  } catch {
    return 0;
  }
}

/** Build current user's leaderboard snapshot from live app data. */
export function computeLocalLeaderboardSnapshot(
  workoutHistory: CompletedWorkoutLog[],
  savedCount: number,
  userId?: string
): LeaderboardSnapshot {
  const locale =
    typeof window !== 'undefined' ? localStorage.getItem('i18nextLng')?.split('-')[0] || 'en' : 'en';
  const geo = resolveGeoFromLocale(locale);
  const weekly = gatherWeeklyPillarStats();
  const streak = getTrainingStreak(workoutHistory);
  const totalSessions = workoutHistory.length;
  const totalVolume = workoutHistory.reduce((s, w) => s + w.totalVolume, 0);

  const winScore = computeWinScore({
    streak,
    highProteinDays: highProteinDaysThisWeek(),
    totalSessions,
    totalVolume,
    savedCount,
    moveFlows: weekly.moveFlows,
    mindSessions: weekly.mindSessions,
    trackActivities: weekly.trackActivities,
    learnLessons: weekly.learnLessons,
    trainDaysThisWeek: weekly.trainDays,
  });

  return {
    userId,
    operatorName: loadOperatorName(),
    missionScore: winScore.total,
    trainingStreak: streak,
    weeklyVolume: weekly.weekVolume,
    nightSessions: countNightSessions(workoutHistory),
    region: geo.region,
    countryCode: geo.countryCode,
    countryName: geo.countryName,
    locale: geo.locale,
  };
}

export function scoreForBoard(snapshot: LeaderboardSnapshot, boardId: LeaderboardBoardId): number {
  switch (boardId) {
    case 'mission-score':
      return snapshot.missionScore;
    case 'training-streak':
      return snapshot.trainingStreak;
    case 'weekly-volume':
      return snapshot.weeklyVolume;
    case 'under-the-stars':
      return snapshot.nightSessions;
  }
}

export function detailForBoard(snapshot: LeaderboardSnapshot, boardId: LeaderboardBoardId): string {
  switch (boardId) {
    case 'mission-score':
      return `${snapshot.trainingStreak}d streak`;
    case 'training-streak':
      return `${snapshot.missionScore} mission pts`;
    case 'weekly-volume':
      return `${snapshot.missionScore} mission pts`;
    case 'under-the-stars':
      return snapshot.nightSessions === 1 ? '1 night op' : `${snapshot.nightSessions} night ops`;
  }
}
