/**
 * Quiet Move — optional rest-day walk / easy session.
 *
 * Own diary. Not a Train day. Not a Track feed. Not a ring.
 */

import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readJson, writeJson } from '@/lib/storage/safeStorage';

export const QUIET_MOVE_KINDS = ['walk', 'easy'] as const;

export type QuietMoveKind = (typeof QUIET_MOVE_KINDS)[number];

export type QuietMoveRow = {
  id: string;
  date: string;
  kind: QuietMoveKind;
  minutes?: number;
  distanceKm?: number;
  createdAt: string;
};

export type QuietMoveInput = {
  kind: string;
  minutes?: string | number | null;
  distanceKm?: string | number | null;
  date?: string | null;
  todayIso: string;
  nowIso: string;
  id: string;
};

const LOCAL_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isQuietMoveKind(value: string): value is QuietMoveKind {
  return (QUIET_MOVE_KINDS as readonly string[]).includes(value);
}

function parsePositiveNumber(raw: string | number | null | undefined): number | undefined {
  if (raw === '' || raw == null) return undefined;
  const n = typeof raw === 'number' ? raw : Number(String(raw).trim().replace(',', '.'));
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return n;
}

export function parseQuietMoveMinutes(
  raw: string | number | null | undefined
): number | undefined {
  const n = parsePositiveNumber(raw);
  if (n == null) return undefined;
  return Math.round(n);
}

export function parseQuietMoveDistanceKm(
  raw: string | number | null | undefined
): number | undefined {
  const n = parsePositiveNumber(raw);
  if (n == null) return undefined;
  return Math.round(n * 100) / 100;
}

export function decideQuietMove(input: QuietMoveInput): QuietMoveRow | null {
  if (!isQuietMoveKind(input.kind)) return null;
  if (!input.id.trim() || !input.nowIso.trim()) return null;
  const date = (input.date || input.todayIso || '').trim();
  if (!LOCAL_DATE.test(date)) return null;

  const row: QuietMoveRow = {
    id: input.id.trim(),
    date,
    kind: input.kind,
    createdAt: input.nowIso,
  };
  const minutes = parseQuietMoveMinutes(input.minutes);
  const distanceKm = parseQuietMoveDistanceKm(input.distanceKm);
  if (minutes != null) row.minutes = minutes;
  if (distanceKm != null) row.distanceKm = distanceKm;
  return row;
}

export function parseQuietMoveLog(raw: unknown): QuietMoveRow[] {
  if (!Array.isArray(raw)) return [];
  const out: QuietMoveRow[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const rec = item as Record<string, unknown>;
    if (typeof rec.id !== 'string' || !rec.id) continue;
    if (typeof rec.kind !== 'string' || !isQuietMoveKind(rec.kind)) continue;
    if (typeof rec.date !== 'string' || !LOCAL_DATE.test(rec.date)) continue;
    if (typeof rec.createdAt !== 'string' || !rec.createdAt) continue;
    const row: QuietMoveRow = {
      id: rec.id,
      date: rec.date,
      kind: rec.kind,
      createdAt: rec.createdAt,
    };
    const minutes = parseQuietMoveMinutes(rec.minutes as string | number | null);
    const distanceKm = parseQuietMoveDistanceKm(rec.distanceKm as string | number | null);
    if (minutes != null) row.minutes = minutes;
    if (distanceKm != null) row.distanceKm = distanceKm;
    out.push(row);
  }
  return out;
}

export function listQuietMoveForDate(
  rows: readonly QuietMoveRow[],
  date: string
): QuietMoveRow[] {
  if (!LOCAL_DATE.test(date)) return [];
  return rows.filter((row) => row.date === date);
}

export function appendQuietMove(
  rows: readonly QuietMoveRow[],
  row: QuietMoveRow
): QuietMoveRow[] {
  return [row, ...rows];
}

export function loadQuietMoveLog(): QuietMoveRow[] {
  return parseQuietMoveLog(readJson<unknown>(STORAGE_KEYS.quietMoveLog, []));
}

export function saveQuietMoveLog(rows: readonly QuietMoveRow[]): void {
  writeJson(STORAGE_KEYS.quietMoveLog, rows);
}

export function logQuietMove(input: QuietMoveInput): QuietMoveRow | null {
  const row = decideQuietMove(input);
  if (!row) return null;
  saveQuietMoveLog(appendQuietMove(loadQuietMoveLog(), row));
  return row;
}
