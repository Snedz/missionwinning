import type { ActivityType } from '@/lib/activityLog';
import { logActivity } from '@/lib/activityLog';

export type HealthImportRow = {
  date: string;
  type?: string;
  durationMin?: number;
  distanceKm?: number;
  notes?: string;
};

export type HealthImportResult = {
  imported: number;
  skipped: number;
  errors: string[];
};

const TYPE_MAP: Record<string, ActivityType> = {
  walk: 'walk',
  walking: 'walk',
  run: 'run',
  running: 'run',
  bike: 'bike',
  cycling: 'bike',
  ride: 'bike',
  hike: 'hike',
  hiking: 'hike',
  swim: 'swim',
  swimming: 'swim',
  other: 'other',
};

export function normalizeActivityType(raw: string | undefined): ActivityType {
  if (!raw) return 'other';
  const key = raw.trim().toLowerCase();
  return TYPE_MAP[key] ?? 'other';
}

function isValidDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

/** Import activities from JSON export (Apple Health shortcuts, manual backup, etc.). */
export function importActivitiesFromJson(rows: HealthImportRow[]): HealthImportResult {
  const result: HealthImportResult = { imported: 0, skipped: 0, errors: [] };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row?.date || !isValidDate(row.date)) {
      result.skipped++;
      result.errors.push(`Row ${i + 1}: invalid date`);
      continue;
    }
    const durationMin = Math.round(Number(row.durationMin) || 0);
    if (durationMin < 1) {
      result.skipped++;
      result.errors.push(`Row ${i + 1}: missing duration`);
      continue;
    }
    const distanceKm =
      row.distanceKm != null && !Number.isNaN(Number(row.distanceKm))
        ? Number(row.distanceKm)
        : undefined;

    logActivity({
      date: row.date,
      type: normalizeActivityType(row.type),
      durationMin,
      distanceKm,
      notes: row.notes?.trim() || 'Imported activity',
    });
    result.imported++;
  }

  return result;
}

export function parseHealthImportFile(text: string): HealthImportRow[] {
  const parsed = JSON.parse(text) as unknown;
  if (Array.isArray(parsed)) return parsed as HealthImportRow[];
  if (parsed && typeof parsed === 'object' && Array.isArray((parsed as { activities?: unknown }).activities)) {
    return (parsed as { activities: HealthImportRow[] }).activities;
  }
  throw new Error('invalid_format');
}

export const HEALTH_IMPORT_SAMPLE = `[
  { "date": "2026-07-01", "type": "walk", "durationMin": 35, "distanceKm": 3.2, "notes": "Morning walk" },
  { "date": "2026-07-01", "type": "run", "durationMin": 22, "distanceKm": 4.1 }
]`;
