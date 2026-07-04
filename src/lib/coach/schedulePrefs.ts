/** Schedule preferences for Mission Coach — days per week and preferred weekdays. */

const DAYS_KEY = 'mw_days_per_week';
const PREFERRED_KEY = 'mw_preferred_days';

export function defaultDaysPerWeek(experience: string): number {
  if (experience === 'advanced') return 5;
  if (experience === 'intermediate') return 4;
  return 3;
}

export function loadDaysPerWeek(experience?: string): number {
  if (typeof window === 'undefined') {
    return defaultDaysPerWeek(experience ?? 'beginner');
  }
  const raw = localStorage.getItem(DAYS_KEY);
  const n = raw ? parseInt(raw, 10) : NaN;
  if (n >= 2 && n <= 6) return n;
  return defaultDaysPerWeek(experience ?? localStorage.getItem('mw_experience') ?? 'beginner');
}

export function saveDaysPerWeek(days: number): void {
  if (typeof window === 'undefined') return;
  const clamped = Math.max(2, Math.min(6, days));
  localStorage.setItem(DAYS_KEY, String(clamped));
}

export function loadPreferredDays(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PREFERRED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((d): d is number => typeof d === 'number' && d >= 0 && d <= 6);
  } catch {
    return [];
  }
}

export function savePreferredDays(days: number[]): void {
  if (typeof window === 'undefined') return;
  const valid = days.filter((d) => d >= 0 && d <= 6);
  localStorage.setItem(PREFERRED_KEY, JSON.stringify(valid));
}
