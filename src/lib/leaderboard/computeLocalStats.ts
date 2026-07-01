import { gatherWeeklyPillarStats } from '@/lib/pillarScoreInputs';
import { getTrainingStreak } from '@/lib/challenges';
import { computeWinScore } from '@/lib/score';
import { tierToScore } from '@/lib/presidentialFitnessTest';
import type { CompletedWorkoutLog } from '@/types';
import type { LeaderboardBoardId, LeaderboardSnapshot } from './types';
import { countSessionsInHourRange } from './types';
import { loadSquadCode, SQUAD_CODE_KEY } from './boards';
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

export { loadSquadCode, saveSquadCode } from './boards';

function loadLocalPftScore(): { score: number; tier?: string } {
  if (typeof window === 'undefined') return { score: 0 };
  const tier = localStorage.getItem('mw_pft_last_tier') ?? undefined;
  if (!tier) return { score: 0 };
  return { score: tierToScore(tier), tier };
}

function highProteinDaysThisWeek(): number {
  return gatherWeeklyPillarStats().proteinDays;
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
  const fuelDays = highProteinDaysThisWeek();
  const nightSessions = countSessionsInHourRange(workoutHistory, 22, 5);
  const dawnSessions = countSessionsInHourRange(workoutHistory, 5, 8);
  const pft = loadLocalPftScore();

  const winScore = computeWinScore({
    streak,
    highProteinDays: fuelDays,
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
    fuelDays,
    nightSessions,
    dawnSessions,
    pftScore: pft.score,
    pftTier: pft.tier,
    squadCode: loadSquadCode() || undefined,
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
    case 'fuel-days':
      return snapshot.fuelDays;
    case 'presidential-fitness':
      return snapshot.pftScore;
    case 'under-the-stars':
      return snapshot.nightSessions;
    case 'dawns-early-light':
      return snapshot.dawnSessions;
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
    case 'fuel-days':
      return snapshot.fuelDays === 1 ? '1 fuel day' : `${snapshot.fuelDays} fuel days`;
    case 'presidential-fitness':
      return snapshot.pftTier ? `${snapshot.pftTier} award` : 'No test logged';
    case 'under-the-stars':
      return snapshot.nightSessions === 1 ? '1 night session' : `${snapshot.nightSessions} night sessions`;
    case 'dawns-early-light':
      return snapshot.dawnSessions === 1 ? '1 dawn session' : `${snapshot.dawnSessions} dawn sessions`;
  }
}

export { SQUAD_CODE_KEY };
