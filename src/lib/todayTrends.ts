import type { CompletedWorkoutLog } from '@/types';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readJson } from '@/lib/storage/safeStorage';
import { localDateKey, localDateKeyFromIso } from '@/lib/time/localDate';
import { compareKeys, EN_ONLY_SURFACE, formatLocalNumber } from '@/lib/i18n/formatLocale';

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
      key: localDateKey(d),
      label: d.toLocaleDateString(locale, { weekday: 'narrow' }),
    });
  }
  return days;
}

function readNutritionByDay(): Record<string, number> {
  const byDay: Record<string, number> = {};
  const logs = readJson<{ protein?: number; date?: string }[]>(STORAGE_KEYS.nutritionLog, []);
  const today = localDateKey();
  logs.forEach((l) => {
    const d = l.date || today;
    byDay[d] = (byDay[d] || 0) + (l.protein || 0);
  });
  return byDay;
}

function readActiveMinutesByDay(): Record<string, number> {
  const byDay: Record<string, number> = {};
  const acts = readJson<{ date: string; durationMin?: number }[]>(STORAGE_KEYS.activityLog, []);
  acts.forEach((a) => {
    if (!a.date) return;
    byDay[a.date] = (byDay[a.date] || 0) + (a.durationMin || 0);
  });
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

  /*
   * `.241` — two defects in three lines, both already swept for elsewhere.
   *
   * `w.completedAt.split('T')[0]` is the exact spelling `.212` banned and fixed
   * at fifteen sites: an ISO string is UTC, a calendar date is local, so east of
   * UTC an evening session landed on the previous day's bar and west of it a
   * morning session landed on the next. These four series feed Today's sparkline
   * row, and `.199`/`.212` exist because this keeps coming back in a spelling the
   * last guard did not know.
   *
   * And nothing dropped tombstones, so a session the athlete deliberately deleted
   * kept its volume in the trend — `.223`'s defect, which reached a public share
   * card the last time it went unnoticed. `dayReview.ts` and `behaviorImpacts.ts`
   * both filter; this is the fourth reader found not doing so.
   */
  for (const w of workoutHistory) {
    if (w.deletedAt) continue;
    const d = localDateKeyFromIso(w.completedAt);
    if (!d) continue;
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
      detail: `${formatLocalNumber(Math.round(w.totalVolume), EN_ONLY_SURFACE)} vol`,
    });
  }

  const today = localDateKey();

  const logs = readJson<
    { name?: string; protein?: number; time?: string; date?: string }[]
  >(STORAGE_KEYS.nutritionLog, []);
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

  const checkins = readJson<
    { date: string; mood?: number; sleep?: number; note?: string }[]
  >(STORAGE_KEYS.mindCheckIns, []);
  checkins.forEach((c) => {
    entries.push({
      id: `mind-${c.date}`,
      at: `${c.date}T20:00:00`,
      pillar: 'mind',
      title: c.note?.trim() || 'Daily check-in',
      detail:
        c.mood != null && c.sleep != null ? `mood ${c.mood}/5 · sleep ${c.sleep}/5` : undefined,
    });
  });

  const wins = readJson<
    { id: string; pillar: JournalPillar; title: string; completedAt: string }[]
  >(STORAGE_KEYS.pillarWins, []);
  wins.forEach((w) => {
    // Train wins already came from workoutHistory above — this would double them.
    if (w.pillar === 'train') return;
    entries.push({
      id: `win-${w.id}`,
      at: w.completedAt,
      pillar: w.pillar,
      title: w.title,
    });
  });

  const acts = readJson<
    { id: string; date: string; type?: string; durationMin?: number; createdAt?: string }[]
  >(STORAGE_KEYS.activityLog, []);
  acts.forEach((a) => {
    entries.push({
      id: `track-${a.id}`,
      at: a.createdAt || `${a.date}T12:00:00`,
      pillar: 'track',
      title: a.type ? `${a.type} activity` : 'Activity',
      detail: a.durationMin ? `${a.durationMin} min` : undefined,
    });
  });

  return entries.sort((a, b) => compareKeys(b.at, a.at)).slice(0, limit);
}

/** Best-effort parse of locale time string to HH:MM:SS for sorting. */
function parseTimeToIso(time: string): string {
  const match = time.match(/(\d{1,2}):(\d{2})/);
  if (!match) return '12:00:00';
  const h = match[1].padStart(2, '0');
  return `${h}:${match[2]}:00`;
}
