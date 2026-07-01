/** User toggles and order for Today accordion sections (local only). */

export const TODAY_SECTION_IDS = ['health', 'journal', 'week', 'progress'] as const;
export type TodaySectionId = (typeof TODAY_SECTION_IDS)[number];

export type TodayDashboardPrefs = Record<TodaySectionId, boolean> & {
  order: TodaySectionId[];
};

const STORAGE_KEY_V2 = 'mw_today_sections_v2';
const STORAGE_KEY_V1 = 'mw_today_sections_v1';

const DEFAULT_ORDER: TodaySectionId[] = [...TODAY_SECTION_IDS];

const DEFAULT: TodayDashboardPrefs = {
  health: true,
  journal: true,
  week: true,
  progress: true,
  order: DEFAULT_ORDER,
};

function normalizeOrder(order: unknown): TodaySectionId[] {
  if (!Array.isArray(order)) return [...DEFAULT_ORDER];
  const valid = order.filter((id): id is TodaySectionId =>
    TODAY_SECTION_IDS.includes(id as TodaySectionId)
  );
  const missing = TODAY_SECTION_IDS.filter((id) => !valid.includes(id));
  return [...valid, ...missing];
}

export function loadTodayDashboardPrefs(): TodayDashboardPrefs {
  if (typeof window === 'undefined') return { ...DEFAULT, order: [...DEFAULT_ORDER] };
  try {
    const rawV2 = localStorage.getItem(STORAGE_KEY_V2);
    if (rawV2) {
      const parsed = JSON.parse(rawV2) as Partial<TodayDashboardPrefs>;
      return {
        health: parsed.health !== false,
        journal: parsed.journal !== false,
        week: parsed.week !== false,
        progress: parsed.progress !== false,
        order: normalizeOrder(parsed.order),
      };
    }
    const rawV1 = localStorage.getItem(STORAGE_KEY_V1);
    if (rawV1) {
      const parsed = JSON.parse(rawV1) as Partial<Record<TodaySectionId, boolean>>;
      return {
        health: parsed.health !== false,
        journal: parsed.journal !== false,
        week: parsed.week !== false,
        progress: parsed.progress !== false,
        order: [...DEFAULT_ORDER],
      };
    }
    return { ...DEFAULT, order: [...DEFAULT_ORDER] };
  } catch {
    return { ...DEFAULT, order: [...DEFAULT_ORDER] };
  }
}

export function saveTodayDashboardPrefs(prefs: TodayDashboardPrefs): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(prefs));
}

export function countVisibleSections(prefs: TodayDashboardPrefs): number {
  return TODAY_SECTION_IDS.filter((id) => prefs[id]).length;
}

export function moveSection(
  prefs: TodayDashboardPrefs,
  id: TodaySectionId,
  direction: 'up' | 'down'
): TodayDashboardPrefs {
  const order = [...prefs.order];
  const idx = order.indexOf(id);
  if (idx < 0) return prefs;
  const swap = direction === 'up' ? idx - 1 : idx + 1;
  if (swap < 0 || swap >= order.length) return prefs;
  [order[idx], order[swap]] = [order[swap], order[idx]];
  return { ...prefs, order };
}
