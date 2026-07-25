import { BEYOND_THE_BASICS_CHAPTERS } from '@/data/guidebook/chapters';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readJson, writeJson } from '@/lib/storage/safeStorage';

export function loadGuidebookProgress(): Set<string> {
  return new Set(readJson<string[]>(STORAGE_KEYS.guidebookProgress, []));
}

export function saveGuidebookProgress(completed: Set<string>): void {
  if (typeof window === 'undefined') return;
  writeJson(STORAGE_KEYS.guidebookProgress, [...completed]);
  window.dispatchEvent(new CustomEvent('mw-guidebook-progress'));
}

export function markSectionComplete(sectionId: string): void {
  const next = loadGuidebookProgress();
  next.add(sectionId);
  saveGuidebookProgress(next);
}

export function getGuidebookStats(completed: Set<string>) {
  const totalSections = BEYOND_THE_BASICS_CHAPTERS.reduce((n, ch) => n + ch.sections.length, 0);
  const done = BEYOND_THE_BASICS_CHAPTERS.reduce(
    (n, ch) => n + ch.sections.filter((s) => completed.has(s.id)).length,
    0
  );
  return { done, totalSections, pct: totalSections ? Math.round((done / totalSections) * 100) : 0 };
}

export function getChapterProgress(chapterId: string, completed: Set<string>) {
  const chapter = BEYOND_THE_BASICS_CHAPTERS.find((c) => c.id === chapterId);
  if (!chapter) return { done: 0, total: 0, pct: 0 };
  const done = chapter.sections.filter((s) => completed.has(s.id)).length;
  return { done, total: chapter.sections.length, pct: Math.round((done / chapter.sections.length) * 100) };
}

export function getContinueChapter(completed: Set<string>) {
  for (const chapter of BEYOND_THE_BASICS_CHAPTERS) {
    const nextSection = chapter.sections.find((s) => !completed.has(s.id));
    if (nextSection) {
      return { chapter, section: nextSection };
    }
  }
  return null;
}
