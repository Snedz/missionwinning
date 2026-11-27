/**
 * One optional quiet pillar row on an empty week-strip rest day.
 *
 * Fuel restock, easy walk, or scale/tape. Not a Train Done mark.
 * Empty invents nothing. A second row that day invents nothing.
 */

import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readJson, readRaw, writeJson, writeRaw } from '@/lib/storage/safeStorage';
import { normalizeEntry, saveBodyMetric } from '@/lib/bodyMetrics';
import { canSaveQuietTrack } from '@/lib/quietTrack';
import {
  appendQuietMove,
  decideQuietMove,
  isQuietMoveKind,
  loadQuietMoveLog,
  saveQuietMoveLog,
  type QuietMoveKind,
} from '@/lib/move/quietMove';

export const QUIET_WEEK_ROW_KINDS = ['fuel', 'move', 'track'] as const;

export type QuietWeekRowKind = (typeof QUIET_WEEK_ROW_KINDS)[number];

export type QuietWeekRow = {
  id: string;
  date: string;
  kind: QuietWeekRowKind;
  createdAt: string;
  fuelItem?: string;
  moveKind?: QuietMoveKind;
  minutes?: number;
  distanceKm?: number;
  weightKg?: number;
  waistCm?: number;
};

export type QuietWeekRowInput = {
  kind: string;
  date?: string | null;
  done?: boolean;
  existing?: readonly QuietWeekRow[];
  fuelItem?: string | null;
  moveKind?: string | null;
  minutes?: string | number | null;
  distanceKm?: string | number | null;
  weightKg?: string | number | null;
  waistCm?: string | number | null;
  todayIso: string;
  nowIso: string;
  id: string;
};

const LOCAL_DATE = /^\d{4}-\d{2}-\d{2}$/;

const CHECKOUT_FILLER = new Set([
  'checkout',
  'check out',
  'order now',
]);

export function isQuietWeekRowKind(value: string): value is QuietWeekRowKind {
  return (QUIET_WEEK_ROW_KINDS as readonly string[]).includes(value);
}

export function quietKindForDate(
  rows: readonly QuietWeekRow[],
  date: string
): QuietWeekRowKind | undefined {
  if (!LOCAL_DATE.test(date)) return undefined;
  return rows.find((row) => row.date === date)?.kind;
}

function parsePositiveNumber(raw: string | number | null | undefined): number | undefined {
  if (raw === '' || raw == null) return undefined;
  const n = typeof raw === 'number' ? raw : Number(String(raw).trim().replace(',', '.'));
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return n;
}

function parseFuelItem(raw: string | null | undefined): string | undefined {
  const item = String(raw ?? '').trim().replace(/\s+/g, ' ');
  if (!item) return undefined;
  if (CHECKOUT_FILLER.has(item.toLowerCase())) return undefined;
  return item.slice(0, 80);
}

export function decideQuietWeekRow(input: QuietWeekRowInput): QuietWeekRow | null {
  if (!isQuietWeekRowKind(input.kind)) return null;
  if (input.done) return null;
  if (!input.id.trim() || !input.nowIso.trim()) return null;
  const date = (input.date || input.todayIso || '').trim();
  if (!LOCAL_DATE.test(date)) return null;
  if (quietKindForDate(input.existing ?? [], date)) return null;

  const base: QuietWeekRow = {
    id: input.id.trim(),
    date,
    kind: input.kind,
    createdAt: input.nowIso,
  };

  if (input.kind === 'fuel') {
    const fuelItem = parseFuelItem(input.fuelItem);
    if (fuelItem) base.fuelItem = fuelItem;
    return base;
  }

  if (input.kind === 'move') {
    const moveKind = input.moveKind || 'walk';
    const move = decideQuietMove({
      kind: moveKind,
      minutes: input.minutes,
      distanceKm: input.distanceKm,
      date,
      todayIso: input.todayIso,
      nowIso: input.nowIso,
      id: input.id,
    });
    if (!move) return null;
    base.moveKind = move.kind;
    if (move.minutes != null) base.minutes = move.minutes;
    if (move.distanceKm != null) base.distanceKm = move.distanceKm;
    return base;
  }

  const weightKg = parsePositiveNumber(input.weightKg);
  const waistCm = parsePositiveNumber(input.waistCm);
  const entry = normalizeEntry({
    date,
    ...(weightKg != null ? { weightKg } : {}),
    ...(waistCm != null ? { waistCm } : {}),
  });
  if (!canSaveQuietTrack(entry)) return null;
  if (entry.weightKg != null) base.weightKg = entry.weightKg;
  if (entry.waistCm != null) base.waistCm = entry.waistCm;
  return base;
}

