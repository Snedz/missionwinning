import { BEYOND_THE_BASICS_CHAPTERS } from '@/data/guidebook/chapters';

export function getGuideChapter(id: string) {
  const idx = BEYOND_THE_BASICS_CHAPTERS.findIndex((c) => c.id === id);
  if (idx < 0) return null;
  const chapter = BEYOND_THE_BASICS_CHAPTERS[idx];
  return {
    chapter,
    prev: idx > 0 ? BEYOND_THE_BASICS_CHAPTERS[idx - 1] : undefined,
    next: idx < BEYOND_THE_BASICS_CHAPTERS.length - 1 ? BEYOND_THE_BASICS_CHAPTERS[idx + 1] : undefined,
  };
}
