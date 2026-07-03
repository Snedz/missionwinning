import type { GuideChapter } from '@/data/guidebook/types';

type TranslateFn = (key: string, options?: { defaultValue?: string }) => string;

export function localizeGuidebookChapters(chapters: GuideChapter[], t: TranslateFn): GuideChapter[] {
  return chapters.map((chapter) => ({
    ...chapter,
    title: t(`guideChapter_${chapter.id}_title`, { defaultValue: chapter.title }),
    subtitle: t(`guideChapter_${chapter.id}_subtitle`, { defaultValue: chapter.subtitle }),
    sections: chapter.sections.map((section) => ({
      ...section,
      title: t(`guideSection_${section.id}_title`, { defaultValue: section.title }),
      summary: t(`guideSection_${section.id}_summary`, { defaultValue: section.summary }),
      body: t(`guideSection_${section.id}_body`, { defaultValue: section.body }),
      practiceCTA: {
        ...section.practiceCTA,
        label: t(`guideSection_${section.id}_cta`, { defaultValue: section.practiceCTA.label }),
      },
    })),
  }));
}