export function parseQuietWeekRows(raw: unknown): QuietWeekRow[] {
  if (!Array.isArray(raw)) return [];
  const out: QuietWeekRow[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const rec = item as Record<string, unknown>;
    const row = decideQuietWeekRow({
      kind: typeof rec.kind === 'string' ? rec.kind : '',
      date: typeof rec.date === 'string' ? rec.date : '',
      fuelItem: typeof rec.fuelItem === 'string' ? rec.fuelItem : null,
      moveKind: typeof rec.moveKind === 'string' ? rec.moveKind : null,
      minutes: rec.minutes as string | number | null,
      distanceKm: rec.distanceKm as string | number | null,
      weightKg: rec.weightKg as string | number | null,
      waistCm: rec.waistCm as string | number | null,
      todayIso: typeof rec.date === 'string' ? rec.date : '',
      nowIso: typeof rec.createdAt === 'string' ? rec.createdAt : '',
      id: typeof rec.id === 'string' ? rec.id : '',
    });
    if (row) out.push(row);
  }
  return out;
}

export function appendQuietWeekRow(
  rows: readonly QuietWeekRow[],
  row: QuietWeekRow
): QuietWeekRow[] {
  if (quietKindForDate(rows, row.date)) return [...rows];
  return [row, ...rows];
}

export function loadQuietWeekRows(): QuietWeekRow[] {
  return parseQuietWeekRows(readJson<unknown>(STORAGE_KEYS.quietWeekRows, []));
}

export function saveQuietWeekRows(rows: readonly QuietWeekRow[]): void {
  writeJson(STORAGE_KEYS.quietWeekRows, rows);
}

function appendTypedRestockItem(item: string): void {
  const prev = (readRaw(STORAGE_KEYS.fuelRestockExtras) ?? '').trim();
  writeRaw(STORAGE_KEYS.fuelRestockExtras, prev ? `${prev}\n${item}` : item);
}

function writeThrough(row: QuietWeekRow): void {
  if (row.kind === 'fuel' && row.fuelItem) {
    appendTypedRestockItem(row.fuelItem);
    return;
  }
  if (row.kind === 'move' && row.moveKind && isQuietMoveKind(row.moveKind)) {
    const move = decideQuietMove({
      kind: row.moveKind,
      minutes: row.minutes,
      distanceKm: row.distanceKm,
      date: row.date,
      todayIso: row.date,
      nowIso: row.createdAt,
      id: row.id,
    });
    if (!move) return;
    saveQuietMoveLog(appendQuietMove(loadQuietMoveLog(), move));
    return;
  }
  if (row.kind === 'track') {
    const entry = normalizeEntry({
      date: row.date,
      weightKg: row.weightKg,
      waistCm: row.waistCm,
    });
    if (canSaveQuietTrack(entry)) saveBodyMetric(entry);
  }
}

/** Persist one rest-day row. Additive. Not a journey day. */
export function persistQuietWeekRow(row: QuietWeekRow): QuietWeekRow | null {
  const existing = loadQuietWeekRows();
  if (quietKindForDate(existing, row.date)) return null;
  const next = appendQuietWeekRow(existing, row);
  saveQuietWeekRows(next);
  writeThrough(row);
  return row;
}
