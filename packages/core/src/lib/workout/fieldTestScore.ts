/**
 * Field-test points from the published ACFT Scoring Scales (23 March 2022).
 * No interpolation. No invented cut lines. No cohort percentile.
 */

import {
  FIELD_TEST_ACFT_SCALES,
  FIELD_TEST_AGE_BANDS,
  type FieldTestAgeBand,
  type FieldTestScaleColumn,
  type FieldTestScaleEventId,
} from '@/data/fieldTestAcftScales';
import { readJson, remove, writeJson } from '@/lib/storage/safeStorage';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import type { UnitsPref } from '@/lib/units';
import type { FieldTestEventStatus, FieldTestRawEvent } from '@/lib/workout/fieldTest';

export type FieldTestScaleKey = {
  ageBand: FieldTestAgeBand;
  column: FieldTestScaleColumn;
};

export type FieldTestBand =
  | 'unscored'
  | 'below'
  | 'minimum'
  | 'strong'
  | 'maximum';

export type FieldTestScoredEvent = FieldTestRawEvent & {
  points?: number;
  band: FieldTestBand;
};

const KG_TO_LB = 2.2046226218;

export function mdlPounds(displayWeight: number, units: UnitsPref): number {
  if (units === 'metric') return Math.round(displayWeight * KG_TO_LB);
  return Math.round(displayWeight);
}

export function parseFieldTestScaleKey(value: unknown): FieldTestScaleKey | null {
  if (value == null || typeof value !== 'object') return null;
  const rec = value as { ageBand?: unknown; column?: unknown };
  const ageBand = rec.ageBand;
  const column = rec.column;
  if (
    typeof ageBand !== 'string' ||
    !(FIELD_TEST_AGE_BANDS as readonly string[]).includes(ageBand)
  ) {
    return null;
  }
  if (column !== 'm' && column !== 'f') return null;
  return { ageBand: ageBand as FieldTestAgeBand, column };
}

export function readFieldTestScaleKey(): FieldTestScaleKey | null {
  return parseFieldTestScaleKey(readJson<unknown>(STORAGE_KEYS.fieldTestScaleKey, null));
}

export function writeFieldTestScaleKey(key: FieldTestScaleKey | null): boolean {
  if (key == null) {
    remove(STORAGE_KEYS.fieldTestScaleKey);
    return true;
  }
  const parsed = parseFieldTestScaleKey(key);
  if (!parsed) return false;
  return writeJson(STORAGE_KEYS.fieldTestScaleKey, parsed);
}

/**
 * Highest published point row whose threshold the performance meets.
 * Below the last defined row → 0. No interpolation.
 */
export function lookupFieldTestPoints(
  eventId: FieldTestScaleEventId,
  value: number,
  key: FieldTestScaleKey
): number {
  const event = FIELD_TEST_ACFT_SCALES[eventId];
  const rows = event.columns[`${key.ageBand}:${key.column}`];
  if (!rows) return 0;
  for (const [threshold, points] of rows) {
    const met = event.higherIsBetter ? value >= threshold : value <= threshold;
    if (met) return points;
  }
  return 0;
}

export function fieldTestBand(
  points: number | undefined,
  status: FieldTestEventStatus
): FieldTestBand {
  if (status !== 'official' || points == null) return 'unscored';
  if (points >= 90) return 'maximum';
  if (points >= 70) return 'strong';
  if (points >= 60) return 'minimum';
  return 'below';
}

function lookupValue(
  event: FieldTestRawEvent,
  units: UnitsPref
): number | null {
  if (event.raw == null) return null;
  if (event.slot === 'mdl') return mdlPounds(event.raw, units);
  return event.raw;
}

export function scoreFieldTestEvents(
  events: FieldTestRawEvent[],
  scaleKey: FieldTestScaleKey | null,
  units: UnitsPref
): FieldTestScoredEvent[] {
  return events.map((event) => {
    if (event.status !== 'official' || scaleKey == null) {
      return { ...event, band: 'unscored' as const };
    }
    const value = lookupValue(event, units);
    if (value == null) {
      return { ...event, band: 'unscored' as const };
    }
    const points = lookupFieldTestPoints(event.slot, value, scaleKey);
    return {
      ...event,
      points,
      band: fieldTestBand(points, event.status),
    };
  });
}

/** 0–500 only when all five official events have a looked-up score. */
export function fieldTestTotal500(
  events: FieldTestScoredEvent[]
): number | undefined {
  if (events.length !== 5) return undefined;
  let sum = 0;
  for (const event of events) {
    if (event.status !== 'official' || event.points == null) return undefined;
    sum += event.points;
  }
  return sum;
}
