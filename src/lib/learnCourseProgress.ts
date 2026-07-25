import { getUser } from '@/lib/supabase';
import { STORAGE_KEYS, STORAGE_KEY_PREFIXES } from '@/lib/storage/keys';
import { readJson, writeJson } from '@/lib/storage/safeStorage';

const STORAGE_KEY = STORAGE_KEYS.premiumCourseProgress;

export function loadPremiumCourseProgress(): Set<string> {
  return new Set(readJson<string[]>(STORAGE_KEY, []));
}

export function savePremiumCourseProgress(completed: Set<string>): void {
  if (typeof window === 'undefined') return;
  writeJson(STORAGE_KEY, [...completed]);
  window.dispatchEvent(new CustomEvent('mw-premium-course-progress'));
}

export function markPremiumSectionComplete(sectionId: string): void {
  const next = loadPremiumCourseProgress();
  next.add(sectionId);
  savePremiumCourseProgress(next);
  void syncPremiumCourseProgressToCloud([...next]);
}

export function getPremiumChapterProgress(
  chapter: { sections: { id: string }[] },
  completed: Set<string>
) {
  const done = chapter.sections.filter((s) => completed.has(s.id)).length;
  const total = chapter.sections.length;
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
}

function syncKey(userId: string): string {
  return `${STORAGE_KEY_PREFIXES.premiumCourseSync}${userId}`;
}

async function syncPremiumCourseProgressToCloud(sectionIds: string[]): Promise<void> {
  try {
    const u = await getUser();
    if (!u) return;
    const today = new Date().toISOString().split('T')[0];
    writeJson(syncKey(u.id), { sectionIds, updatedAt: today });
  } catch {
    // offline-first — local progress is source of truth
  }
}

export function restorePremiumCourseProgressForUser(userId: string): void {
  const data = readJson<{ sectionIds?: string[] } | null>(syncKey(userId), null);
  if (!data?.sectionIds?.length) return;
  const merged = new Set([...loadPremiumCourseProgress(), ...data.sectionIds]);
  savePremiumCourseProgress(merged);
}
