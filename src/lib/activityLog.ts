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

const STORAGE_KEY = 'mw_activity_log';

function loadAll(): ActivityEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as ActivityEntry[];
  } catch {
    return [];
  }
}

function saveAll(entries: ActivityEntry[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
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
  const weekStart = new Date();
  const day = weekStart.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  weekStart.setDate(weekStart.getDate() + diff);
  weekStart.setHours(0, 0, 0, 0);
  const startStr = weekStart.toISOString().split('T')[0];
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
