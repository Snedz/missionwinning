/**
 * Quiet Learn — one free first-success intro off Today.
 *
 * Existing-path-first: Strength Basics `sb-0` already teaches
 * log a set, then Coach from those logs. Do not invent a lesson.
 * Empty invents nothing. Not a paid gate. Not a second home.
 */

import { FREE_LEARN_PATHS, type LearnLesson, type LearnPath } from '@/data/learnPaths';

export const QUIET_LEARN_PATH_ID = 'strength-basics';
export const QUIET_LEARN_LESSON_ID = 'sb-0';
export const QUIET_LEARN_COACH_LESSON_ID = 'pd-0';
export const QUIET_LEARN_HREF = '/learn';
export const QUIET_LEARN_DIATAXIS = 'tutorial' as const;

export type QuietLearnSnapshot = {
  empty: boolean;
  diataxis: typeof QUIET_LEARN_DIATAXIS;
  pathId: string | null;
  lesson: LearnLesson | null;
  coachHref: string | null;
  coachLabel: string | null;
};

function findLesson(
  paths: readonly LearnPath[],
  pathId: string | null,
  lessonId: string
): LearnLesson | null {
  for (const path of paths) {
    if (pathId && path.id !== pathId) continue;
    const lesson = path.lessons.find((row) => row.id === lessonId);
    if (lesson) return lesson;
  }
  return null;
}

/**
 * First success is log a set, then Coach from those logs.
 * Reads the existing lesson — does not invent a title.
 */
export function isQuietLearnFirstSuccess(lesson: LearnLesson | null | undefined): boolean {
  if (!lesson) return false;
  const blob = [lesson.title, lesson.summary, ...(lesson.keyPoints ?? [])].join(' ');
  return /\blog\b/i.test(blob) && /\bcoach\b/i.test(blob);
}

export function quietLearnHref(): string {
  return QUIET_LEARN_HREF;
}

const EMPTY: QuietLearnSnapshot = {
  empty: true,
  diataxis: QUIET_LEARN_DIATAXIS,
  pathId: null,
  lesson: null,
  coachHref: null,
  coachLabel: null,
};

/**
 * Resolve the existing first-success intro.
 * Honesty is keyed to `honesty` (defaults to the English catalog).
 * Display may overlay localized `paths`.
 */
export function quietLearnIntro(
  paths: readonly LearnPath[] = FREE_LEARN_PATHS,
  honesty: readonly LearnPath[] = FREE_LEARN_PATHS
): QuietLearnSnapshot {
  const english = findLesson(honesty, QUIET_LEARN_PATH_ID, QUIET_LEARN_LESSON_ID);
  if (!isQuietLearnFirstSuccess(english)) return EMPTY;

  const lesson =
    findLesson(paths, QUIET_LEARN_PATH_ID, QUIET_LEARN_LESSON_ID) ?? english;
  const coach =
    findLesson(paths, null, QUIET_LEARN_COACH_LESSON_ID) ??
    findLesson(honesty, null, QUIET_LEARN_COACH_LESSON_ID);

  return {
    empty: false,
    diataxis: QUIET_LEARN_DIATAXIS,
    pathId: QUIET_LEARN_PATH_ID,
    lesson,
    coachHref: coach?.actionHref ?? null,
    coachLabel: coach?.actionLabel ?? null,
  };
}
