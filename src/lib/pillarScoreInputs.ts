import { getChallengeProgress } from '@/lib/challenges';
import { getPillarWins, type PillarType } from '@/lib/pillarLog';
import { getActivitiesForWeek } from '@/lib/activityLog';
import { hasFuelPlanThisWeek, todayFuelSynergyBump } from '@/lib/fuelCoach/synergy';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readJson } from '@/lib/storage/safeStorage';

export interface WeeklyPillarStats {
  moveFlows: number;
  mindSessions: number;
  trackActivities: number;
  learnLessons: number;
  trainDays: number;
  proteinDays: number;
  weekVolume: number;
  fuelCoachActive: number;
  fuelCoachCarbBump: number;
}

function weekStartIso(): string {
  const date = new Date();
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date.toISOString().split('T')[0];
}

function countPillarWinsThisWeek(pillar: PillarType): number {
  const start = weekStartIso();
  return getPillarWins(100).filter(
    (w) => w.pillar === pillar && w.completedAt.split('T')[0] >= start
  ).length;
}

function countLearnLessonsThisWeek(): number {
  const completed = readJson<string[]>(STORAGE_KEYS.learnCompleted, []);
  const premium = readJson<string[]>(STORAGE_KEYS.premiumCourseProgress, []);
  const guide = readJson<string[]>(STORAGE_KEYS.guidebookProgress, []);
  const total = new Set([...completed, ...premium, ...guide]).size;
  return Math.min(total, 10);
}

/** Gather cross-pillar weekly stats from local storage (offline-first). */
export function gatherWeeklyPillarStats(): WeeklyPillarStats {
  const challenges = getChallengeProgress();
  const trainDays = challenges.find((c) => c.id === 'train-7')?.current ?? 0;
  const proteinDays = challenges.find((c) => c.id === 'protein-5')?.current ?? 0;
  const weekVolume = challenges.find((c) => c.id === 'volume-10k')?.current ?? 0;

  const weekStart = weekStartIso();
  const mindCheckIns = readJson<{ date: string }[]>(STORAGE_KEYS.mindCheckIns, []).filter(
    (c) => c.date >= weekStart
  ).length;

  return {
    moveFlows: countPillarWinsThisWeek('move'),
    mindSessions: countPillarWinsThisWeek('mind') + mindCheckIns,
    trackActivities: getActivitiesForWeek().length,
    learnLessons: countLearnLessonsThisWeek(),
    trainDays,
    proteinDays,
    weekVolume,
    fuelCoachActive: hasFuelPlanThisWeek() ? 1 : 0,
    fuelCoachCarbBump: todayFuelSynergyBump(),
  };
}
