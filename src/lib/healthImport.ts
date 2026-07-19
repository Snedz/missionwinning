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
  biking: 'bike',
  hike: 'hike',
  hiking: 'hike',
  swim: 'swim',
  swimming: 'swim',
  other: 'other',
  /** Google Fit numeric activity types (common subset). */
  '7': 'walk',
  '8': 'run',
  '1': 'bike',
  '9': 'hike',
  '82': 'swim',
};

export function normalizeActivityType(raw: string | undefined): ActivityType {
  if (!raw) return 'other';
  const key = raw.trim().toLowerCase();
  return TYPE_MAP[key] ?? 'other';
}

function isValidDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function toDateOnly(isoOrDate: string): string | null {
  const trimmed = isoOrDate.trim();
  if (isValidDate(trimmed)) return trimmed;
  const ms = Date.parse(trimmed);
  if (!Number.isNaN(ms)) {
    return new Date(ms).toISOString().slice(0, 10);
  }
  return null;
}

function durationFromMs(startMs: number, endMs: number): number {
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) return 0;
  return Math.max(1, Math.round((endMs - startMs) / 60_000));
}

/** Map a loose vendor/object row into HealthImportRow when possible. */
export function coerceHealthImportRow(raw: unknown): HealthImportRow | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;

  // Mission Winning / Shortcuts shape
  if (typeof o.date === 'string') {
    const durationMin = Number(o.durationMin ?? o.duration_min ?? o.duration ?? 0);
    const distanceKm = o.distanceKm ?? o.distance_km ?? o.distance;
    return {
      date: o.date,
      type: typeof o.type === 'string' ? o.type : typeof o.activityType === 'string' ? o.activityType : undefined,
      durationMin: Number.isFinite(durationMin) ? durationMin : undefined,
      distanceKm:
        distanceKm != null && !Number.isNaN(Number(distanceKm)) ? Number(distanceKm) : undefined,
      notes: typeof o.notes === 'string' ? o.notes : undefined,
    };
  }

  // Google Fit–style: startTimeMillis / endTimeMillis / activityType
  const startMs = Number(o.startTimeMillis ?? o.startTimeMs ?? o.start_time_millis);
  const endMs = Number(o.endTimeMillis ?? o.endTimeMs ?? o.end_time_millis);
  if (Number.isFinite(startMs) && startMs > 0) {
    const date = new Date(startMs).toISOString().slice(0, 10);
    const durationMin =
      Number(o.durationMin) ||
      (Number.isFinite(endMs) ? durationFromMs(startMs, endMs) : Math.round(Number(o.duration) || 0));
    const activityType = o.activityType ?? o.activity_type ?? o.type;
    const distanceM = Number(o.distance ?? o.distanceMeters ?? o.distance_m);
    return {
      date,
      type: activityType != null ? String(activityType) : undefined,
      durationMin: durationMin || undefined,
      distanceKm: Number.isFinite(distanceM) && distanceM > 0 ? distanceM / 1000 : undefined,
      notes: typeof o.name === 'string' ? o.name : undefined,
    };
  }

  // ISO start/end (Takeout / export variants)
  if (typeof o.startTime === 'string' || typeof o.start === 'string') {
    const start = String(o.startTime ?? o.start);
    const date = toDateOnly(start);
    if (!date) return null;
    const end = typeof o.endTime === 'string' ? o.endTime : typeof o.end === 'string' ? o.end : '';
    const startMs2 = Date.parse(start);
    const endMs2 = end ? Date.parse(end) : NaN;
    const durationMin =
      Number(o.durationMin) ||
      (Number.isFinite(endMs2) ? durationFromMs(startMs2, endMs2) : Math.round(Number(o.duration) || 0));
    return {
      date,
      type: typeof o.type === 'string' ? o.type : typeof o.activityType === 'string' ? o.activityType : undefined,
      durationMin: durationMin || undefined,
      distanceKm:
        o.distanceKm != null
          ? Number(o.distanceKm)
          : o.distance != null
            ? Number(o.distance)
            : undefined,
      notes: typeof o.notes === 'string' ? o.notes : undefined,
    };
  }

  return null;
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

function extractRowArray(parsed: unknown): unknown[] {
  if (Array.isArray(parsed)) return parsed;
  if (!parsed || typeof parsed !== 'object') throw new Error('invalid_format');
  const o = parsed as Record<string, unknown>;
  if (Array.isArray(o.activities)) return o.activities;
  if (Array.isArray(o.data)) return o.data;
  // Google Fit aggregate dump sometimes nests bucket → dataset → point
  if (Array.isArray(o.bucket)) {
    const rows: unknown[] = [];
    for (const b of o.bucket) {
      if (!b || typeof b !== 'object') continue;
      const dataset = (b as { dataset?: unknown[] }).dataset;
      if (!Array.isArray(dataset)) continue;
      for (const ds of dataset) {
        if (!ds || typeof ds !== 'object') continue;
        const points = (ds as { point?: unknown[] }).point;
        if (Array.isArray(points)) rows.push(...points);
      }
    }
    if (rows.length) return rows;
  }
  throw new Error('invalid_format');
}

export function parseHealthImportFile(text: string): HealthImportRow[] {
  const trimmed = text.trim();
  if (!trimmed) throw new Error('invalid_format');

  // CSV: date,type,durationMin,distanceKm,notes
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
    return parseHealthImportCsv(trimmed);
  }

  const parsed = JSON.parse(trimmed) as unknown;
  const rawRows = extractRowArray(parsed);
  const rows: HealthImportRow[] = [];
  for (const raw of rawRows) {
    const coerced = coerceHealthImportRow(raw);
    if (coerced) rows.push(coerced);
  }
  return rows;
}

/** CSV header: date,type,durationMin,distanceKm,notes (header optional if first col looks like a date). */
export function parseHealthImportCsv(text: string): HealthImportRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) return [];

  const split = (line: string) => {
    const cells: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
        continue;
      }
      if (ch === ',' && !inQuotes) {
        cells.push(cur.trim());
        cur = '';
        continue;
      }
      cur += ch;
    }
    cells.push(cur.trim());
    return cells;
  };

  let start = 0;
  const first = split(lines[0]).map((c) => c.toLowerCase());
  const hasHeader = first[0] === 'date' || first.includes('durationmin') || first.includes('type');
  if (hasHeader) start = 1;

  const rows: HealthImportRow[] = [];
  for (let i = start; i < lines.length; i++) {
    const cells = split(lines[i]);
    const date = cells[0];
    if (!date) continue;
    rows.push({
      date,
      type: cells[1] || undefined,
      durationMin: cells[2] ? Number(cells[2]) : undefined,
      distanceKm: cells[3] ? Number(cells[3]) : undefined,
      notes: cells[4] || undefined,
    });
  }
  return rows;
}

export const HEALTH_IMPORT_SAMPLE = `[
  { "date": "2026-07-01", "type": "walk", "durationMin": 35, "distanceKm": 3.2, "notes": "Morning walk" },
  { "date": "2026-07-01", "type": "run", "durationMin": 22, "distanceKm": 4.1 }
]`;

export const HEALTH_IMPORT_CSV_SAMPLE = `date,type,durationMin,distanceKm,notes
2026-07-01,walk,35,3.2,Morning walk
2026-07-01,run,22,4.1,`;
