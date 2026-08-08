import { getChallengeProgress } from '@/lib/challenges';
import { getPillarWins, type PillarType } from '@/lib/pillarLog';
import { getActivitiesForWeek } from '@/lib/activityLog';
import { hasFuelPlanThisWeek, todayFuelSynergyBump } from '@/lib/fuelCoach/synergy';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readJson } from '@/lib/storage/safeStorage';
import { localDateKeyFromIso, localWeekKey } from '@/lib/time/localDate';

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

/** Local Monday key. Named `Iso` historically; it is a calendar date, not an instant. */
function weekStartIso(): string {
  return localWeekKey();
}

function countPillarWinsThisWeek(pillar: PillarType): number {
  const start = weekStartIso();
  return getPillarWins(100).filter(
    // `.241` — `localDateKeyFromIso`, not `.split('T')[0]`. `start` is a *local*
    // Monday; the split takes the **UTC** date half of a stored instant, so the two
    // sides were in different frames and the week boundary moved with longitude.
    (w) => w.pillar === pillar && localDateKeyFromIso(w.completedAt) >= start
  ).length;
}

/**
 * `.606` — this used to union three **lifetime** id sets (`learnCompleted`,
 * `premiumCourseProgress`, `guidebookProgress`) and return `min(total, 10)`. No
 * date filter at all, directly beneath `countPillarWinsThisWeek`, which has a
 * careful local-week filter and a `.241` comment about UTC frames. Five lessons
 * finished once paid the Learn pillar its full ~10 points **forever**.
 *
 * The fix is to stop having a second implementation: all three completion paths
 * already log a `'learn'` pillar win — `LearnPage.markLessonDone`,
 * `GuidebookChapterPage.completeSection` and `CourseReader` (course + per-chapter)
 * — so the dated counter beside it was always the right reader. One definition per
 * domain rule (`.178`); the id sets stay where they belong, as *progress* state for
 * rendering ticks, not as a scoring input.
 */
function countLearnLessonsThisWeek(): number {
  return countPillarWinsThisWeek('learn');
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
