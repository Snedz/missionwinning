import type { GuideChapter } from '@/data/guidebook/types';
import type { Exercise } from '@/types';

export function guideChapterJsonLd(chapter: GuideChapter, baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: chapter.title,
    description: chapter.subtitle,
    url: `${baseUrl}/guide/${chapter.id}`,
    inLanguage: 'en',
    isAccessibleForFree: true,
  };
}

export function exerciseHowToJsonLd(exercise: Exercise, baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to do ${exercise.name}`,
    description: exercise.cues || `${exercise.name} exercise guide`,
    url: `${baseUrl}/exercises/${exercise.id}`,
    inLanguage: 'en',
  };
}
