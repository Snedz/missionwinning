import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readJson, writeJson } from '@/lib/storage/safeStorage';

/**
 * Completed guidebook section ids. Storage only.
 *
 * The chapter bodies live in `guidebookProgress.ts`. Challenges only need
 * the count of stored ids (`Set.size`). Importing the book from here pulled
 * ~9 KB gzip of chapter text onto `/log` and `/active` initial JS.
 */
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
