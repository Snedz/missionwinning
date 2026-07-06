import { getUser } from '@/lib/supabase';

const STORAGE_KEY = 'mw_premium_course_progress';

export function loadPremiumCourseProgress(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as string[]);
  } catch {
    return new Set();
  }
}

export function savePremiumCourseProgress(completed: Set<string>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]));
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

async function syncPremiumCourseProgressToCloud(sectionIds: string[]): Promise<void> {
  try {
    const u = await getUser();
    if (!u) return;
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(
      `mw_premium_course_sync_${u.id}`,
      JSON.stringify({ sectionIds, updatedAt: today })
    );
  } catch {
    // offline-first — local progress is source of truth
  }
}

export function restorePremiumCourseProgressForUser(userId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(`mw_premium_course_sync_${userId}`);
    if (!raw) return;
    const data = JSON.parse(raw) as { sectionIds?: string[] };
    if (!data.sectionIds?.length) return;
    const merged = new Set([...loadPremiumCourseProgress(), ...data.sectionIds]);
    savePremiumCourseProgress(merged);
  } catch {
    /* ignore */
  }
}
