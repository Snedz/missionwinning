/**
 * Daily mind / readiness check-ins — localStorage single source of truth.
 * Shared by Mind DailyCheckIn + Active session pre-check sheet.
 */

export const MIND_CHECKINS_KEY = 'mw_mind_checkins';
const MAX_ENTRIES = 30;

export type MindCheckIn = {
  date: string; // YYYY-MM-DD local
  sleep: number; // 1–5
  mood: number;
  stress: number;
  energy: number;
  /** Optional muscle soreness 1–5 (Wave 11). */
  soreness?: number;
  note?: string;
};

export function todayCheckInDate(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function clampRating(n: number): number {
  if (!Number.isFinite(n)) return 3;
  return Math.min(5, Math.max(1, Math.round(n)));
}

export function normalizeCheckIn(raw: Partial<MindCheckIn> & { date: string }): MindCheckIn {
  return {
    date: raw.date,
    sleep: clampRating(raw.sleep ?? 3),
    mood: clampRating(raw.mood ?? 3),
    stress: clampRating(raw.stress ?? 3),
    energy: clampRating(raw.energy ?? 3),
    soreness:
      raw.soreness != null && Number.isFinite(raw.soreness)
        ? clampRating(raw.soreness)
        : undefined,
    note: raw.note?.trim() || undefined,
  };
}

export function loadCheckIns(): MindCheckIn[] {
  if (typeof window === 'undefined') return [];
  try {
    const all = JSON.parse(localStorage.getItem(MIND_CHECKINS_KEY) || '[]') as MindCheckIn[];
    if (!Array.isArray(all)) return [];
    return all
      .filter((c) => c && typeof c.date === 'string')
      .map((c) => normalizeCheckIn(c));
  } catch {
    return [];
  }
}

export function getTodayCheckIn(now = new Date()): MindCheckIn | null {
  const today = todayCheckInDate(now);
  return loadCheckIns().find((c) => c.date === today) ?? null;
}

/** True when today's entry has the core fields (session sheet can treat as done). */
export function isTodayCheckInComplete(now = new Date()): boolean {
  const t = getTodayCheckIn(now);
  if (!t) return false;
  return [t.sleep, t.mood, t.stress, t.energy].every((n) => n >= 1 && n <= 5);
}

export function saveCheckIn(data: MindCheckIn): MindCheckIn {
  const normalized = normalizeCheckIn(data);
  if (typeof window === 'undefined') return normalized;
  const all = loadCheckIns().filter((c) => c.date !== normalized.date);
  localStorage.setItem(
    MIND_CHECKINS_KEY,
    JSON.stringify([normalized, ...all].slice(0, MAX_ENTRIES))
  );
  return normalized;
}

/**
 * Merge partial fields into today's check-in (creates if missing).
 * Session sheet uses this for soreness/sleep/motivation without wiping mood/stress.
 */
export function upsertTodayPartial(
  partial: Partial<Omit<MindCheckIn, 'date'>>,
  now = new Date()
): MindCheckIn {
  const today = todayCheckInDate(now);
  const existing = getTodayCheckIn(now);
  return saveCheckIn(
    normalizeCheckIn({
      date: today,
      sleep: partial.sleep ?? existing?.sleep ?? 3,
      mood: partial.mood ?? existing?.mood ?? 3,
      stress: partial.stress ?? existing?.stress ?? 3,
      energy: partial.energy ?? existing?.energy ?? 3,
      soreness: partial.soreness ?? existing?.soreness,
      note: partial.note !== undefined ? partial.note : existing?.note,
    })
  );
}

/**
 * Subjective readiness delta in points, clamped to ±maxAbs.
 * Pure — used by computeBodyScores.
 */
export function checkInReadinessDelta(
  checkIn: Pick<MindCheckIn, 'sleep' | 'stress' | 'energy' | 'soreness'> | null | undefined,
  maxAbs = 15
): number {
  if (!checkIn) return 0;
  let delta = 0;
  if (checkIn.sleep <= 2) delta -= 6;
  else if (checkIn.sleep >= 4) delta += 3;

  if (checkIn.soreness != null) {
    if (checkIn.soreness >= 4) delta -= 6;
    else if (checkIn.soreness <= 2) delta += 2;
  }

  if (checkIn.energy <= 2) delta -= 4;
  else if (checkIn.energy >= 4) delta += 2;

  if (checkIn.stress >= 4) delta -= 3;

  return Math.min(maxAbs, Math.max(-maxAbs, delta));
}
