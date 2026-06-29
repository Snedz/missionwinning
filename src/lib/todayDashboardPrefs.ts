/** User toggles for Today accordion sections (local only). */

export const TODAY_SECTION_IDS = ['health', 'week', 'progress'] as const;
export type TodaySectionId = (typeof TODAY_SECTION_IDS)[number];

export type TodayDashboardPrefs = Record<TodaySectionId, boolean>;

const STORAGE_KEY = 'mw_today_sections_v1';

const DEFAULT: TodayDashboardPrefs = {
  health: true,
  week: true,
  progress: true,
};

export function loadTodayDashboardPrefs(): TodayDashboardPrefs {
  if (typeof window === 'undefined') return { ...DEFAULT };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT };
    const parsed = JSON.parse(raw) as Partial<TodayDashboardPrefs>;
    return {
      health: parsed.health !== false,
      week: parsed.week !== false,
      progress: parsed.progress !== false,
    };
  } catch {
    return { ...DEFAULT };
  }
}

export function saveTodayDashboardPrefs(prefs: TodayDashboardPrefs): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export function countVisibleSections(prefs: TodayDashboardPrefs): number {
  return TODAY_SECTION_IDS.filter((id) => prefs[id]).length;
}
