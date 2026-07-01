import type { LearnPath } from '@/data/learnPaths';

type TranslateFn = (key: string, options?: { defaultValue?: string }) => string;

/** Overlay locale keys onto learn path data; English defaults come from learnPaths.ts. */
export function localizeLearnPaths(paths: LearnPath[], t: TranslateFn): LearnPath[] {
  return paths.map((path) => ({
    ...path,
    title: t(`learnPath_${path.id}_title`, { defaultValue: path.title }),
    subtitle: t(`learnPath_${path.id}_subtitle`, { defaultValue: path.subtitle }),
    lessons: path.lessons.map((lesson) => ({
      ...lesson,
      title: t(`learnLesson_${lesson.id}_title`, { defaultValue: lesson.title }),
      summary: t(`learnLesson_${lesson.id}_summary`, { defaultValue: lesson.summary }),
      keyPoints: lesson.keyPoints.map((pt, i) =>
        t(`learnLesson_${lesson.id}_kp_${i}`, { defaultValue: pt })
      ),
      actionLabel: lesson.actionLabel
        ? t(`learnLesson_${lesson.id}_action`, { defaultValue: lesson.actionLabel })
        : undefined,
    })),
  }));
}
