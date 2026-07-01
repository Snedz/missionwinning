import type { CompletedWorkoutLog } from '@/types';

export type TrendMetricId = 'volume' | 'sessions' | 'protein' | 'active';

export interface TrendSeries {
  id: TrendMetricId;
  values: number[];
  labels: string[];
  latest: number;
  weekTotal: number;
}

export interface TodayTrends {
  series: TrendSeries[];
}

export type JournalPillar = 'train' | 'fuel' | 'move' | 'mind' | 'track' | 'learn';

export interface JournalEntry {
  id: string;
  at: string;
  pillar: JournalPillar;
  title: string;
  detail?: string;
}

/** Last N calendar days (oldest → newest). */
export function lastDayBuckets(count: number, locale = 'en'): { key: string; label: string }[] {
  const days: { key: string; label: string }[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - i);
    days.push({
      key: d.toISOString().split('T')[0],
      label: d.toLocaleDateString(locale, { weekday: 'narrow' }),
    });
  }
  return days;
}

function readNutritionByDay(): Record<string, number> {
  const byDay: Record<string, number> = {};
  if (typeof window === 'undefined') return byDay;
  try {
    const logs = JSON.parse(localStorage.getItem('mw_nutrition_log') || '[]') as {
      protein?: number;
      date?: string;
    }[];
    const today = new Date().toISOString().split('T')[0];
    logs.forEach((l) => {
      const d = l.date || today;
      byDay[d] = (byDay[d] || 0) + (l.protein || 0);
    });
  } catch {
    /* ignore */
  }
  return byDay;
}

function readActiveMinutesByDay(): Record<string, number> {
  const byDay: Record<string, number> = {};
  if (typeof window === 'undefined') return byDay;
  try {
    const acts = JSON.parse(localStorage.getItem('mw_activity_log') || '[]') as {
      date: string;
      durationMin?: number;
    }[];
    acts.forEach((a) => {
      if (!a.date) return;
      byDay[a.date] = (byDay[a.date] || 0) + (a.durationMin || 0);
    });
  } catch {
    /* ignore */
  }
  return byDay;
}

export function buildTodayTrends(
  workoutHistory: CompletedWorkoutLog[],
  locale = 'en',
  dayCount = 7
): TodayTrends {
  const days = lastDayBuckets(dayCount, locale);
  const volumeByDay: Record<string, number> = {};
  const sessionsByDay: Record<string, number> = {};

  for (const w of workoutHistory) {
    const d = w.completedAt.split('T')[0];
    volumeByDay[d] = (volumeByDay[d] || 0) + w.totalVolume;
    sessionsByDay[d] = (sessionsByDay[d] || 0) + 1;
  }

  const proteinByDay = readNutritionByDay();
  const activeByDay = readActiveMinutesByDay();

  const build = (id: TrendMetricId, map: Record<string, number>): TrendSeries => {
    const values = days.map((d) => map[d.key] || 0);
    return {
      id,
      values,
      labels: days.map((d) => d.label),
      latest: values[values.length - 1] ?? 0,
      weekTotal: values.reduce((s, v) => s + v, 0),
    };
  };

  return {
    series: [
      build('volume', volumeByDay),
      build('sessions', sessionsByDay),
      build('protein', proteinByDay),
      build('active', activeByDay),
    ],
  };
}

export function gatherJournalEntries(
  workoutHistory: CompletedWorkoutLog[],
  limit = 10
): JournalEntry[] {
  const entries: JournalEntry[] = [];

  for (const w of workoutHistory) {
    entries.push({
      id: `train-${w.id}`,
      at: w.completedAt,
      pillar: 'train',
      title: w.workoutName,
      detail: `${Math.round(w.totalVolume).toLocaleString()} vol`,
    });
  }

  if (typeof window !== 'undefined') {
    try {
      const today = new Date().toISOString().split('T')[0];
      const logs = JSON.parse(localStorage.getItem('mw_nutrition_log') || '[]') as {
        name?: string;
        protein?: number;
        time?: string;
        date?: string;
      }[];
      logs.forEach((l, i) => {
        const d = l.date || today;
        entries.push({
          id: `fuel-${d}-${i}-${l.name ?? 'meal'}`,
          at: `${d}T${l.time ? parseTimeToIso(l.time) : '12:00:00'}`,
          pillar: 'fuel',
          title: l.name || 'Meal',
          detail: l.protein ? `${l.protein}g protein` : undefined,
        });
      });
    } catch {
      /* ignore */
    }

    try {
      const checkins = JSON.parse(localStorage.getItem('mw_mind_checkins') || '[]') as {
        date: string;
        mood?: number;
        sleep?: number;
        note?: string;
      }[];
      checkins.forEach((c) => {
        entries.push({
          id: `mind-${c.date}`,
          at: `${c.date}T20:00:00`,
          pillar: 'mind',
          title: c.note?.trim() || 'Daily check-in',
          detail:
            c.mood != null && c.sleep != null
              ? `mood ${c.mood}/5 · sleep ${c.sleep}/5`
              : undefined,
        });
      });
    } catch {
      /* ignore */
    }

    try {
      const wins = JSON.parse(localStorage.getItem('mw_pillar_wins') || '[]') as {
        id: string;
        pillar: JournalPillar;
        title: string;
        completedAt: string;
      }[];
      wins.forEach((w) => {
        if (w.pillar === 'train') return;
        entries.push({
          id: `win-${w.id}`,
          at: w.completedAt,
          pillar: w.pillar,
          title: w.title,
        });
      });
    } catch {
      /* ignore */
    }

    try {
      const acts = JSON.parse(localStorage.getItem('mw_activity_log') || '[]') as {
        id: string;
        date: string;
        type?: string;
        durationMin?: number;
        createdAt?: string;
      }[];
      acts.forEach((a) => {
        entries.push({
          id: `track-${a.id}`,
          at: a.createdAt || `${a.date}T12:00:00`,
          pillar: 'track',
          title: a.type ? `${a.type} activity` : 'Activity',
          detail: a.durationMin ? `${a.durationMin} min` : undefined,
        });
      });
    } catch {
      /* ignore */
    }
  }

  return entries.sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit);
}

/** Best-effort parse of locale time string to HH:MM:SS for sorting. */
function parseTimeToIso(time: string): string {
  const match = time.match(/(\d{1,2}):(\d{2})/);
  if (!match) return '12:00:00';
  const h = match[1].padStart(2, '0');
  return `${h}:${match[2]}:00`;
}
