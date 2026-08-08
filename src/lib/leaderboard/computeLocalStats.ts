import { gatherWeeklyPillarStats } from '@/lib/pillarScoreInputs';
import { getTrainingStreak } from '@/lib/challenges';
import { computeWinScore } from '@/lib/score';
import { countSessionsThisWeek, sumVolumeThisWeek } from '@/lib/workout/historyVolume';
import { tierToScore } from '@/lib/presidentialFitnessTest';
import type { CompletedWorkoutLog } from '@/types';
import type { LeaderboardBoardId, LeaderboardSnapshot } from './types';
import { countSessionsInHourRange } from './types';
import { loadSquadCode, SQUAD_CODE_KEY } from './boards';
import { resolveGeoFromLocale } from './regions';
import { readRaw, writeRaw } from '@/lib/storage/safeStorage';
import { I18N_LANG_KEY, STORAGE_KEYS } from '@/lib/storage/keys';
import {
  DISPLAY_NAME_MAX,
  checkDisplayName,
  type DisplayNameCheck,
} from '@/lib/identity/displayName';

const OPERATOR_NAME_KEY = STORAGE_KEYS.operatorName;

export function loadOperatorName(): string {
  return readRaw(OPERATOR_NAME_KEY)?.trim() || 'Mission Operator';
}

/**
 * `.610` — a name now has to pass a check before it is stored.
 *
 * This used to be `trim().slice(0, 24)` and nothing else, on the one string this
 * product publishes to other people. Returns the rejection so the caller can say
 * *why* — silently keeping the old name is the kind of "nothing happened" that reads
 * as a broken input.
 *
 * Rejection leaves the previous name in place rather than blanking it: an athlete
 * who typos should not lose the name they had.
 */
export function saveOperatorName(name: string): DisplayNameCheck {
  const verdict = checkDisplayName(name);
  if (!verdict.ok) return verdict;
  writeRaw(OPERATOR_NAME_KEY, name.trim().slice(0, DISPLAY_NAME_MAX));
  return verdict;
}

export { loadSquadCode, saveSquadCode } from './boards';

function loadLocalPftScore(): { score: number; tier?: string } {
  const tier = readRaw(STORAGE_KEYS.pftLastTier) ?? undefined;
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
  const locale = readRaw(I18N_LANG_KEY)?.split('-')[0] || 'en';
  const geo = resolveGeoFromLocale(locale);
  const weekly = gatherWeeklyPillarStats();
  const streak = getTrainingStreak(workoutHistory);
  const fuelDays = highProteinDaysThisWeek();
  const nightSessions = countSessionsInHourRange(workoutHistory, 22, 5);
  const dawnSessions = countSessionsInHourRange(workoutHistory, 5, 8);
  const pft = loadLocalPftScore();

  /*
   * `.606` — the leaderboard shares `computeWinScore`, so it shared the defect:
   * lifetime sessions and volume made a third of every ranked score permanent, and
   * a board that never decays ranks tenure rather than this week.
   *
   * The two lifetime locals that used to be computed here are gone rather than
   * renamed: nothing else read them. The snapshot publishes `weekly.weekVolume`
   * (challenge-derived) for the weekly-volume board and never reported a career
   * total — so the weekly figure was already sitting in this function while the
   * score was handed the lifetime one.
   *
   * The score deliberately uses `sumVolumeThisWeek(workoutHistory)` and not
   * `weekly.weekVolume`, so one athlete gets one Mission Score whether it is
   * computed here or on Today. Those two weekly volumes *should* agree — history is
   * the source of truth, the challenge counter is a running tally — and reconciling
   * them to one reader is its own change, noted rather than smuggled in here.
   */
  const winScore = computeWinScore({
    streak,
    highProteinDays: fuelDays,
    sessionsThisWeek: countSessionsThisWeek(workoutHistory),
    volumeThisWeek: sumVolumeThisWeek(workoutHistory),
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
