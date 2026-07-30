import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readJson, writeJson } from '@/lib/storage/safeStorage';
import { localWeekKey } from '@/lib/time/localDate';

export type ActivityType = 'walk' | 'run' | 'bike' | 'hike' | 'swim' | 'other';

export interface ActivityEntry {
  id: string;
  date: string; // YYYY-MM-DD
  type: ActivityType;
  durationMin: number;
  distanceKm?: number;
  notes?: string;
  createdAt: string;
}

function loadAll(): ActivityEntry[] {
  return readJson<ActivityEntry[]>(STORAGE_KEYS.activityLog, []);
}

function saveAll(entries: ActivityEntry[]) {
  writeJson(STORAGE_KEYS.activityLog, entries);
}

export function logActivity(entry: Omit<ActivityEntry, 'id' | 'createdAt'>): ActivityEntry {
  const full: ActivityEntry = {
    ...entry,
    id: `act-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  const all = loadAll();
  saveAll([full, ...all]);
  return full;
}

export function getActivitiesForWeek(): ActivityEntry[] {
  const all = loadAll();
  // `entry.date` is a local YYYY-MM-DD, so the boundary must be one too. This
  // used `toISOString()`, which is UTC — east of UTC it returned the previous
  // Sunday all evening and pulled a day from the prior week into "this week".
  const startStr = localWeekKey();
  return all.filter((a) => a.date >= startStr);
}

export function getWeeklyStats() {
  const week = getActivitiesForWeek();
  const totalMin = week.reduce((s, a) => s + a.durationMin, 0);
  const totalKm = week.reduce((s, a) => s + (a.distanceKm || 0), 0);
  const byType: Record<string, number> = {};
  week.forEach((a) => {
    byType[a.type] = (byType[a.type] || 0) + a.durationMin;
  });
  return { count: week.length, totalMin, totalKm, byType };
}

export function deleteActivity(id: string) {
  saveAll(loadAll().filter((a) => a.id !== id));
}

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  walk: 'Walk',
  run: 'Run',
  bike: 'Bike',
  hike: 'Hike',
  swim: 'Swim',
  other: 'Other',
};
