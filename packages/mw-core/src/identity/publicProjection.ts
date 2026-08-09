/**
 * Athlete public projection DTO — C5 preparation (S4 surface later).
 *
 * Free text never reaches another screen. This builder only accepts picks and
 * derived numbers; the key set is closed and tested. No workout log rows.
 *
 * Cloud URL / share-page wiring is S4 (CLUB C2). The pure shape ships now so
 * UI and Android cannot invent a second public schema.
 */

import { clampCallSignNumber, formatCallSignNumber } from './athleteCard';
import {
  resolveAthleteTablePicks,
  type AthleteTablePicks,
  type AthleteTableRowId,
  ATHLETE_TABLE_ROWS,
} from './athleteTable';
import { resolvePageKitId } from './pageKits';

/** Closed key set — a test asserts projection objects only use these. */
export const ATHLETE_PUBLIC_PROJECTION_KEYS = [
  'callSign',
  'callSignNumber',
  'callSignNumberLabel',
  'kitId',
  'table',
  'badgeIds',
  'rankTitle',
  'tier',
] as const;

export type AthletePublicProjectionKey = (typeof ATHLETE_PUBLIC_PROJECTION_KEYS)[number];

export interface AthletePublicProjection {
  /** Validated display name; empty string if unset (caller may hide). */
  callSign: string;
  /** 0–99 or null. */
  callSignNumber: number | null;
  /** Zero-padded label when number set; null otherwise. */
  callSignNumberLabel: string | null;
  kitId: string;
  /** Only rows with a non-null pick — never free text. */
  table: AthleteTablePicks;
  /** Owned badge ids the athlete chose to show (already clamped elsewhere). */
  badgeIds: readonly string[];
  /** Civilian rank title for display — derived, not authored free text. */
  rankTitle: string;
  tier: 1 | 2 | 3 | 4;
}

export interface BuildAthletePublicProjectionInput {
  callSign: string;
  callSignNumber?: number | null;
  kitId?: string | null;
  table?: unknown;
  /** Badge ids already filtered to owned + shelf picks. */
  badgeIds?: readonly string[];
  rankTitle?: string;
  level?: number;
  tier?: 1 | 2 | 3 | 4;
}

function clampTier(level: number, tier?: 1 | 2 | 3 | 4): 1 | 2 | 3 | 4 {
  if (tier === 1 || tier === 2 || tier === 3 || tier === 4) return tier;
  if (!Number.isFinite(level) || level < 3) return 1;
  if (level < 6) return 2;
  if (level < 9) return 3;
  return 4;
}

/**
 * Build the only object that may leave the device as a public Athlete Page.
 * Strips unknown table keys and free-text fields by construction.
 */
export function buildAthletePublicProjection(
  input: BuildAthletePublicProjectionInput
): AthletePublicProjection {
  const callSign =
    typeof input.callSign === 'string' ? input.callSign.trim().slice(0, 24) : '';
  const callSignNumber = clampCallSignNumber(input.callSignNumber);
  const level = typeof input.level === 'number' ? input.level : 1;
  const tier = clampTier(level, input.tier);
  const kitId = resolvePageKitId(input.kitId, tier);
  const tableRaw = resolveAthleteTablePicks(input.table ?? {});
  // Drop nulls so the public payload only carries answered rows.
  const table: { [K in AthleteTableRowId]?: string } = {};
  for (const row of ATHLETE_TABLE_ROWS) {
    const v = tableRaw[row.id];
    if (typeof v === 'string' && v.length > 0) table[row.id] = v;
  }
  const badgeIds = (input.badgeIds ?? [])
    .filter((id): id is string => typeof id === 'string' && id.length > 0)
    .slice(0, 4);
  const rankTitle =
    typeof input.rankTitle === 'string' ? input.rankTitle.trim().slice(0, 48) : '';

  return {
    callSign,
    callSignNumber,
    callSignNumberLabel:
      callSignNumber === null ? null : formatCallSignNumber(callSignNumber),
    kitId,
    table,
    badgeIds,
    rankTitle,
    tier,
  };
}

/** Extra keys (e.g. bio) are C5 violations. */
export function publicProjectionExtraKeys(obj: object): string[] {
  const allowed = new Set<string>(ATHLETE_PUBLIC_PROJECTION_KEYS);
  return Object.keys(obj).filter((k) => !allowed.has(k));
}
