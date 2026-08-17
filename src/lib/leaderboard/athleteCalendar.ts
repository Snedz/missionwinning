/**
 * Athlete-local calendar facts for a named IANA zone.
 *
 * Server processes run in UTC. The local snapshot uses `localDateKey` /
 * `localWeekKey` in the athlete's zone. These helpers take that zone as data
 * so standings computed on the server share the same Monday and clock hour.
 */
import { isLocalDateKey, previousLocalDateKey } from '@/lib/time/localDate';

const WEEKDAY_TO_SUNDAY0: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export function isIanaTimeZone(value: string): boolean {
  if (!value || value.length > 80) return false;
  try {
    Intl.DateTimeFormat('en-US', { timeZone: value }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

function zonedParts(
  instant: Date,
  timeZone: string
): { year: number; month: number; day: number; weekday: number; hour: number } | null {
  if (Number.isNaN(instant.getTime()) || !isIanaTimeZone(timeZone)) return null;
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: 'numeric',
    hourCycle: 'h23',
  });
  const bag: Record<string, string> = {};
  for (const part of fmt.formatToParts(instant)) {
    if (part.type !== 'literal') bag[part.type] = part.value;
  }
  const year = Number(bag.year);
  const month = Number(bag.month);
  const day = Number(bag.day);
  const hour = Number(bag.hour);
  const weekday = WEEKDAY_TO_SUNDAY0[bag.weekday ?? ''];
  if (!year || !month || !day || weekday === undefined || !Number.isFinite(hour)) return null;
  return { year, month, day, weekday, hour };
}

/** `YYYY-MM-DD` of `instant` in `timeZone`. */
export function zonedDateKey(instant: Date, timeZone: string): string {
  const p = zonedParts(instant, timeZone);
  if (!p) return '';
  const key = `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
  return isLocalDateKey(key) ? key : '';
}

/** Monday of `instant`'s week in `timeZone`, as `YYYY-MM-DD`. */
export function zonedWeekKey(instant: Date, timeZone: string): string {
  const p = zonedParts(instant, timeZone);
  if (!p) return '';
  let key = `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
  if (!isLocalDateKey(key)) return '';
  const stepsBack = p.weekday === 0 ? 6 : p.weekday - 1;
  for (let i = 0; i < stepsBack; i += 1) {
    key = previousLocalDateKey(key);
  }
  return key;
}

/** Clock hour 0–23 of an ISO instant in `timeZone`, or null. */
export function zonedHour(iso: string, timeZone: string): number | null {
  const instant = new Date(iso);
  const p = zonedParts(instant, timeZone);
  if (!p) return null;
  return p.hour;
}
