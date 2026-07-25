/** User toggles and order for Today accordion sections (local only). */

import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readJson, writeJson } from '@/lib/storage/safeStorage';

export const TODAY_SECTION_IDS = ['health', 'journal', 'week', 'progress'] as const;
export type TodaySectionId = (typeof TODAY_SECTION_IDS)[number];

export type TodayDashboardPrefs = Record<TodaySectionId, boolean> & {
  order: TodaySectionId[];
};

const STORAGE_KEY_V2 = STORAGE_KEYS.todaySectionsV2;
const STORAGE_KEY_V1 = STORAGE_KEYS.todaySectionsV1;

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
  const v2 = readJson<Partial<TodayDashboardPrefs> | null>(STORAGE_KEY_V2, null);
  if (v2) {
    return {
      health: v2.health !== false,
      journal: v2.journal !== false,
      week: v2.week !== false,
      progress: v2.progress !== false,
      order: normalizeOrder(v2.order),
    };
  }
  // v1 predates the reorder feature, so it carries toggles but no order.
  const v1 = readJson<Partial<Record<TodaySectionId, boolean>> | null>(STORAGE_KEY_V1, null);
  if (v1) {
    return {
      health: v1.health !== false,
      journal: v1.journal !== false,
      week: v1.week !== false,
      progress: v1.progress !== false,
      order: [...DEFAULT_ORDER],
    };
  }
  return { ...DEFAULT, order: [...DEFAULT_ORDER] };
}

export function saveTodayDashboardPrefs(prefs: TodayDashboardPrefs): void {
  writeJson(STORAGE_KEY_V2, prefs);
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
