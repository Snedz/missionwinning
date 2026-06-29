import { getChallengeProgress } from '@/lib/challenges';
import { getPillarWins, type PillarType } from '@/lib/pillarLog';
import { getActivitiesForWeek } from '@/lib/activityLog';

export interface WeeklyPillarStats {
  moveFlows: number;
  mindSessions: number;
  trackActivities: number;
  learnLessons: number;
  trainDays: number;
  proteinDays: number;
  weekVolume: number;
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
  if (typeof window === 'undefined') return 0;
  try {
    const completed = JSON.parse(localStorage.getItem('mw_learn_completed') || '[]') as string[];
    // Lesson IDs don't have dates — count total completed capped for score (engagement proxy)
    return Math.min(completed.length, 10);
  } catch {
    return 0;
  }
}

/** Gather cross-pillar weekly stats from local storage (offline-first). */
export function gatherWeeklyPillarStats(): WeeklyPillarStats {
  const challenges = getChallengeProgress();
  const trainDays = challenges.find((c) => c.id === 'train-7')?.current ?? 0;
  const proteinDays = challenges.find((c) => c.id === 'protein-5')?.current ?? 0;
  const weekVolume = challenges.find((c) => c.id === 'volume-10k')?.current ?? 0;

  const mindCheckIns = typeof window !== 'undefined'
    ? (() => {
        try {
          const all = JSON.parse(localStorage.getItem('mw_mind_checkins') || '[]') as { date: string }[];
          const start = weekStartIso();
          return all.filter((c) => c.date >= start).length;
        } catch {
          return 0;
        }
      })()
    : 0;

  return {
    moveFlows: countPillarWinsThisWeek('move'),
    mindSessions: countPillarWinsThisWeek('mind') + mindCheckIns,
    trackActivities: getActivitiesForWeek().length,
    learnLessons: countLearnLessonsThisWeek(),
    trainDays,
    proteinDays,
    weekVolume,
  };
}
