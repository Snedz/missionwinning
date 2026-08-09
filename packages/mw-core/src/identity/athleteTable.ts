/**
 * The MySpace interests table, retrained for training (IDENTITY_SOCIAL_PLAN §3).
 *
 * Picks-from-sets only — no free text on any public-bound field (C5). Anthem is
 * deliberately omitted in v1: a free URL is rights + XSS surface; a curated
 * licensed list is a design/legal decision. Add a row later without changing
 * the resolve shape.
 *
 * Pure catalog + clamp so Android and web cannot drift on which answers exist.
 */

export const ATHLETE_TABLE_ROWS = [
  {
    id: 'trainingStyle',
    picks: ['strength', 'hybrid', 'conditioning', 'bodyweight', 'power'] as const,
  },
  {
    id: 'homeGym',
    picks: [
      'full-gym',
      'rack-bars',
      'dumbbells',
      'bands',
      'bodyweight-only',
      'travel',
    ] as const,
  },
  {
    id: 'goToLift',
    picks: [
      'squat',
      'deadlift',
      'bench',
      'press',
      'pull-up',
      'row',
      'other-compound',
    ] as const,
  },
  {
    id: 'workingOn',
    picks: [
      'strength',
      'hypertrophy',
      'conditioning',
      'skill',
      'consistency',
      'comeback',
    ] as const,
  },
] as const;

export type AthleteTableRowId = (typeof ATHLETE_TABLE_ROWS)[number]['id'];

export type AthleteTablePicks = {
  readonly [K in AthleteTableRowId]?: string | null;
};

const PICKS_BY_ROW: Record<AthleteTableRowId, ReadonlySet<string>> = Object.fromEntries(
  ATHLETE_TABLE_ROWS.map((row) => [row.id, new Set<string>(row.picks)])
) as Record<AthleteTableRowId, ReadonlySet<string>>;

const ROW_IDS = new Set<string>(ATHLETE_TABLE_ROWS.map((r) => r.id));

export function isAthleteTableRowId(value: string): value is AthleteTableRowId {
  return ROW_IDS.has(value);
}

export function picksForRow(rowId: AthleteTableRowId): readonly string[] {
  const row = ATHLETE_TABLE_ROWS.find((r) => r.id === rowId);
  return row ? [...row.picks] : [];
}

/**
 * Clamp a stored table to known rows and picks. Unknown keys dropped; bad picks
 * become null (unset) rather than inventing a default that pretends the athlete
 * answered.
 */
export function resolveAthleteTablePicks(raw: unknown): AthleteTablePicks {
  if (!raw || typeof raw !== 'object') return {};
  const src = raw as Record<string, unknown>;
  const out: { [K in AthleteTableRowId]?: string | null } = {};

  for (const row of ATHLETE_TABLE_ROWS) {
    if (!(row.id in src)) continue;
    const value = src[row.id];
    if (value === null || value === undefined || value === '') {
      out[row.id] = null;
      continue;
    }
    if (typeof value !== 'string') {
      out[row.id] = null;
      continue;
    }
    out[row.id] = PICKS_BY_ROW[row.id].has(value) ? value : null;
  }

  return out;
}

/** How many rows the athlete has actually answered (non-null pick). */
export function athleteTableFilledCount(picks: AthleteTablePicks): number {
  let n = 0;
  for (const row of ATHLETE_TABLE_ROWS) {
    const v = picks[row.id];
    if (typeof v === 'string' && v.length > 0) n += 1;
  }
  return n;
}
